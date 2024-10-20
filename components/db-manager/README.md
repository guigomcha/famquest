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
go mod init
```

```bash
GOOS=linux GARCH=amd64 CGO_ENABLED=0 go build -v -a -installsuffix cgo -o dbmanager . 
cp install/.env-tests .env
export $(grep -v '^#' .env | xargs)
```

## Documentation


## API documentation

- Doc: [swagger](./pkg/api/docs/swagger.yaml)
- xdg-open $SWAGGER_SCHEMA://$SWAGGER_URL/swagger/index.html
