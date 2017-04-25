FROM ubuntu

MAINTAINER David Rivas david@momentlabs.io

# NPM/Node
RUN apt-get update \
    && apt-get install -y build-essential \
                          git \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_TAR node-v7.9.0-linux-x64.tar.xz
ADD https://nodejs.org/dist/v7.9.0/${NODE_TAR} /tmp/
RUN tar --strip-components 1 -xJf /tmp/${NODE_TAR}
RUN rm /tmp/${NODE_TAR}

# GO
ENV GO_TAR go1.8.1.linux-amd64.tar.gz 
ADD https://storage.googleapis.com/golang/${GO_TAR} /tmp/
RUN tar -C /usr/local -xzf /tmp/${GO_TAR} 
RUN rm /tmp/${GO_TAR}

ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

RUN mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 777 "$GOPATH"


# Our specifics.
ENV app ecs-pilot
# TODO Better to clone the repo for use in non-local 
# environments.
VOLUME ["/go/src/"]
ENV target=release/${app}_linux_amd64
CMD ${target}

WORKDIR /go/src/${app}
ENTRYPOINT make ${target}
