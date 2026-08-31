#############################################################
# Builder Environment Dockerfile
# Interactive build environment for local development
# Keeps build tools and dependencies alive for fast iteration
# Note: Uses Java 8 for Sencha Cmd (frontend) compatibility
#############################################################

# Use Java 8 for Sencha Cmd compatibility (requires Nashorn JavaScript engine)
FROM eclipse-temurin:8-jdk-focal

ARG ANT_VERSION=1.10.12

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        sudo \
        wget \
        git \
        unzip \
        libfreetype6 \
        fontconfig \
        ruby-full \
        vim \
        less \
    && rm -rf /var/lib/apt/lists/*

# Download and extract Apache Ant to opt folder
# Use cache mount to persist downloads across builds
RUN --mount=type=cache,target=/var/cache/downloads \
    if [ ! -f /var/cache/downloads/apache-ant-${ANT_VERSION}-bin.tar.gz ]; then \
        wget --no-check-certificate --no-cookies http://archive.apache.org/dist/ant/binaries/apache-ant-${ANT_VERSION}-bin.tar.gz -O /var/cache/downloads/apache-ant-${ANT_VERSION}-bin.tar.gz && \
        wget --no-check-certificate --no-cookies http://archive.apache.org/dist/ant/binaries/apache-ant-${ANT_VERSION}-bin.tar.gz.sha512 -O /var/cache/downloads/apache-ant-${ANT_VERSION}-bin.tar.gz.sha512; \
    fi && \
    cd /var/cache/downloads && \
    echo "$(cat apache-ant-${ANT_VERSION}-bin.tar.gz.sha512) apache-ant-${ANT_VERSION}-bin.tar.gz" | sha512sum -c && \
    tar -zvxf /var/cache/downloads/apache-ant-${ANT_VERSION}-bin.tar.gz -C /opt/ && \
    ln -s /opt/apache-ant-${ANT_VERSION} /opt/ant

# Download and install SenchaCmd Community Edition
# Use cache mount to persist downloads across builds
RUN --mount=type=cache,target=/var/cache/downloads \
    if [ ! -f /var/cache/downloads/senchaCmd.zip ]; then \
        curl --silent http://cdn.sencha.com/cmd/7.0.0.40/no-jre/SenchaCmd-7.0.0.40-linux-amd64.sh.zip -o /var/cache/downloads/senchaCmd.zip; \
    fi && \
    unzip /var/cache/downloads/senchaCmd.zip -d /tmp && \
    chmod o+x /tmp/SenchaCmd-7.0.0.40-linux-amd64.sh && \
    /tmp/SenchaCmd-7.0.0.40-linux-amd64.sh -Dall=true -q -dir /opt/Sencha/Cmd/7.0.0.40 && \
    rm /tmp/SenchaCmd-7.0.0.40-linux-amd64.sh

# Put ant and sencha in the path
ENV PATH="/opt/ant/bin:/opt/Sencha/Cmd:${PATH}"

# Install eo task runner (available as 'eo' anywhere in the container)
COPY eo /usr/local/bin/eo
RUN chmod +x /usr/local/bin/eo

# Set working directory where source will be mounted
WORKDIR /opt/eo-frontend

# Keep container running with bash
CMD ["/bin/bash"]
