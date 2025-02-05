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
This service will be scheduled as a cronjob to create a backup of the main BDs and to push them to a secure cloud provider such as Dropbox.

- Check [this repo](https://github.com/andreafabrizi/Dropbox-Uploader) and get your credentials (run once locally).

Each Famquest instance requires to have a custom backup manager to handle its DBs. Since Dropbox is secured, we relay on a series of credentials that need to be obtained beforehand and added as env variables to the ./install/.env-tests file (for local tests) or deploy/k8s/components/backupmanager-cronjob.yaml manifest (for prod).

## Getting Started

### Prerequisites

Mostly a bash service.

### Installation

- Adapt the env variables manually and execute whichever script you want from the tools/ folder

#### Build the image to test it in prod

```bash
cd ../../
docker build -t ghcr.io/guigomcha/famquest/backupmanager:staging -f components/backup-manager/install/Dockerfile --progress plain  --network=host .
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

The service runs every 60 min (at xx:30:00) as a k8s cronjob, it keeps the two latest backup files and pushes any new file to Dropbox.

## API documentation
