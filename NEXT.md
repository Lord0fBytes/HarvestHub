# Next

## Current baseline

- Source release: [v1.2.2](https://gitea.massedonia.com/lordofbytes/HarvestHub/releases/tag/v1.2.2), hosted in Gitea.
- Planning, Shopping, Review, and All Items are implemented with PostgreSQL persistence and a Docker deployment.
- `npm run build` passes. Changed files pass targeted ESLint checks. Full repository lint and automated test coverage remain to be addressed.
- The PWA is installable, but offline shopping is not supported in the current scope.
- The deployment is pinned to the GHCR v1.2.1 image. The GitHub Actions workflow can publish v1.2.2; verify the image before changing the deployment pin.

## Next work

1. Validate Review completion against the production database: [issue #9](https://gitea.massedonia.com/lordofbytes/HarvestHub/issues/9).
2. Propagate failed item writes to callers and prevent false success messages: [issue #11](https://gitea.massedonia.com/lordofbytes/HarvestHub/issues/11).
3. Resolve the remaining lint findings, then add focused tests for item mutations and Review completion.
4. Publish and verify the `v1.2.2` and `latest` images in GHCR. Keep deployments pinned to a verified version.

## Later ideas already tracked

- [Issue #10](https://gitea.massedonia.com/lordofbytes/HarvestHub/issues/10): API integration for external clients.

Offline shopping is deferred.
