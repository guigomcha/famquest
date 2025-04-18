FROM ghcr.io/guigomcha/proxy/golang:latest-alpine as builder

# Use to skip tests and binary builds to be able to use deploy/local/dev.docker-compose.yml 
ARG DEV

WORKDIR /go/src/famquest/components/db-manager

COPY components/db-manager .
COPY components/go-common ../go-common

# Needed when working behind a proxy... 
RUN go env -w GOPROXY=direct GOINSECURE=all

# Make sure that the code is up to standards and docs are updated
# Run tests and keep report
RUN if [ -z "$DEV" ]; then \
    ./install/dockerfile_tools/go_tools.sh \
    && ./install/dockerfile_tools/go_test.sh \
    && git reset --hard HEAD && ./install/dockerfile_tools/go_swag_check.sh; \
    fi

# Finally build binaries
RUN if [ -z "$DEV" ]; then \
    GOOS=linux GARCH=amd64 CGO_ENABLED=0 go build -v -a -installsuffix cgo -o dbmanager . ;\
    fi

# Reduce final image tag as much as possible
FROM ghcr.io/guigomcha/proxy/alpine

WORKDIR /root/
COPY --from=builder /go/src/famquest/components/db-manager/dbmanager ./dbmanager
COPY --from=builder /go/src/famquest/components/db-manager/testReport.txt testReport.txt