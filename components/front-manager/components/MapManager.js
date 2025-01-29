import 'leaflet-defaulticon-compatibility';
import 'leaflet/dist/leaflet.css';
import MapContainer from './MapContainer';
import SlideMenu from './SlideMenu';
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from 'react-query'
import { Spin, Alert } from 'antd';

import '../css/classes.css';

const debugLocations = [
  { latitude: 37.321355840986044, longitude: -6.056325106677641 }, // Sample coordinates (Blue Padel)
  { latitude: 37.31942002016036, longitude: -6.0678988062297465 }, // Sample coordinates (Palomares)
]
const debugSpots = [
  {
    "id": "1",
    "name": "first",
    "description": "first description",
    "location": { latitude: 37.31942002016036, longitude: -6.0678988062297465 }, 
    "refId": 0, 
  },
  {
    "id": "2",
    "name": "first",
    "description": "first description",
    "refId": 1, 
    "location": { latitude: 37.35942002016036, longitude: -6.0678988062297465 }, 
  }
]

// This is the main component of the Map which should connect with APIs to get the required info to feed it down
const MapManager = ( {handleMapRef} ) => {  
  const [component, setComponent] = useState(null);

  const handleMenuChange = (comp) => {
    setComponent(comp); // Trigger show slideMenu
  }; 
  const transferHandleMapRef = (map) => {
    handleMapRef(map); 
  };   
  return (
    <>
      <div>
        <MapContainer handleMenuChange={handleMenuChange} handleMapRef={transferHandleMapRef}/>
        {component && <SlideMenu component={component} handledFinished={handleMenuChange}></SlideMenu>}
      </div>
    </>
  );
};
  
export default MapManager;
  

