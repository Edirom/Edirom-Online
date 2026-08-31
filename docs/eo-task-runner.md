# eo — Edirom Online Task Runner

The `eo` script is available inside the `interactive-edirom-online-builder` container at `/usr/local/bin/eo`. It is a task runner for common build and deploy operations during local development.

## Usage

```
eo <command> [options]
```

## Commands

### build

```bash
eo build frontend     # Build the frontend with Sencha Cmd
eo build backend      # Build the backend with Ant
eo build all          # Build backend then frontend
```

### deploy

```bash
eo deploy backend [--build] [--yes|-y]
```

Deploys the most recently built backend XAR to eXist-db.

| Option | Description |
|--------|-------------|
| `--build` | Run `eo build backend` before deploying |
| `--yes`, `-y` | Skip confirmation prompt when a version is already deployed |

The command automatically checks whether the backend app is currently deployed. If it is, it reports both the deployed version and the XAR version, and prompts for confirmation before undeploying and redeploying. This handles version conflicts without manual intervention.

### logs

```bash
eo logs
```

Prints instructions for tailing container logs from the host (not available from inside the builder container).

### help

```bash
eo help
```

Prints the command reference.
