# Building from local clones

By default, `docker compose` builds the backend and frontend from GitHub (see `BE_REPO`/`BE_BRANCH` and `FE_REPO`/`FE_BRANCH` in the [README](../README.md)). If you are working on changes that are not pushed yet, you can build from your **local clones** of [Edirom-Online-Backend](https://github.com/Edirom/Edirom-Online-Backend) and/or [Edirom-Online-Frontend](https://github.com/Edirom/Edirom-Online-Frontend) instead.

This is optional. The default setup (`docker compose up`) is not affected.

## How it works

Two additional compose files replace the source of the existing services. Everything else (container names, ports, edition, image server) stays as in `docker-compose.yml`:

| File | Effect | Required variable |
|---|---|---|
| `docker-compose.local-backend.yml` | builds the backend from your local clone (`backend/Dockerfile.local`) | `BE_LOCAL_SOURCE` |
| `docker-compose.local-frontend.yml` | builds the frontend from your local clone (`frontend/Dockerfile.local`) | `FE_LOCAL_SOURCE` |

Your local clone is copied into the image as it is on disk, including uncommitted changes, on whatever branch is checked out.

## Usage

Run the commands in your clone of this repository (Edirom-Online). Replace the paths with the location of your local clones.

**Local backend, frontend from GitHub:**

```bash
export BE_LOCAL_SOURCE=/path/to/Edirom-Online-Backend
docker compose -f docker-compose.yml -f docker-compose.local-backend.yml up --build
```

**Local frontend, backend from GitHub:**

```bash
export FE_LOCAL_SOURCE=/path/to/Edirom-Online-Frontend
docker compose -f docker-compose.yml -f docker-compose.local-frontend.yml up --build
```

**Both local:**

```bash
export BE_LOCAL_SOURCE=/path/to/Edirom-Online-Backend
export FE_LOCAL_SOURCE=/path/to/Edirom-Online-Frontend
docker compose -f docker-compose.yml -f docker-compose.local-backend.yml -f docker-compose.local-frontend.yml up --build
```

On Windows, use `set` instead of `export`.

All other variables from the README (`EDITION_XAR`, `BE_PORT`, `FE_PORT`, `WS_URL`, …) work as usual. `BE_REPO`, `BE_BRANCH`, `FE_REPO` and `FE_BRANCH` are ignored for the service built from a local clone.

## Notes

- **Rebuild after changes:** the image contains a copy of your clone at build time. After changing code, run the same command again (with `--build`).
- **Frontend submodules:** the frontend needs its web component submodules. In your local frontend clone, run `git submodule update --init --recursive` once (and after submodule updates).
- **Missing variable:** if `BE_LOCAL_SOURCE` or `FE_LOCAL_SOURCE` is not set, Docker Compose stops with a message naming the missing variable.
- **Check the configuration:** append `config` instead of `up --build` to see the resulting setup, e.g. `docker compose -f docker-compose.yml -f docker-compose.local-backend.yml config`.
