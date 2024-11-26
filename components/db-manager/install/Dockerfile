FROM registry.atosresearch.eu:18488/golang:latest-alpine as builder

# Use to skip tests and binary builds to be able to use deploy/local/dev.docker-compose.yml 
ARG DEV

WORKDIR /go/src/famquest/components/db-manager

COPY components/db-manager .
COPY components/go-common ../go-common

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
FROM registry.atosresearch.eu:18520/library/alpine

WORKDIR /root/
COPY --from=builder /go/src/famquest/components/db-manager/dbmanager ./dbmanager
COPY --from=builder /go/src/famquest/components/db-manager/testReport.txt testReport.txt