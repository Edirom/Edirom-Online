#!/bin/sh
set -e

# The user's image folder is mounted at /images (IMAGES_DIR=... docker compose up)
if [ -z "$(ls -A /images 2>/dev/null)" ]; then
  echo "No images found in /images. Start with your image folder, e.g.:"
  echo "  IMAGES_DIR=/path/to/images docker compose --profile cantaloupe up"
  exit 1
fi

# 1. Start Cantaloupe in the background
java -Dcantaloupe.config=/opt/cantaloupe/cantaloupe.properties \
     -Xmx${JAVA_XMX} -jar /opt/cantaloupe/cantaloupe.jar &

# 2. Wait until Cantaloupe answers
echo "Waiting for Cantaloupe..."
i=0
until curl -s -o /dev/null http://127.0.0.1:8182/; do
  i=$((i+1))
  if [ "$i" -ge 120 ]; then echo "Cantaloupe did not start within 120 s"; exit 1; fi
  sleep 1
done
echo "Cantaloupe is up."

# 3. Build the IIIF manifest (written to /app/manifest.json)
cd /app
python3 /app/manifester.py /images/

# 4. Serve the manifest with CORS on port 8000
exec python3 /app/serve_cors.py
