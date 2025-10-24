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

Adapt `install/.env-tests` and run `export $(grep -v '^#' install/.env-tests | xargs)`

#### Local deployment via docker-compose

```bash
docker compose  -f install/docker-compose.yaml up -d 
```

Connect via vscode dev container to /go/src/famquest/components/db-manager

a) Build the binary

```bash
GOOS=linux  GARCH=amd64 CGO_ENABLED=0 go build -v -a -installsuffix cgo -o dbmanager . 
./dbmanager 
```

b) Run directly

```bash
go run main.go
```

Format before commit:

```bash
go fmt $(go list ./... | grep -v /vendor/)
go vet $(go list ./... | grep -v /vendor/)
```

#### Build the image to test it in prod

```bash
cd ../../
docker build -t ghcr.io/guigomcha/famquest/dbmanager:staging -f components/db-manager/install/Dockerfile --progress plain  --network=host . && docker push ghcr.io/guigomcha/famquest/dbmanager:staging && kubectl rollout restart deployment -n staging dbmanager-deployment
cd components/db-manager
```

## Documentation

- <https://www.alexedwards.net/blog/using-postgresql-jsonb>

## API documentation

- Doc: [swagger](./pkg/api/docs/swagger.yaml)
- `xdg-open $SWAGGER_SCHEMA://$SWAGGER_URL/swagger/index.html`

Everytime the models or endpoints are updated, execute:

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
