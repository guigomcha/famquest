# Backup Manager

- [Description](#description)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Run tests](#run-tests)
- [Documentation](#documentation)
- [API documentation](#api-documentation)

## Description

Famquest aims at giving the full ownership of the data to its user and avoid as much as possible the dependency of external cloud providers. However, the importance of memories stored in Famquest cannot depend on a user's home laptop.
This service will be scheduled as a cronjob to create a backup of the main BDs and to push them to a secure cloud provider such as google cloud.

## Getting Started

### Prerequisites

Mostly a bash service.

### Installation

- Adapt the env variables manually and execute whichever script you want from the tools/ folder

#### Build the image to test it in prod

```bash
cd ../../
docker build -t ghcr.io/guigomcha/famquest/backupmanager:REPLACE_TARGET_USER -f components/backup-manager/install/Dockerfile --progress plain  --network=host .
cd components/backup-manager
```

### Run tests

Run locally with:

```bash
# Update install/.env-tests
export $(grep -v '^#' install/.env-tests | xargs)
cd tools
./main.sh famquest backups-postgresql postgresql
./main.sh famquest backups-minio minio
cd ..
```

## Documentation

## API documentation
