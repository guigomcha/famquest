import './node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import './node_modules/leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';
import MapContainer from './MapContainer';
import * as L from 'leaflet';
import React, { useEffect, useRef, useState } from "react";
import { fetchCoordinates, fetchAndPrepareSpots } from "./db_manager_api";
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'


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
      console.log("locations onsuccess: "+ JSON.stringify(data))
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
      console.log("spots onsuccess: "+ JSON.stringify(data))
      setSpots(data);
    }
  });
  if (isLoadingLocations || isLoadingSpots ) {
    return <p>Loading...</p>;
  } else if (errorLocations || errorSpots ) {
    return <p>Error Location {errorLocations.message}<br>Error spots {errorSpots.message}</br></p>;
  } 
  return (
    <MapContainer locations={locations} spots={spots}/>
  );
};
  
export default MapManager;
  

