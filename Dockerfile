FROM nginx:alpine

# Remove the default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy everything from the current directory (where Dockerfile is) into the Nginx web root
COPY . /usr/share/nginx/html

# Add OCI-compliant metadata labels for traceability
LABEL org.opencontainers.image.source="https://github.com/Edirom/Edirom-Online" \
      org.opencontainers.image.title="Edirom/Edirom-Online" \
      org.opencontainers.image.description="Docker image for the gh-pages branch of Edirom/Edirom-Online" \
      org.opencontainers.image.licenses="MIT"
