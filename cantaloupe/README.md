# Cantaloupe (IIIF image server + manifest)

Serves a local folder of images via IIIF and creates one IIIF Presentation 3 manifest
(one canvas per image, sorted by file name).

Start (from the Edirom-Online folder):
```bash
IMAGES_DIR=/path/to/images docker compose --profile cantaloupe up
```

- Images:   http://localhost:8182/iiif/3/<file name>
- Manifest: http://localhost:8000/manifest.json (paste into Cartographer's "Import IIIF")

Notes
- Only images directly in the folder are used (JPG, PNG, TIFF recommended).
- The manifest is recreated on every start; after adding images run
  `docker compose restart cantaloupe`.
- `cantaloupe.properties` reads images from `/images/` - the folder given with
  `IMAGES_DIR` is mounted there, so the file never needs a personal path.

| File | Purpose |
|---|---|
| `Dockerfile` | Downloads Cantaloupe 5.0.7, adds config and scripts |
| `cantaloupe.properties` | Cantaloupe config (`path_prefix = /images/`) |
| `entrypoint.sh` | Starts Cantaloupe, waits for it, builds and serves the manifest |
| `manifester.py` | Creates `manifest.json` from the images (asks Cantaloupe for sizes) |
| `serve_cors.py` | Serves `manifest.json` on port 8000 with CORS |
