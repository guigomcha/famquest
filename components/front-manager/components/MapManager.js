import 'leaflet-defaulticon-compatibility';
import 'leaflet/dist/leaflet.css';
import MapContainer from './MapContainer';
import SlideMenu from './SlideMenu';
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from 'react-query'
import { Spin, Alert } from 'antd';
import { fetchCoordinates, fetchAndPrepareSpots } from "../backend_interface/db_manager_api";
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
  
  // const [locations, setLocations] = useState(debugLocations)
  // const [spots, setSpots] = useState(debugSpots)

  const [locations, setLocations] = useState([])
  const [spots, setSpots] = useState([])
  const { 
    isLoading: isLoadingLocations, 
    error: errorLocations , 
    data: dataLocations 
  } = useQuery('locations', fetchCoordinates, {
    keepPreviousData: true,
    onSettled: (data, error) => {
      if (error) {
        console.info("error fetching locations", error);
      }
      setLocations(data);
    }
  });
  const { 
    isLoading: isLoadingSpots, 
    error: errorSpots, 
    data: dataSpots 
  } = useQuery('spots', fetchAndPrepareSpots, {
    keepPreviousData: true,
    onSettled: (data, error) => {
      if (error) {
        console.info("error fetching spots", error);
      }
      setSpots(data);
    }
  });
  const handleMenuChange = (comp) => {
    setComponent(comp); // Trigger show slideMenu
  }; 
  const transferHandleMapRef = (map) => {
    handleMapRef(map); 
  }; 
  if (isLoadingLocations || isLoadingSpots){
    return (<Spin>Loading</Spin>);
  } else if (errorLocations || errorSpots){
    return (<Alert
      message="Unable to load spots or locations."
      description="check console logs"
      type="error"
    /> );
  } 
  
  return (
    <>
      {(isLoadingLocations || isLoadingSpots) && (
        <div className="spin-overlay">
        <Spin tip="Loading"></Spin>
        </div>
      )}
      {(errorLocations || errorSpots) && (
        <div className="spin-overlay">
          <Alert
            message="Unable to load spots or locations."
            description="check console logs"
            type="error"
          />  
        </div>
      )}
      <div>
        <MapContainer locations={locations} spots={spots} handleMenuChange={handleMenuChange} handleMapRef={transferHandleMapRef}/>
        {component && <SlideMenu component={component} ></SlideMenu>}
      </div>
    </>
  );
};
  
export default MapManager;
  

