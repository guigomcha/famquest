  - [Description](#description)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Run tests](#run-tests)
  - [Documentation](#documentation)
  - [API documentation](#api-documentation)

# Frontend

## Description

The idea is to have a view of google-map which is discovered based on the location history of the user.

There are several pages that need to be shown floating on top of the main webpage.
- https://www.freecodecamp.org/news/how-work-with-restful-apis-in-react-simplified-steps-and-practical-examples/

## Getting Started


### Prerequisites

React JS
- node -v v18.20.4
- npm -v 10.7.0

```bash
sudo apt install npm
sudo apt install nodejs
npm install -g expo-cli

# if error ->  trying to overwrite '/usr/include/node/common.gypi', which is also in package libnode-dev 12.22.9~dfsg-1ubuntu3.6
sudo apt remove nodejs
sudo dpkg --remove --force-remove-reinstreq libnode-dev
sudo dpkg --remove --force-remove-reinstreq libnode72:amd64
sudo apt install nodejs
```

```bash
npx create-react-app famquest-ui
# npm install @react-google-maps/api
sudo npm install -g expo-cli
npm install react react-dom leaflet
npm install react-leaflet
npm install -D @types/leaflet
npm install leaflet-defaulticon-compatibility - save
npx expo install react-native-web react-dom @expo/metro-runtime
npx expo start
```

### Installation


### Run tests


## Documentation


## API documentation

