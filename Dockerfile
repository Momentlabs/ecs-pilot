FROM golang

MAINTAINER David Rivas david@momentlabs.io

VOLUME ["/go/src/"]
ENV app_name ecs-pilot
# This is what the parent expects.
WORKDIR /go/src/${app_name}

ENTRYPOINT ["make", "release/${app_name}_linux_amd64"]
