FROM golang

MAINTAINER David Rivas david@momentlabs.io

ENV app ecs-pilot

VOLUME ["/go/src/"]
ENV target=release/${app}_linux_amd64

# This is what the parent expects.
WORKDIR /go/src/${app}
ENTRYPOINT  make ${target}
