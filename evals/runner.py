# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "anthropic>=0.50",
#     "pyyaml>=6.0",
# ]
# ///

"""A/B harness for vike-cli skills.

Measures whether including SKILL.md files in the prompt actually improves
an LLM's command picks vs. providing only `vike --help`.

Run:
    uv run --script evals/runner.py

Requires ANTHROPIC_API_KEY in the env.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

import yaml
from anthropic import Anthropic

ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = ROOT / "skills"
QUESTIONS_FILE = ROOT / "evals" / "questions.yaml"
RESULTS_DIR = ROOT / "evals" / "results"
MODEL = os.environ.get("VIKE_EVAL_MODEL", "claude-sonnet-4-5")


def vike_help() -> str:
    """Capture `vike --help` and all subcommand --help outputs."""
    out = subprocess.check_output(
        ["node", str(ROOT / "src" / "index.js"), "--help"],
        text=True, env={**os.environ, "CI": "1", "VIKE_NO_TELEMETRY": "1"},
    )
    # Walk top-level subcommands and append their --help too
    for line in out.splitlines():
        m = re.match(r"^\s+([a-z][a-z0-9-]*)\s+", line)
        if not m:
            continue
        sub = m.group(1)
        try:
            sub_out = subprocess.check_output(
                ["node", str(ROOT / "src" / "index.js"), sub, "--help"],
                text=True, env={**os.environ, "CI": "1", "VIKE_NO_TELEMETRY": "1"},
            )
            out += f"\n\n--- vike {sub} --help ---\n{sub_out}"
        except subprocess.CalledProcessError:
            continue
    return out


def all_skills_text() -> str:
    """Concatenate every SKILL.md in the bundle."""
    parts = []
    for d in sorted(SKILLS_DIR.iterdir()):
        skill = d / "SKILL.md"
        if skill.exists():
            parts.append(f"=== {d.name} ===\n{skill.read_text()}\n")
    return "\n".join(parts)


def ask_model(client: Anthropic, system: str, question: str) -> str:
    resp = client.messages.create(
        model=MODEL,
        max_tokens=400,
        system=system,
        messages=[{"role": "user", "content": question}],
    )
    return resp.content[0].text


def score(answer: str, expected_command: str, expected_flags: list[str], forbidden: list[str]) -> float:
    """0–1 score. Zeroed if any forbidden fragment appears."""
    ans = answer.lower()
    for f in forbidden:
        if f.lower() in ans:
            return 0.0
    cmd_hit = expected_command.lower() in ans
    if not cmd_hit:
        return 0.0
    if not expected_flags:
        return 1.0
    hits = sum(1 for f in expected_flags if f.lower() in ans)
    # 0.4 base for naming the right command, scale remaining 0.6 by flag coverage
    return 0.4 + 0.6 * (hits / len(expected_flags))


def main() -> int:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("error: set ANTHROPIC_API_KEY", file=sys.stderr)
        return 1

    client = Anthropic()
    questions = yaml.safe_load(QUESTIONS_FILE.read_text())["questions"]

    help_text = vike_help()
    skills_text = all_skills_text()

    system_a = (
        "You are a helpful CLI assistant. Answer questions about how to use "
        "the vike CLI. Only respond with the shell command the user should "
        "run; do not explain. Here is the full help output:\n\n" + help_text
    )
    system_b = system_a + "\n\n--- Skill bundle ---\n\n" + skills_text

    rows = []
    sum_a, sum_b, n = 0.0, 0.0, 0
    for q in questions:
        text = q["q"]
        exp_cmd = q["expected_command"]
        exp_flags = q.get("expected_flags", [])
        forbidden = q.get("forbidden", [])

        try:
            ans_a = ask_model(client, system_a, text)
            ans_b = ask_model(client, system_b, text)
        except Exception as exc:
            print(f"  model error: {exc}", file=sys.stderr)
            continue
        s_a = score(ans_a, exp_cmd, exp_flags, forbidden)
        s_b = score(ans_b, exp_cmd, exp_flags, forbidden)
        sum_a += s_a
        sum_b += s_b
        n += 1
        delta = s_b - s_a
        marker = "+" if delta > 0 else ("=" if delta == 0 else "-")
        rows.append({
            "q": text, "expected_command": exp_cmd,
            "answer_a": ans_a.strip(), "answer_b": ans_b.strip(),
            "score_a": round(s_a, 2), "score_b": round(s_b, 2),
            "delta": round(delta, 2),
        })
        print(f"  {marker} {text[:60]:62s}  A={s_a:.2f}  B={s_b:.2f}  Δ={delta:+.2f}")

    print()
    if n == 0:
        print("no questions scored")
        return 1
    avg_a = sum_a / n
    avg_b = sum_b / n
    avg_delta = avg_b - avg_a
    print(f"  Average: A={avg_a:.2f}  B={avg_b:.2f}  Δ={avg_delta:+.2f}  ({n} questions)")
    print()
    if avg_delta < 0.30:
        print(f"  ⚠ delta below ship floor (0.30)")
    else:
        print(f"  ✓ delta meets ship floor (>= 0.30)")

    RESULTS_DIR.mkdir(exist_ok=True)
    stamp = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    out_file = RESULTS_DIR / f"{stamp}.json"
    out_file.write_text(json.dumps({
        "model": MODEL, "n": n,
        "avg_a": round(avg_a, 4), "avg_b": round(avg_b, 4),
        "delta": round(avg_delta, 4),
        "rows": rows,
    }, indent=2))
    print(f"  results: {out_file.relative_to(ROOT)}")
    return 0 if avg_delta >= 0.30 else 2


if __name__ == "__main__":
    sys.exit(main())
