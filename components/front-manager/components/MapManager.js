import 'leaflet-defaulticon-compatibility';
import 'leaflet/dist/leaflet.css';
import MapContainer from './MapContainer';
import SlideMenu from './SlideMenu';
import React, { useEffect, useRef, useState } from "react";
import { fetchCoordinates, fetchAndPrepareSpots } from "../backend_interface/db_manager_api";
import { useQuery } from 'react-query'

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
const MapManager = () => {  
  const [component, setComponent] = useState(null);
  
  // const [locations, setLocations] = useState(debugLocations)
  // const [spots, setSpots] = useState(debugSpots)
  const [locations, setLocations] = useState([])
  const [spots, setSpots] = useState([])
  const { 
    isLoadingLocations, 
    errorLocations, 
    data: dataLocations 
  } = useQuery('locations', fetchCoordinates, {
    keepPreviousData: true,
    onSettled: (data, error) => {
      setLocations(data);
    }
  });
  const { 
    isLoadingSpots, 
    errorSpots, 
    data: dataSpots 
  } = useQuery('spots', fetchAndPrepareSpots, {
    keepPreviousData: true,
    onSettled: (data, error) => {
      setSpots(data);
    }
  });
  if (isLoadingLocations || isLoadingSpots ) {
    return <p>Loading...</p>;
  } else if (errorLocations || errorSpots ) {
    return <p>Error Location {errorLocations.message}<br>Error spots {errorSpots.message}</br></p>;
  }
  const handleMenuChange = (comp) => {
    setComponent(comp); // Trigger show slideMenu
  }; 
  return (
    <div>
      <MapContainer locations={locations} spots={spots} handleMenuChange={handleMenuChange}/>
        {component && <SlideMenu component={component} ></SlideMenu>}
    </div>
  );
};
  
export default MapManager;
  

