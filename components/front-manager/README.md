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
This is going to be a Progresive Web App
- https://www.freecodecamp.org/news/what-are-progressive-web-apps/
- https://www.youtube.com/watch?v=4XT23X0Fjfk&list=PL4cUxeGkcC9gTxqJBcDmoi5Q2pzDusSL7

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
npx create-react-app front-manager
npm install expo-cli
npx expo install react-native-web react-dom @expo/metro-runtime
npm install react react-dom leaflet
npm install react-leaflet
npm install -D @types/leaflet
npm install leaflet-defaulticon-compatibility
npm install react-query
npx expo install react-native-web react-dom @expo/metro-runtime
npx expo start

npx expo export --platform web
```

```bash
cd ../../
docker build -t ghcr.io/guigomcha/famquest/frontmanager:latest -f components/front-manager/install/Dockerfile --progress plain  --network=host .
cd components/front-manager
```

Trying to run android emulator: 
- Android studio has to be on the wondows side and can only interact with backends running also on the windows side or deployed with docker in WSL.

Refs used:
- https://gist.github.com/sushant-at-nitor/30ca1185f2501f55fff61752d18387cc
- https://atekihcan.com/blog/codeorrandom/how-to-setup-android-sdk-on-wsl/
- https://medium.com/@danielrauhut/running-expo-dev-builds-from-wsl-on-your-windows-virtual-devices-android-emulator-bd7cc7e29418
- Pending https://dev.to/ghost/running-exporeact-native-in-docker-4hme

### Installationw


### Run tests


## Documentation


## API documentation

https://user-images.githubusercontent.com/23381975/229468456-36d01223-2820-46d6-86a5-441aef5a1640.mp4

https://github.com/leahbanks/BE-through-the-fog

https://github.com/Mburnand-tech/Through-the-fog/tree/master

https://blog.logrocket.com/complete-guide-react-native-web/

https://snack.expo.dev/