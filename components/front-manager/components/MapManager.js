import '../node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import '../node_modules/leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';
import MapContainer from './MapContainer';
import React, { useEffect, useRef, useState } from "react";
import { fetchCoordinates, fetchAndPrepareSpots } from "../backend_interface/db_manager_api";
import { useQuery } from 'react-query'

// This is the main component of the Map which should connect with APIs to get the required info to feed it down
const MapManager = () => {  
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
  return (
    <div>
      <MapContainer locations={locations} spots={spots}/>
    </div>
  );
};
  
export default MapManager;
  

