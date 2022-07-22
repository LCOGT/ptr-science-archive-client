# Science Archive Client

A user-friendly frontend interface to an OCS Science Archive.

## Prerequesites:
* An OCS [Science Archive](https://github.com/observatorycontrolsystem/science-archive/)
* An OCS [Observation Portal](https://github.com/observatorycontrolsystem/observation-portal/)
* An OCS [Simbad2k Service](https://github.com/observatorycontrolsystem/simbad2k) for catalog lookups
* An OCS [Thumbnail Service](https://github.com/observatorycontrolsystem/thumbnail-service) to generate JPEG thumbnails from data products

## Environment variables

The following environment variables can be used to configure your specific science-archive client instance.

| Variable                              | Description                           | Default                 |
| ------------------------------------- | ------------------------------------- | ----------------------- |
| `VUE_APP_OBSERVATION_PORTAL_API_URL`  | Observation portal API URL            | `http://127.0.0.1:8000` |
| `VUE_APP_ARCHIVE_API_URL`             | Archive API URL                       | `http://127.0.0.1:8000` |
| `VUE_APP_SIMBAD_SERVICE_URL`          | Simbad service URL                    | `http://127.0.0.1:8000` |
| `VUE_APP_THUMBNAIL_SERVICE_URL`       | Thumbnail service URL                 | `http://127.0.0.1:8000` |
| `VUE_APP_NAVBAR_BRAND_URL`            | URL link embedded in navbar brand image | `http://127.0.0.1:8000` |
| `VUE_APP_BRAND_IMAGE_LARGE`           | Image URL for brand image (large version) | `http://127.0.0.1:8000` |
| `VUE_APP_BRAND_IMAGE_SMALL`           | Image URL for brand image (small version) | `http://127.0.0.1:8000` |
| `VUE_APP_BRAND_IMAGE_ALT_TEXT`        | Alt text for brand image | "Brand Image"  |
| `VUE_APP_DOCUMENTATION_URL`           | URL for organization's archive documentation | `http://127.0.0.1:8000` |
| `VUE_APP_ORGANIZATION_HOMEPAGE_LINK`  | Link to organization's homepage | `http://127.0.0.1:8000` |
| `VUE_APP_ORGANIZATION_HOMEPAGE_TEXT`  | Text for link to organization's homepage | 'Organization Home' |
| `VUE_APP_COPYRIGHT_ORGANIZATION`      | Organization to cite in the copyright text | 'Organization' |
| `VUE_APP_TERMS_OF_SERVICE_URL`        | URL for organization's terms of service | `http://127.0.0.1:8000` |
| `VUE_APP_PRIVACY_POLICY_URL`          | URL for organization's privacy policy | `http://127.0.0.1:8000` |
| `VUE_APP_FEEDBACK_EMAIL`              | Organization email for user feedback | 'mailto:support@organization.com'
| `VUE_APP_GITHUB_API_URL`              | URL for GitHub API source code repository | 'https://github.com/observatorycontrolsystem/science-archive'
| `VUE_APP_API_DOCUMENTATION_URL`       | URL for organization's API documentation | 'http://127.0.0.1:8000'
| `VUE_APP_GENERAL_DOCUMENTATION_URL`   | URL for organization's top-level documentation | 'http://127.0.0.1:8000'
| `VUE_APP_REDUCTION_LEVEL_OPTIONS`     | List of integer reduction level (RLEVEL) options to be presented in the frontend | '[0]'

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
