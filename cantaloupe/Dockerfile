# Cantaloupe IIIF image server + automatic IIIF manifest
#   Images:    http://localhost:8182/iiif/3/<file name>
#   Manifest:  http://localhost:8000/manifest.json
# The image folder is mounted at /images at runtime (IMAGES_DIR=...).
FROM eclipse-temurin:17-jre

ARG CANTALOUPE_VERSION=5.0.7

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 unzip curl \
 && rm -rf /var/lib/apt/lists/*

# Cantaloupe: official release
WORKDIR /opt
RUN curl -fsSL -o cantaloupe.zip \
      https://github.com/cantaloupe-project/cantaloupe/releases/download/v${CANTALOUPE_VERSION}/cantaloupe-${CANTALOUPE_VERSION}.zip \
 && unzip -q cantaloupe.zip && rm cantaloupe.zip \
 && mv cantaloupe-${CANTALOUPE_VERSION} cantaloupe \
 && mv cantaloupe/cantaloupe-${CANTALOUPE_VERSION}.jar cantaloupe/cantaloupe.jar

# Your files from this folder
COPY cantaloupe.properties /opt/cantaloupe/cantaloupe.properties
COPY manifester.py serve_cors.py /app/
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

VOLUME ["/images"]
WORKDIR /app
ENV JAVA_XMX=2g
EXPOSE 8182 8000
ENTRYPOINT ["/entrypoint.sh"]