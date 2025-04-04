# Welcome Page

- [Description](#description)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Run tests](#run-tests)
- [Documentation](#documentation)
- [API documentation](#api-documentation)

## Description

This will be the entrypoint to the Famquest application for all instances. It describes:

- What this is
- How to join

## Getting Started

### Prerequisites

React JS

- node -v v18.20.4
- npm -v 10.7.0

```bash
sudo apt install npm
sudo apt install nodejs

# if error ->  trying to overwrite '/usr/include/node/common.gypi', which is also in package libnode-dev 12.22.9~dfsg-1ubuntu3.6
sudo apt remove nodejs
sudo dpkg --remove --force-remove-reinstreq libnode-dev
sudo dpkg --remove --force-remove-reinstreq libnode72:amd64
sudo apt install nodejs
```

- npm packages (already done and available via in package.json)

```bash
npx create-expo-app@latest front-manager
cd welcome-page
npm install expo-cli
npm install react react-dom
npx expo install react-native-web react-dom @expo/metro-runtime
```

### Installation

- Adapt the env variables manually (process.env not working) search for REPLACE

```bash
npm install 
# build and serve 
npx expo start --web
# only build
npx expo export --platform web
```

#### Build the image to test it in prod

```bash
cd ../../
docker build -t ghcr.io/guigomcha/famquest/welcomepage:staging -f components/welcome-page/install/Dockerfile --progress plain  --network=host .
cd components/welcome-page
```

### Run tests

## Documentation

## API documentation
