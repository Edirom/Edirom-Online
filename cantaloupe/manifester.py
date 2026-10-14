#!/usr/bin/env python3
"""
Generate a IIIF Presentation 3.0 manifest from all images in a folder,
using a locally running Cantaloupe server to get each image's dimensions.

Usage:
    python3 manifester.py /path/to/image/folder

Requires: Python 3 (standard library only). Cantaloupe must be running.
"""

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

CANTALOUPE_BASE = os.environ.get("CANTALOUPE_BASE", "http://localhost:8182/iiif/3")
MANIFEST_ID = os.environ.get("MANIFEST_ID", "http://localhost:8000/manifest.json")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".jp2", ".webp"}


def fetch_info(identifier: str) -> dict:
    url = f"{CANTALOUPE_BASE}/{identifier}/info.json"
    with urllib.request.urlopen(url) as resp:
        return json.load(resp)


def main():
    if len(sys.argv) != 2:
        sys.exit("Usage: python3 manifester.py /path/to/image/folder")

    folder = Path(sys.argv[1])
    if not folder.is_dir():
        sys.exit(f"Not a folder: {folder}")

    images = sorted(
        p.name for p in folder.iterdir()
        if p.suffix.lower() in IMAGE_EXTENSIONS
    )
    if not images:
        sys.exit("No images found in that folder.")

    canvases = []
    for i, name in enumerate(images, start=1):
        print(f"Fetching dimensions for {name} ...")
        # encode the file name for use in a URL (spaces, brackets, ...)
        identifier = urllib.parse.quote(name, safe="")
        info = fetch_info(identifier)
        w, h = info["width"], info["height"]

        canvas_id = f"{MANIFEST_ID}/canvas/{i}"
        service_id = f"{CANTALOUPE_BASE}/{identifier}"

        canvases.append({
            "id": canvas_id,
            "type": "Canvas",
            "label": {"en": [name]},
            "width": w,
            "height": h,
            "items": [{
                "id": f"{canvas_id}/page",
                "type": "AnnotationPage",
                "items": [{
                    "id": f"{canvas_id}/page/anno",
                    "type": "Annotation",
                    "motivation": "painting",
                    "target": canvas_id,
                    "body": {
                        "id": f"{service_id}/full/max/0/default.jpg",
                        "type": "Image",
                        "format": "image/jpeg",
                        "width": w,
                        "height": h,
                        "service": [{
                            "id": service_id,
                            "type": "ImageService3",
                            "profile": "level2"
                        }]
                    }
                }]
            }]
        })

    manifest = {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": MANIFEST_ID,
        "type": "Manifest",
        "label": {"en": [os.environ.get("MANIFEST_LABEL") or folder.name or "Images"]},
        "items": canvases
    }

    out = Path("manifest.json")
    out.write_text(json.dumps(manifest, indent=2))
    print(f"\nWrote {out.resolve()} with {len(canvases)} canvases.")


if __name__ == "__main__":
    main()