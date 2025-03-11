#########################
# Multi-stage Dockerfile
# 1. set up the build environment and build the expath-package
# 2. run the eXist-db and deploy XARs
#########################

# arguments for global use
ARG EDIROM_BACKEND_BUILD_HOME="/opt/edirom-backend"
ARG EDIROM_FRONTEND_BUILD_HOME="/opt/edirom-frontend"
ARG EDITION_EXAMPLE_BUILD_HOME="/opt/edition-example"


# Download base image
FROM openjdk:8-jre-slim as builder

ARG ANT_VERSION=1.10.12
ARG ANT_HOME=/opt/ant

ARG EDIROM_BACKEND_BUILD_HOME
ENV EDIROM_BACKEND_BUILD_HOME=$EDIROM_BACKEND_BUILD_HOME

ARG EDIROM_FRONTEND_BUILD_HOME
ENV EDIROM_FRONTEND_BUILD_HOME=$EDIROM_FRONTEND_BUILD_HOME

ARG EDITION_EXAMPLE_BUILD_HOME
ENV EDITION_EXAMPLE_BUILD_HOME=$EDITION_EXAMPLE_BUILD_HOME


# Install wget and unzip and ruby
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
RUN wget --no-check-certificate --no-cookies http://archive.apache.org/dist/ant/binaries/apache-ant-${ANT_VERSION}-bin.tar.gz \
    && wget --no-check-certificate --no-cookies http://archive.apache.org/dist/ant/binaries/apache-ant-${ANT_VERSION}-bin.tar.gz.sha512 \
    && echo "$(cat apache-ant-${ANT_VERSION}-bin.tar.gz.sha512) apache-ant-${ANT_VERSION}-bin.tar.gz" | sha512sum -c \
    && tar -zvxf apache-ant-${ANT_VERSION}-bin.tar.gz -C /opt/ \
    && ln -s /opt/apache-ant-${ANT_VERSION} /opt/ant \
    && unlink apache-ant-${ANT_VERSION}-bin.tar.gz \
    && unlink apache-ant-${ANT_VERSION}-bin.tar.gz.sha512

# Installing SenchaCmd Community Edition

# download senchaCmd
RUN curl --silent http://cdn.sencha.com/cmd/7.0.0.40/no-jre/SenchaCmd-7.0.0.40-linux-amd64.sh.zip -o /tmp/senchaCmd.zip && \
    unzip /tmp/senchaCmd.zip -d /tmp  && \
    unlink /tmp/senchaCmd.zip  && \
    chmod o+x /tmp/SenchaCmd-7.0.0.40-linux-amd64.sh && \
    /tmp/SenchaCmd-7.0.0.40-linux-amd64.sh -Dall=true -q -dir /opt/Sencha/Cmd/7.0.0.40 && \
    unlink /tmp/SenchaCmd-7.0.0.40-linux-amd64.sh


ENV PATH="/opt/ant/bin:/opt/Sencha/Cmd:${PATH}"


#########################
# Build Edirom-Online 
# Backend and Frontend
#########################

# first buildEdirom-Online Backend
WORKDIR ${EDIROM_BACKEND_BUILD_HOME}
RUN git clone https://github.com/Edirom/Edirom-Online-Backend.git . \
    && ./build.sh


# now build  Edirom-Online Frontend
WORKDIR ${EDIROM_FRONTEND_BUILD_HOME}
RUN git clone https://github.com/Edirom/Edirom-Online-Frontend.git . \
    && ./build.sh

# build Edition Example
WORKDIR ${EDITION_EXAMPLE_BUILD_HOME}
RUN git clone https://github.com/Edirom/EditionExample.git . \
    && ant

#########################
# Run the eXist-db
# and add freshly built xar-package
#########################
FROM stadlerpeter/existdb:6
LABEL org.opencontainers.image.authors="Peter Stadler"

ARG EDIROM_BACKEND_BUILD_HOME
ENV EDIROM_BACKEND_BUILD_HOME=$EDIROM_BACKEND_BUILD_HOME

ARG EDIROM_FRONTEND_BUILD_HOME
ENV EDIROM_FRONTEND_BUILD_HOME=$EDIROM_FRONTEND_BUILD_HOME

ARG EDITION_EXAMPLE_BUILD_HOME
ENV EDITION_EXAMPLE_BUILD_HOME=$EDITION_EXAMPLE_BUILD_HOME

# copy XARs to autodeploy directory of exist
COPY --from=builder ${EDIROM_BACKEND_BUILD_HOME}/build-xar/*.xar ${EXIST_HOME}/autodeploy/
COPY --from=builder ${EDIROM_FRONTEND_BUILD_HOME}/build-xar/*.xar ${EXIST_HOME}/autodeploy/
COPY --from=builder ${EDITION_EXAMPLE_BUILD_HOME}/dist/*.xar ${EXIST_HOME}/autodeploy/
