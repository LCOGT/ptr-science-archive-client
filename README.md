# LCO Science Archive Client / Data Inspector
# MODIFIED for use by PTR

A user-friendly frontend interface to an OCS Science Archive written in [Vue](https://vuejs.org/).

## Usage

This repository presents a frontend largely based off of Las Cumbres Observatory's [Science Archive](https://archive.lco.global), with configurable external service URLs and a set of frontend customizations. Users who wish to use the frontend as-is may minimally customize the frontend using environment variables.

For users who wish to further customize the layout and functionality of their archive frontend, we recommend forking this project and overriding logic where necessary.

## Data Inspector

LCO has added additional customizations to this base OCS Science Archive client in provide staff users additional data monitoring and inspection tools. Staff users (denoted by the is_staff flag in their Observation Portal account profile) will be provided these tools. They are opt-in by default, and can be enabled in the login menu.

## Prerequesites:
* An OCS [Science Archive](https://github.com/observatorycontrolsystem/science-archive/)
* An OCS [Observation Portal](https://github.com/observatorycontrolsystem/observation-portal/)
* An OCS [Simbad2k Service](https://github.com/observatorycontrolsystem/simbad2k) for catalog lookups
* An OCS [Thumbnail Service](https://github.com/observatorycontrolsystem/thumbnail-service) to generate JPEG thumbnails from data products

## Environment variables

The following environment variables can be used to configure your specific science-archive client instance.

### External Services (**Required to be set**)
| Variable                              | Description                           | Default                 |
| ------------------------------------- | ------------------------------------- | ----------------------- |
| `VUE_APP_OBSERVATION_PORTAL_API_URL`  | Observation portal API URL            | `http://127.0.0.1:8000` |
| `VUE_APP_ARCHIVE_API_URL`             | Archive API URL                       | `http://127.0.0.1:9500` |
| `VUE_APP_SIMBAD_SERVICE_URL`          | Simbad service URL                    | `http://127.0.0.1:9800` |
| `VUE_APP_THUMBNAIL_SERVICE_URL`       | Thumbnail service URL                 | `http://127.0.0.1:8500` |
### Links and frontend Customizations
| Variable                              | Description                           | Default                 |
| ------------------------------------- | ------------------------------------- | ----------------------- |
| `VUE_APP_NAVBAR_BRAND_URL`            | URL link embedded in navbar brand image | _empty string_ |
| `VUE_APP_BRAND_IMAGE_LARGE`           | Image URL for brand image (large version) | _empty string_ |
| `VUE_APP_BRAND_IMAGE_SMALL`           | Image URL for brand image (small version) | _empty string_ |
| `VUE_APP_BRAND_IMAGE_ALT_TEXT`        | Alt text for brand image | "Brand Image"  |
| `VUE_APP_DOCUMENTATION_URL`           | URL for organization's archive/data specification documentation | `https://observatorycontrolsystem.github.io/integration/data_flow/` |
| `VUE_APP_ORGANIZATION_HOMEPAGE_URL`  | Link to organization's homepage | _empty string_ |
| `VUE_APP_ORGANIZATION_HOMEPAGE_TEXT`  | Text for link to organization's homepage | 'Organization Home' |
| `VUE_APP_COPYRIGHT_ORGANIZATION`      | Organization to cite in the copyright text | 'Organization' |
| `VUE_APP_TERMS_OF_SERVICE_URL`        | URL for organization's terms of service | _empty string_ |
| `VUE_APP_PRIVACY_POLICY_URL`          | URL for organization's privacy policy | _empty string_ |
| `VUE_APP_FEEDBACK_EMAIL`              | Organization email for user feedback | `mailto:support@organization.com`
| `VUE_APP_GITHUB_API_URL`              | URL for GitHub API source code repository | `https://github.com/observatorycontrolsystem/science-archive`
| `VUE_APP_API_DOCUMENTATION_URL`       | URL for organization's Archive API documentation | `https://observatorycontrolsystem.github.io/api/science_archive/`
| `VUE_APP_GENERAL_DOCUMENTATION_URL`   | URL for organization's top-level user documentation | `https://observatorycontrolsystem.github.io/`
| `VUE_APP_REDUCTION_LEVEL_OPTIONS`     | Key/value mapping from numeric reduction level to human-readable reduction level | '{"0": "Raw", "10": "Processed"}'
| `VUE_APP_NETWORK_MONITORING_PORTAL_URL`     | Network monitoring portal URL for staff view (data inspector) | https://sites.google.com/lco.global/docs/netmon
| `VUE_APP_ROGUES_GALLERY_URL`     | Rogue's Gallery URL for staff view (data inspector) | https://sites.google.com/lco.global/docs/netmon/heroes-and-rogues


#### A note about Docker runtime configuration:

When running this project via Docker, the values environment variables listed above will automatically be added to the `config/config.json` for runtime configuration. This is due to the fact that when running this application in Docker, the `VUE_APP...` environment variables are not passed to the application, since nginx is being used and node is not responsible for serving the files. Please note that if an environment variable is added, then it will also need to be added to the list in `docker/entrypoint.sh`.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints files and prints out lint errors
```
npm run lint:check
```

### Lints and fixes files
```
npm run lint:fix
```
