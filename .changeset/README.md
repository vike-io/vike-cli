# Changesets

This folder holds [Changesets](https://github.com/changesets/changesets) entries that describe pending version bumps.

To add one:

```bash
npx changeset
```

Pick the bump (patch / minor / major), write a one-line summary, commit the resulting `.md` file. On the next push to `main`, the release workflow either opens a "Version Packages" PR or — once merged — publishes to npm.
