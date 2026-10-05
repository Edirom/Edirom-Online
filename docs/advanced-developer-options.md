# Advanced Developer Options

This document covers advanced configuration options for developers working on the development of Edirom-Online-Backend or Edirom-Online-Frontend with the Edirom Online Docker Compose setup.

## Prerequisites

### Docker BuildKit

The builder image uses BuildKit features for optimized caching of build dependencies. BuildKit is enabled by default in Docker Compose v2+, which is required by the `docker compose` command (without hyphen) used throughout this documentation — no manual configuration should be needed on current Docker installations.

**Verify BuildKit is available:**
```bash
docker buildx version
```

The builder image uses BuildKit cache mounts to persist downloads across builds. See [Download Cache](#download-cache) for details on managing this cache, or [Build Failures: BuildKit Not Available](#build-failures-buildkit-not-available) if you encounter related build errors.

## Docker Compose Profiles

Aside from the standard `docker compose --profile default up` command, which runs Edirom Online as described in the [README](../README.md), Edirom Online supports Docker Compose profiles for development scenarios with local source code.

> [!NOTE]
> **Key Benefit: Test before committing and pushing**
>
> The profiles for local frontend and backend source code will allow you to build and run your local changes before committing and pushing them to source control.

### Profile Matrix

The Docker Compose configuration uses profiles to ensure mutual exclusivity between regular and local development services. This prevents port conflicts and ensures only the intended services are running.

| Command | Backend Service | Frontend Service | Also start [Interactive Builder](#interactive-builder-profile) |
|---------|----------------|------------------|---|
| `docker compose --profile default up` | Regular (from remote repo) | Regular (from remote repo) | — |
| `docker compose --profile local-backend up` | **Local** (from `BE_LOCAL_SOURCE`) | Regular (from remote repo) | add `--profile interactive-builder` |
| `docker compose --profile local-frontend up` | Regular (from remote repo) | **Local** (from `FE_LOCAL_SOURCE`) | add `--profile interactive-builder` |
| `docker compose --profile local-fullstack up` | **Local** (from `BE_LOCAL_SOURCE`) | **Local** (from `FE_LOCAL_SOURCE`) | add `--profile interactive-builder` |


**Key Features:**
- **Automatic pairing**: The profiles control which services to start, those based on local sourcec code or the regular services
- **No conflicts**: Regular and local versions of the same service never run simultaneously
- **Port safety**: Prevent port binding conflicts between services

> [!TIP]
> Combine with the [Shared Builder Architecture](#shared-builder-architecture)’s `interactive-builder` which allows to interactively build and deploy changes without restarting the Docker Compose setup.

### Default Profile

The `default`profile starts regular services based on the specified remote repositories and GitHub references. For more details please consult the [README](../README.md).

### Profile for Local Backend Development

The `local-backend` profile facilitates local development of the Edirom-Online-Backend.

> [!NOTE]
>
> **Profile Benefits**
>   
>1. **Building**
>
>    When starting the Docker Compose or when rebuilding the backend service, your local source code of Edirom-Online-Backend will be built and deployed.
>
> 2. **Source Code Mounting**
>
>    Your local source code will be mounted in the [Interactive Builder Profile](#interactive-builder-profile) that offers the shared builder as a service.

_Prerequisites_
* Acquire a local clone of [Edirom Online](https://github.com/Edirom/Edirom-Online.git)
* Acquire a local clone of [Edirom-Online-Backend](https://github.com/Edirom/Edirom-Online-Backend.git)

**Example Development Workflow**
```bash
# Clone the Edirom Online repository locally
git clone https://github.com/Edirom/Edirom-Online.git ~/projects/Edirom-Online

# Clone the Edirom-Online-Backend repository locally
git clone https://github.com/Edirom/Edirom-Online-Backend.git ~/projects/Edirom-Online-Backend

# Switch to the Edirom Online clone
cd ~/projects/Edirom-Online

# Set the backend source path (absolute path recommended)
export BE_LOCAL_SOURCE=~/projects/Edirom-Online-Backend

# Build the shared builder (first time only)
docker compose build edirom-online-builder

# Build and start Edirom Online with local backend
# This will build the backend from your local source code
docker compose --profile local-backend up --build
```

You can rebuild in any way you want, whether natively on your host or by rebuilding the frontend service, for example, using the [Interactive Builder Profile](#interactive-builder-profile).

If you have made changes in your local clone of Edirom-Online-Backend and want to redeploy these after building, please refer to [Deploying Backend Changes](#deploying-backend-changes).

### Profile for Local Frontend Development

The `local-frontend` profile facilitates local development of the Edirom-Online-Frontend.

> [!NOTE]
>
> **Profile Benefits**
>
> 1. **Build Directory Mounting**
>
>    The nginx service will directly serve the build directory of your local Edirom-Online-Frontend clone.
>
> 2. **Live Development**
>
>    When rebuilding the Edirom-Online-Frontend, changes to your local source code will be reflected in the running application.
>
> 3. **Source Code Mounting**
>
>    The Docker Compose setup will mount the `$FE_LOCAL_SOURCE/build` directory of your local frontend clone to `/usr/share/nginx/html/` in the container for live frontend serving; i.e., rebuilds of the frontend will be served directly, without rebuilding the service.
>
>    Moreover, your local source code will be mounted in the [Interactive Builder Profile](#interactive-builder-profile) that offers the shared builder as a service.

_Prerequisites_
* Acquire a local clone of [Edirom Online](https://github.com/Edirom/Edirom-Online.git)
* Acquire a local clone of [Edirom-Online-Frontend](https://github.com/Edirom/Edirom-Online-Frontend.git)

**Example Frontend Development Workflow**
```bash
# Clone the Edirom Online repository locally
git clone https://github.com/Edirom/Edirom-Online.git ~/projects/Edirom-Online

# Clone the Edirom-Online-Frontend repository locally
git clone https://github.com/Edirom/Edirom-Online-Frontend.git ~/projects/Edirom-Online-Frontend

# Switch to the Edirom Online clone
cd ~/projects/Edirom-Online

# Set the frontend source path (absolute path recommended)
export FE_LOCAL_SOURCE=~/projects/Edirom-Online-Frontend

# Build the shared builder (first time only)
docker compose build edirom-online-builder

# Build and start Edirom Online with local frontend
# This will build the frontend from your local source code
docker compose --profile local-frontend up --build
```

You can rebuild in any way you want, whether natively on your host or by rebuilding the frontend service, for example, using the [Interactive Builder Profile](#interactive-builder-profile).

> [!TIP]
>After rebuilding your modified frontend the changes will be reflected in your running Edirom Online because the **local-frontend** profile has the build directory mounted to `/usr/share/nginx/html/` of the running **local-edirom-online-frontend** service.

### Profile for Full Stack Development

The _local-fullstack_ profile facilitates combined development of both frontend and backend. This is especially useful when adding completely new features to Edirom Online that require handling data and GUI components.

> [!IMPORTANT]
>
> **Profile Benefits**
>   Combines the benefits of both, _local-backend_ and _local-frontend_ profiles.

_Prerequisites_
* Acquire a local clone of [Edirom Online](https://github.com/Edirom/Edirom-Online.git)
* Acquire a local clone of [Edirom-Online-Backend](https://github.com/Edirom/Edirom-Online-Backend.git)
* Acquire a local clone of [Edirom-Online-Frontend](https://github.com/Edirom/Edirom-Online-Frontend.git)

**Example Fullstack Development Workflow**
```bash
# Clone all three repositories
git clone https://github.com/Edirom/Edirom-Online.git ~/projects/Edirom-Online
git clone https://github.com/Edirom/Edirom-Online-Frontend.git ~/projects/Edirom-Online-Frontend
git clone https://github.com/Edirom/Edirom-Online-Backend.git ~/projects/Edirom-Online-Backend

# Switch to the Edirom Online clone
cd ~/projects/Edirom-Online

export FE_LOCAL_SOURCE=~/projects/Edirom-Online-Frontend
export BE_LOCAL_SOURCE=~/projects/Edirom-Online-Backend

# Build the shared builder (first time only)
docker compose build edirom-online-builder

# Start both local development services
docker compose --profile local-fullstack up -d --build
```

> [!TIP]
> There’s even more candy when combined with the interactive builder ;-)

## Shared Builder Architecture

Edirom Online defines a shared builder architecture to optimise build times and minimise duplication in the Docker build process. Both the frontend and backend Dockerfiles use it in ther first stages for building; i.e., it serves as the _shared_ base for all builds in the Docker Compose setup. The shared builder is defined in **`builder/Dockerfile`**. Moreover it is used as basis for the [Interactive Builder Profile](#interactive-builder-profile) in the _interactive-edirom-online-builder_ service.

The shared builder provides a build environment containing:

- Java 8 JDK (eclipse-temurin:8-jdk-focal)
- Apache Ant 1.10.12
- SenchaCmd 7.0.0.40 (for frontend builds)
- Build dependencies (curl, sudo, wget, git, unzip)
- Font libraries (libfreetype6, fontconfig)
- Ruby (full installation)
- Development tools (vim, less)

### Download Cache

The builder image uses `RUN --mount=type=cache` to persist downloaded archives (Apache Ant, SenchaCmd) across builds. Normally this is transparent, but occasionally you may need to force a fresh download — for example, if a cached archive is corrupted.

To clear only the download cache without affecting layer caches or image history:

```bash
docker buildx prune --filter type=exec.cachemount
```

This removes only cache mount entries. All other BuildKit caches (intermediate layers, base image layers, etc.) are preserved, so subsequent builds remain fast.

To preview what would be removed before committing:

```bash
docker buildx du --verbose
```

> [!WARNING]
> `docker buildx prune` without a filter clears the **entire** BuildKit cache, including all intermediate layer caches across all images built with BuildKit. This forces a full rebuild from scratch on the next build. Use the `--filter type=exec.cachemount` flag to target only the download cache.

### Interactive Builder Profile

The `interactive-builder` profile facilitates interactive development with a persistent build environment. Because the builder mounts the local source code of Edirom-Online-Backend and Edirom-Online-Frontend to `/opt/eo-backend` and `/opt/eo-frontend` respectively, you can use it standalone to build your local clones of Edirom-Online-Backend and Edirom-Online-Frontend. The builder will create the build artifacts in the respective directories on your host system.

> [!NOTE]
> Running the interactive builder profile standalone is helpful if you want to make changes to the build processes. For frontend and backend development, we recommend [Combined Usage with Local Development Profiles](combined-usage-with-local-development-profiles).

```bash
# Set backend and frontend source paths (absolute paths recommended)
export FE_LOCAL_SOURCE=/path/to/your/frontend
export BE_LOCAL_SOURCE=/path/to/your/backend

# Start the persistent interactive builder
docker compose --profile interactive-builder up -d interactive-edirom-online-builder

# Access the interactive shell
docker compose exec interactive-edirom-online-builder bash
```

**Inside the interactive builder container:**
- Frontend source: `/opt/eo-frontend`
- Backend source: `/opt/eo-backend`
- All build tools available in PATH
- Run builds manually:
    - Edirom-Online-Frontend: `./build.sh`
    - Edirom-Online-Backend: `ant`

#### Combined Usage with Local Development Profiles

```bash
# 1. Set source paths (absolute paths recommended)
export FE_LOCAL_SOURCE=/path/to/your/frontend
export BE_LOCAL_SOURCE=/path/to/your/backend

# 2. Build all services
docker compose --profile local-fullstack --profile interactive-builder build

# 3. Start local development services and interactive builder in detached mode
docker compose --profile local-fullstack --profile interactive-builder up -d

# 4. Enter interactive builder shell
docker compose exec interactive-edirom-online-builder bash
```

#### Deploying Frontend Changes

Redeploying frontend changes is not necessary and only needs a browser refresh. Nevertheless, there are some caveats to consider. Here’s a recommended workflow:

```bash
# After having made your changes to the source code
# In the interactive builder, switch to the mounted frontend directory
cd /opt/eo-frontend

# Recommended build command (avoids cleaning mounted build directory)
sencha app build testing && ant inject-properties

# Alternative: Use full build script (may interfere with nginx mount due to clean step)
# ./build.sh

# The changes are automatically available since /opt/eo-frontend/build is mounted to nginx
# No deployment or container rebuild needed – just refresh your browser!
```
<!-- TODO update above code example after https://github.com/Edirom/Edirom-Online-Frontend/pull/105 is merged -->

_Alternative: Container Rebuild (if needed)_

If you prefer a clean rebuild or encounter caching issues:

```bash
# Rebuild the image and recreate the frontend container
docker compose --profile local-frontend up -d --build local-edirom-online-frontend
```

#### Deploying Backend Changes

> [!TIP]
> Use the interactive builder with it’s included task runner: Method 3, below.

As the build directory is from your host system, you can, of course, just use your proven deploy methods on your host platform, including, deployment via the eXist-db dashoard app or rebuilding and restarting the container.

> [!IMPORTANT]
> The actual value for the backend port and credentials in the following examples might be different  in your setup; please adjust them accordingly.

_Method 1: eXist-db Dashboard (Web Interface)_

On your host system:

1. Open the eXist-db Dashboard:
   - [http://localhost:8080/exist/apps/dashboard](http://localhost:8080/exist/apps/dashboard)
2. Log in with the administrator account:
   - User: `admin`
   - Password: `changeme`
3. Select **Package Manager** from the left menu
4. Upload the XAR from your filesystem

> [!IMPORTANT] if you have the impression that your changes did not get deployed you might try uninstalling Edirom Online Backend before reinstalling.

_Method 2: Container Rebuild (Clean Deployment)_

For a complete fresh deployment you might want to recreate the service:

```bash
# Remove the container and its eXist-db data volume, then rebuild and start fresh
docker compose rm -sfv local-edirom-online-backend && \
    docker compose --profile local-backend up -d --build local-edirom-online-backend
```

> [!NOTE]
> `rm -sfv` (stop, force-remove, remove volumes) is required because eXist-db persists its data in an anonymous Docker volume. Without removing it, the existing eXist-db state is reused and autodeploy does not run for already-installed packages.


_Method 3: Interactive Builder (`eo deploy backend`)_

> [!TIP]
> The `eo` task runner handles building, uploading, and deploying in one command — including automatic version conflict resolution.

From within the interactive builder shell (see [Interactive Builder Profile](#interactive-builder-profile)):

```bash
# Build backend and deploy in one step
eo deploy backend --build

# Or deploy the most recently built XAR without rebuilding
eo deploy backend
```

Use `--yes` / `-y` to skip the confirmation prompt when a version is already deployed. For the full command reference, see [eo Task Runner](eo-task-runner.md).

## Troubleshooting

### File not found (stale bind-mount)

When you make many changes to your local working copy of Edirom-Online-Backend or Edirom-Online-Frontend, a file that clearly exists on your host may be reported as "not found" inside the container. The usual root cause is a **stale bind-mount**: Docker Desktop's file-sharing layer on macOS (VirtioFS / gRPC-FUSE) occasionally lags in propagating a freshly created or edited host file into the bind-mounted container, even while sibling files in the same directory are visible.

**Typical symptoms**

A build fails referencing a file you know is present and valid. In a frontend Sencha/compass build this surfaces as a SASS import error, for example:

```
error EdiromOnline-all.scss (Line 2 of .../packages/eoTheme/sass/etc/all.scss:
File to import not found or unreadable: global.scss.
```

even though `packages/eoTheme/sass/etc/global.scss` exists and is readable on the host. The give-away is that the file was **created or edited shortly before the build**.

**Confirm the cause**

Check whether the container can see the file. From your host:

```bash
docker compose exec interactive-edirom-online-builder \
    ls -la /opt/eo-frontend/packages/eoTheme/sass/etc/global.scss
```

If the host shows the file but the container reports `No such file or directory`, the mount is stale.

**Resolve it** (in order of preference)

1. **Re-run the build.** The mount usually catches up within seconds, so simply building again often succeeds.
2. **Force a sync by listing the file inside the container** (as in the command above) before rebuilding; accessing the path prompts the file-sharing layer to refresh it.
3. **Restart the service to remount fresh:**

   ```bash
   docker compose --profile interactive-builder restart interactive-edirom-online-builder
   ```

> [!NOTE]
> This affects **bind mounts** (your mounted local clones), not files baked into the image. It is a Docker Desktop file-sharing artefact, not a problem with your source — the file content on your host is unchanged.