# DB Manager

- [Description](#description)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Documentation](#documentation)
- [API documentation](#api-documentation)

## Description

Backend interface for he frontend for all the UI DBs and such.

- Tables modeled in pkg/models/schema.go

## Getting Started

### Prerequisites

Golang 1.22

### Installation

Adapt `install/.env-tests`

#### Local deployment via docker-compose and vscode dev containers

It has been configured to use volumes to develop inside of the container.

```bash
cd ../..
docker-compose -f deploy/local/docker-compose.yaml up -d
```

Connect via vscode dev container to /go/src/famquest/components/db-manager

```bash
go get github.com/swaggo/swag/cmd/swag@latest
go get github.com/swaggo/http-swagger
go install github.com/swaggo/swag/cmd/swag@latest
go install github.com/swaggo/http-swagger
PATH=$(go env GOPATH)/bin:$PATH
swag init --parseDependency --output pkg/api/docs
go fmt $(go list ./... | grep -v /vendor/)
go vet $(go list ./... | grep -v /vendor/)
go mod tidy
export $(grep -v '^#' install/.env-tests | xargs)
```

a) Build the binary

```bash
GOOS=linux  GARCH=amd64 CGO_ENABLED=0 go build -v -a -installsuffix cgo -o dbmanager . 
./dbmanager 
```

b) Run directly

```bash
go run main.go
```

#### Build the image to test it in prod

```bash
cd ../../
docker build -t ghcr.io/guigomcha/famquest/dbmanager:latest -f components/db-manager/install/Dockerfile --progress plain  --network=host .
cd components/db-manager
```

## Documentation

- <https://www.alexedwards.net/blog/using-postgresql-jsonb>

## API documentation

- Doc: [swagger](./pkg/api/docs/swagger.yaml)
- `xdg-open $SWAGGER_SCHEMA://$SWAGGER_URL/swagger/index.html`
