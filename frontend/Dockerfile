#######################################
# Multi-stage Dockerfile
# 1. Set up the build environment
# 2. Build Edirom-Online packages
# 3. Run the nginx and deploy frontend
#######################################


#########################
# 1. Build Environment
#########################

FROM openjdk:8-jre-slim as builder

ARG ANT_VERSION=1.10.12
ARG SOURCE=https://github.com/Edirom/Edirom-Online-Frontend/releases/download/v1.0.1/Edirom-Online-Frontend-1.0.1.xar
ARG BRANCH=develop


# Install wget and unzip and ruby and other dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        sudo \
        wget \
        git \
        unzip \
		libfreetype6 \
		fontconfig \
        ruby-full \
	&& rm -rf /var/lib/apt/lists/*

# Download and extract Apache Ant to opt folder
RUN wget --no-check-certificate --no-cookies http://archive.apache.org/dist/ant/binaries/apache-ant-${ANT_VERSION}-bin.tar.gz && \
    wget --no-check-certificate --no-cookies http://archive.apache.org/dist/ant/binaries/apache-ant-${ANT_VERSION}-bin.tar.gz.sha512 && \
    echo "$(cat apache-ant-${ANT_VERSION}-bin.tar.gz.sha512) apache-ant-${ANT_VERSION}-bin.tar.gz" | sha512sum -c && \
    tar -zvxf apache-ant-${ANT_VERSION}-bin.tar.gz -C /opt/ && \
    ln -s /opt/apache-ant-${ANT_VERSION} /opt/ant && \
    unlink apache-ant-${ANT_VERSION}-bin.tar.gz && \
    unlink apache-ant-${ANT_VERSION}-bin.tar.gz.sha512

# Download and install SenchaCmd Community Edition
RUN curl --silent http://cdn.sencha.com/cmd/7.0.0.40/no-jre/SenchaCmd-7.0.0.40-linux-amd64.sh.zip -o /tmp/senchaCmd.zip && \
    unzip /tmp/senchaCmd.zip -d /tmp  && \
    unlink /tmp/senchaCmd.zip  && \
    chmod o+x /tmp/SenchaCmd-7.0.0.40-linux-amd64.sh && \
    /tmp/SenchaCmd-7.0.0.40-linux-amd64.sh -Dall=true -q -dir /opt/Sencha/Cmd/7.0.0.40 && \
    unlink /tmp/SenchaCmd-7.0.0.40-linux-amd64.sh

# Put ant and sencha in the path
ENV PATH="/opt/ant/bin:/opt/Sencha/Cmd:${PATH}"


############################
# 2. Edirom-Online Frontend
############################

# Get build for Edirom-Online Frontend
WORKDIR /opt/eo-frontend

RUN if [ -n "$SOURCE" ]; then \
        case "$SOURCE" in \
            *xar) \
                echo "Downloading Frontend XAR from $SOURCE" && \
                mkdir -p /opt/eo-frontend/build-xar && \
                curl -L "$SOURCE" -o /opt/eo-frontend/build-xar/frontend.xar; \
                echo "Unzipping Frontend XAR..." && \
                unzip -o /opt/eo-frontend/build-xar/frontend.xar -d /opt/eo-frontend/build/ \
                ;; \
            *git) \
                echo "Cloning from repo $SOURCE" && \
                git clone "$SOURCE" --branch "$BRANCH" --single-branch . && \
                echo "Building Frontend XAR..." && \
                ./build.sh; \
                ;; \
        esac; \
    else \
        echo "Error: $SOURCE must be reference to Frontend Git repository URL or Frontend xar file URL." && \
        exit 1; \
    fi 
    


#########################
# 3. Run/deploy nginx
#########################

# Use nginx as the base image
FROM nginx:alpine

# copy build files to directory
COPY --from=builder /opt/eo-frontend/build/ /usr/share/nginx/html/