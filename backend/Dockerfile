#####################################
# Multi-stage Dockerfile
# 1. Set up the build environment
# 2. Build Edirom-Online packages
# 3. Run the eXist-db and deploy XARs
#####################################


#########################
# 1. Build Environment
#########################

FROM openjdk:8-jre-slim as builder

ARG ANT_VERSION=1.10.12
ARG XAR
ARG REPO=https://github.com/Edirom/Edirom-Online-Backend.git
ARG BRANCH=develop
ARG EDITION


# Install wget and unzip and ruby and other dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        sudo \
        wget \
        git \
        unzip \
		libfreetype6 \
		fontconfig \
	&& rm -rf /var/lib/apt/lists/*

# Download and extract Apache Ant to opt folder
RUN wget --no-check-certificate --no-cookies http://archive.apache.org/dist/ant/binaries/apache-ant-${ANT_VERSION}-bin.tar.gz && \
    wget --no-check-certificate --no-cookies http://archive.apache.org/dist/ant/binaries/apache-ant-${ANT_VERSION}-bin.tar.gz.sha512 && \
    echo "$(cat apache-ant-${ANT_VERSION}-bin.tar.gz.sha512) apache-ant-${ANT_VERSION}-bin.tar.gz" | sha512sum -c && \
    tar -zvxf apache-ant-${ANT_VERSION}-bin.tar.gz -C /opt/ && \
    ln -s /opt/apache-ant-${ANT_VERSION} /opt/ant && \
    unlink apache-ant-${ANT_VERSION}-bin.tar.gz && \
    unlink apache-ant-${ANT_VERSION}-bin.tar.gz.sha512

# Put ant in the path
ENV PATH="/opt/ant/bin:${PATH}"


###########################
# 2. Edirom-Online Backend
###########################

# Get build for Edirom-Online Backend
WORKDIR /opt/eo-backend

RUN if [ -n "$XAR" ]; then \
        echo "Downloading Backend XAR from $XAR" && \
        mkdir -p /opt/eo-backend/build-xar && \
        curl -L "$XAR" -o /opt/eo-backend/build-xar/backend.xar; \
    elif [ -n "$REPO" ]; then \
        echo "Cloning from repo $REPO" && \
        git clone "$REPO" --branch "$BRANCH" --single-branch . && \
        echo "Building Backend XAR..." && \
        ant; \
    else \
        echo "Error: Either REPO (Backend Git repository URL) or XAR (Backend xar file URL) must be provided." && \
        exit 1; \
    fi

RUN if [ -n "$EDITION" ]; then \
        echo "Downloading Edition XAR from $EDITION" && \
        mkdir -p /opt/eo-editions && \
        curl -L "$EDITION" -o /opt/eo-editions/Edition-Example-0.1.xar; \
    else \
        echo "Note: EDITION_XAR not provided. Please add manually to eXist-db."; \
    fi


#########################
# 3. Run/deploy eXist-db
#########################

FROM stadlerpeter/existdb:6
ENV EXIST_PASSWORD=changeme

# add XARs to autodeploy directory of exist
ADD ./autodeploy ${EXIST_HOME}/autodeploy/

# copy built XARs to autodeploy directory of exist
COPY --from=builder /opt/eo-backend/build-xar/*.xar ${EXIST_HOME}/autodeploy/
COPY --from=builder /opt/eo-editions/*.xar ${EXIST_HOME}/autodeploy/
