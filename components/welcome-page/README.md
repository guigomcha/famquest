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
npx create-react-app welcome-page
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



    "-": "~0.0.1",
    "@expo/config": "^8.1.1",
    "@expo/metro-config": "^0.10.0",
    "@expo/metro-runtime": "~3.2.3",
    "@react-navigation/native-stack": "~7.1.1",
    "antd": "^5.22.2",
    "bootstrap": "^5.3.3",
    "expo": "^52.0.41",
    "expo-cli": "^6.3.10",
    "i18next": "^24.2.2",
    "i18next-browser-languagedetector": "^8.0.2",
    "i18next-http-backend": "^3.0.2",
    "metro-inspector-proxy": "^0.78.1",
    "react": "~18.2.0",
    "react-bootstrap": "^2.10.6",
    "react-dom": "~18.2.0",
    "react-i18next": "^15.4.0",
    "react-native": "0.76.7",
    "react-native-web": "~0.19.13",
    "react-query": "~3.39.3",
    "react-router-dom": "~5.3.4",
    "save": "~2.9.0"

npx expo install antd i18next i18next-browser-languagedetector i18next-http-backend metro-inspector-proxy react react-bootstrap react-i18next react-native react-native-web