#####################################
# Multi-stage Dockerfile
# 1. Set up the build environment
# 2. Build Edirom-Online packages
# 3. Run the eXist-db and deploy XARs
#####################################


#########################
# 1. Build Environment
#########################

FROM eclipse-temurin:21 as builder

ARG ANT_VERSION=1.10.12
ARG SOURCE=https://github.com/Edirom/Edirom-Online-Backend.git
ARG BRANCH=v1.5.0
ARG EDITION
ARG ROASTER_VERSION=1.11.0
ARG FE_PORT


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

RUN echo "Cloning from repo $SOURCE" && \
    git clone --recurse-submodules "$SOURCE" --branch "$BRANCH" --single-branch . && \
    if [ -n "$FE_PORT" ] && [ "$FE_PORT" != "8089" ]; then \
        echo "Writing frontend.port=$FE_PORT to local.properties…"; \
        if [ -f "./local.properties" ]; then \
            sed -i '/^frontend\.port=/d' local.properties; \
            echo "frontend.port=$FE_PORT" >> local.properties; \
        else \
            echo "frontend.port=$FE_PORT" >> local.properties; \
        fi \
    fi && \
    echo "Building Backend XAR..." && \
    ant

RUN if [ -n "$EDITION" ]; then \
        echo "Downloading Edition XAR from $EDITION" && \
        mkdir -p /opt/eo-editions && \
        cd /opt/eo-editions && \
        curl -L -O "$EDITION"; \
    else \
        mkdir -p /opt/eo-editions && \
        echo "Note: EDITION_XAR not provided. Please add manually to eXist-db."; \
    fi

RUN echo "Downloading dependencies..." && \
    mkdir -p /opt/roaster && \
    cd /opt/roaster && \
    curl -L -O "https://exist-db.org/exist/apps/public-repo/public/roaster-${ROASTER_VERSION}.xar";


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
COPY --from=builder /opt/roaster/*.xar ${EXIST_HOME}/autodeploy/
