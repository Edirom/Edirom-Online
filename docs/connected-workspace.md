# Connected Workspace

- [What it is](#what-it-is)
- [Using it](#using-it)
- [Setup](#setup)
  - [1. Run the WebSocket server](#1-run-the-websocket-server)
  - [2. Tell Edirom Online where the server is](#2-tell-edirom-online-where-the-server-is)
- [Troubleshooting](#troubleshooting)

## What it is

The Connected Workspace links several Edirom Online instances (browser windows or devices) into a shared **session**. Instances in the same session share their concordance state: if you step through a concordance on one device, all others follow.

A critical edition compares many sources. On a single screen, these windows compete for space. With Connected Workspace you are able to spread them across screens and devices while keeping them aligned.

It is **optional**. Without a configured WebSocket server URL, the feature is not loaded and Edirom Online behaves as before.

A session has no accounts or roles (yet). Everyone who knows the session ID can join and control it, so share it only with people you want to give control. Any member can remove other members or dissolve the session.

## Using it

The Connected Workspace icon sits in the top bar next to the search button. Its color shows the status:

| Color  | Meaning                                |
| ------ | -------------------------------------- |
| red    | server not reachable                   |
| orange | server reachable, but not in a session |
| green  | in a session                           |

**Start a session**

1. Click the icon, optionally change the device name, and choose **Create session**.
2. Choose **Add new device**. Invite a device in one of three ways:
   - open the **QR code** with the other device,
   - copy and paste the **invite URL**,
   - enter the 6-character **session ID** on the other device under **Join session**.
3. Open the Concordance Navigator and the sources you want on every device.
4. Navigate through a concordance on any device.

**Manage a session**

The **Session information** page lists all devices. From there you can rename your device, remove another device, leave the session or dissolve it for everyone. A session also ends when its last member leaves.

## Setup

### 1. Run the WebSocket server

```bash
git clone --recurse-submodules https://github.com/Edirom/edirom-ws-server.git
cd edirom-ws-server
docker build -t edirom-ws-server .
docker run \
  -e PORT=3000 \
  -e DEBUG_TOKEN=change-me \
  -v /my/logs:/usr/src/app/data \
  -p 3000:3000 \
  edirom-ws-server
```

The server is now reachable at `ws://localhost:3000`. Sessions live in memory only and are lost when the server restarts.

For production:

- Serve Edirom Online over HTTPS and the server over **`wss://`**. Browsers block `ws://` from an HTTPS page.
- If the server runs behind a reverse proxy, the proxy must forward WebSocket upgrades.
- Limits, logging and the debug endpoint are configured through environment variables, see the [edirom-ws-server README](https://github.com/Edirom/edirom-ws-server#configuration).

### 2. Tell Edirom Online where the server is

Choose the way that matches how you run Edirom Online. An empty value disables the feature.

**Docker Compose (this repository)**

```bash
export WS_URL=ws://localhost:3000
docker compose up --build
```

`WS_URL` is applied when the frontend image is built, so rebuild after changing it.

**Building the Frontend yourself**

Set `ws.url` in `local.properties` (see the [Frontend README](https://github.com/Edirom/Edirom-Online-Frontend#overriding-build-properties-locally)):

```properties
ws.url=ws://localhost:3000
```

**Changing the URL without a rebuild (nginx/httpd container)**

Add `wsURL` to the `config.json` that is mounted into the container, as for the [backend URL](setup.md#dynamic-backend-url-configuration):

```json
{
  "backendURL": "http://127.0.0.1:8081/",
  "wsURL": "ws://localhost:3000"
}
```

## Troubleshooting

| Symptom                                                         | Likely cause                                                                                                                                         |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| No icon in the top bar                                          | No WebSocket URL configured, or the Frontend version does not include the feature.                                                                   |
| Icon is red                                                     | Server not running or not reachable from the browser, wrong URL, or `ws://` used on an HTTPS page. Use **Try again** in the popover after fixing it. |
| "This session ID does not exist."                               | Typo, or the session already ended (dissolved, empty, server restarted).                                                                             |
| "Client and server are not compatible. Please reload the page." | Frontend and server use different protocol versions. Update both to matching versions.                                                               |
