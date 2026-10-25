# HarvestHub Roadmap

## Shipped

- **v1.0.x:** Planning, Shopping, Review, and All Items workflows; PostgreSQL persistence; Docker deployment and backups.
- **v1.2.0:** Warm dark visual overhaul across the app ([completed issue #6](https://gitea.massedonia.com/lordofbytes/HarvestHub/issues/6)).
- **v1.2.1:** Refined New Item form, quick-select Stores and Lists, terminology, and app icon.
- **v1.2.2:** Planning search clear button and responsive layout, mobile pull-to-refresh, and Review completion for purchased and skipped items ([#7](https://gitea.massedonia.com/lordofbytes/HarvestHub/issues/7), [#8](https://gitea.massedonia.com/lordofbytes/HarvestHub/issues/8), [#9](https://gitea.massedonia.com/lordofbytes/HarvestHub/issues/9)).

The current source release is [v1.2.2](https://gitea.massedonia.com/lordofbytes/HarvestHub/releases/tag/v1.2.2). Its `1.2.2` and `latest` images are published to GHCR.

## Next release candidates

- Failed item updates are shown to the user and never reported as successful ([#11](https://gitea.massedonia.com/lordofbytes/HarvestHub/issues/11)).
- Lint passes, critical item flows have focused tests, and release checks run before image publishing.
- Container publishing is verified against Gitea before a new version is advertised.

## Backlog

- Define an external API for other clients ([#10](https://gitea.massedonia.com/lordofbytes/HarvestHub/issues/10)).
- Consider trip history, recipes, and meal planning after the current shopping workflow is stable.

Offline shopping is not planned for the current release cycle. The app may be installed on a device, but current shopping data and changes require a connection to the server.
