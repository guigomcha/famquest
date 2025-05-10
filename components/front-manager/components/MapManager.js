import 'leaflet-defaulticon-compatibility';
import 'leaflet/dist/leaflet.css';
import MapContainer from './MapContainer';
import SlideMenu from './SlideMenu';
import React, { useEffect, useRef, useState } from "react";

import '../css/classes.css';


// This is the main component of the Map which should connect with APIs to get the required info to feed it down
const MapManager = ( {handleMapRef, user} ) => {  
  const [component, setComponent] = useState(null);

  const handleMenuChange = (comp) => {
    setComponent(comp); // Trigger show slideMenu
  }; 
  const transferHandleMapRef = (map) => {
    handleMapRef(map); 
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer handleMenuChange={handleMenuChange} handleMapRef={transferHandleMapRef} user={user}/>
      {component && <SlideMenu component={component} handledFinished={handleMenuChange}></SlideMenu>}
    </div>
  );
};

export default MapManager;
  

