  - [Description](#description)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Documentation](#documentation)
  - [API documentation](#api-documentation)

# DB Manager

## Description

Backend interface for he frontend for all the UI DBs and such.

## Getting Started

### Prerequisites

Golang 1.22

### Installation

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
```

```bash
GOOS=linux  GARCH=amd64 CGO_ENABLED=0 go build -v -a -installsuffix cgo -o dbmanager . 
export $(grep -v '^#' install/.env-tests | xargs)
./dbmanager 
```

```bash
cd ../../
docker build -t ghcr.io/guigomcha/famquest/dbmanager:latest -f components/db-manager/install/Dockerfile --progress plain  --network=host .
cd components/db-manager
```


## Documentation

- https://www.alexedwards.net/blog/using-postgresql-jsonb

## API documentation

- Doc: [swagger](./pkg/api/docs/swagger.yaml)
- xdg-open $SWAGGER_SCHEMA://$SWAGGER_URL/swagger/index.html
