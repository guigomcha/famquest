import '../node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import '../node_modules/leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import React, { useEffect, useRef, useState } from "react";
import SpotForm from './SpotForm';
import SpotPopup from './SpotPopup';
import { SpotFromForm } from '../backend_interface/components_helper';
import { worldPolygon, uncoverFog, locationVisible } from '../backend_interface/fog_functions';
import { Spin, Alert } from 'antd';
import { getInDB, fetchAndPrepareSpots } from "../backend_interface/db_manager_api";
import { useTranslation } from "react-i18next";
const scale = 13;

const defaultCenter = {
  lat: 37.31942002016036,
  lng: -6.0678988062297465,
};

const iconStyle = {
  iconUrl: 'assets/marker-icon.png',
  iconSize: [24, 36],
  iconAnchor: [12, 36],
};

const MapContainer = ( { handleMenuChange, handleMapRef } ) => {
  const { t, i18n } = useTranslation();
  const mapRef = useRef(null);
  const guilleSpotsGroup = useRef(null);
  const featureGroup = useRef(null);
  const markers = useRef(null);
  const fogLayer = useRef(null);
  const fogGeoJson = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const allDiscovered = useRef(null);
  const allLocations = useRef(null);
  const [spots, setSpots] = useState([]);

  const handleTrigger = (e) => {
    fetchData();
  };

  const fetchData = async () => {
    const tempLocations = await getInDB('location');
    console.info("Fetched initial locations ", tempLocations);
    // setLocations(tempLocations);
    allLocations.current = tempLocations;
    const tempDiscovered = await getInDB('discovered');
    console.info("Fetched initial discovered ", tempDiscovered);
    // setDiscovered(tempDiscovered);
    allDiscovered.current = tempDiscovered;
    prepareMap();
  };

  const prepareMap = () => {
    // After the map is loaded, reveal the area around each marker
    if (mapRef.current && allLocations.current && fogLayer.current) {
      allLocations.current.forEach((location, index) => {
        if (location.refId != 0) {
          console.info("Checking it should display spot: ", location.refId);
          let visible = true;
          let markerRef = null;
          markers.current.forEach((mark) => {
            if (mark.spotId == location.refId){
              markerRef = mark.marker;
            }
          })
          // Visibility based on Fog
          if (!isVisibleWithFog(location)){
            visible = false;
          }
          // // The show condition is only for the target user (which uses the fog)
          // find it 
          if (mapRef.current.hasLayer(featureGroup.current) && visible){
            discovered = allDiscovered.current.filter(item => item.refId == location.refId && item.refType == "spot")
            visible = discovered?.show || true;
          }
          // Visibility based on spot condition which is handled in the backend
          if (!visible){
            if (markerRef) {
              guilleSpotsGroup.current.removeLayer(markerRef);
              markers.current = markers.current.filter(item => item.spotId != location.refId);
            }
            return;
          }
          // Todo: Decide the owner based on something
          // Adding a marker with custom icon
          const marker = L.marker([location.latitude, location.longitude], {
            icon: L.icon(iconStyle),
          }).addTo(mapRef.current);
          marker.data = {...location, componentType: "SpotPopup"}
          marker.addEventListener("click", sendBackComponent);
          guilleSpotsGroup.current.addLayer(marker);
          markers.current.push({"spotId": location.refId, "marker": marker});
          return;
        } else {
          //Uncover new area in fog
          fogGeoJson.current = uncoverFog(location, fogGeoJson.current);
          featureGroup.current.removeLayer(fogLayer.current);
          fogLayer.current = L.geoJSON([fogGeoJson.current], {
            style(feature) {
              return feature.properties && feature.properties.style;
            },
          });
          featureGroup.current.addLayer(fogLayer.current);
        }
      });
    }
  };
  
  const sendBackComponent = (e) => {
    if (e == "done") {
      handleMenuChange(null);
      fetchData();
    } else if (e?.target.data.componentType == "SpotPopup") {
      console.info("opening a spot from map ", e);
      handleMenuChange(<SpotPopup location={e.target.data} handledFinished={sendBackComponent}/>);
    } else {
      console.info("opening a new form from map ", e);
      handleMenuChange(<SpotForm initialData={e.target.data} handledFinished={sendBackComponent}/>);
    }
  };

  const isVisibleWithFog = (location) => {
    if (!mapRef.current.hasLayer(featureGroup.current)){
      // console.info("mask disabled: "+ JSON.stringify(location));
    } else if (!locationVisible(location, fogGeoJson.current)){
      console.info("can only right click and see outside of fog");
      return false;
    }
    return true;
  }

  // Create and configure the map
  useEffect(() => {
    if (!mapRef.current) {
      setIsLoading(true);
      console.log("Creating the map:", isLoading);
      const mapDiv = document.getElementById("mapId");
      mapRef.current = L.map(mapDiv).setView([defaultCenter.lat, defaultCenter.lng], scale);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'GuiGomcha FamQuest App',
      }).addTo(mapRef.current);
      L.control.scale().addTo(mapRef.current);
      handleMapRef(mapRef);
      // To support map inside of tab
      const resizeObserver = new ResizeObserver(() => {
        mapRef.current.invalidateSize();
      });      
      resizeObserver.observe(mapDiv);
      
      // Add layer group to host the spots from 1 user
      guilleSpotsGroup.current = L.layerGroup().addTo(mapRef.current);
      // Create the fog if it doesn't exist
      if (!fogLayer.current){
        fogGeoJson.current = worldPolygon();
        fogLayer.current = L.geoJSON([fogGeoJson.current], {
          style(feature) {
            return feature.properties && feature.properties.style;
          },
        }).addTo(mapRef.current);
        fogLayer.current.bringToFront();
        // Add feature group to enable/disable the discovery map
        featureGroup.current = L.featureGroup().addTo(mapRef.current);
        featureGroup.current.addLayer(fogLayer.current);
        featureGroup.current.on('remove', (e) => {
          console.info("mask removed", e);
          prepareMap();
        });
        featureGroup.current.on('add', (e) => {
          console.info("mask added", e);
          prepareMap();
        });
        
      }
      // Right click to create a new spot
      mapRef.current.on('contextmenu', (e) => {
        // check if the location is within the fog or not
        console.info("Right click detected: "+ JSON.stringify(e.latlng)+ "from ", e);
        console.info("Layers has: ", mapRef.current.hasLayer(featureGroup.current));

        if (!isVisibleWithFog({"longitude": e.latlng.lng, "latitude": e.latlng.lat})){
          return;
        }
        data = {
          "target": {
            "data": {"lat": e.latlng.lat, "lng": e.latlng.lng,  "componentType": "SpotForm"}
          }
        }
        sendBackComponent(data);
      }); 
      
      // Create overlay controls
      const overlays = {
        "Spots": guilleSpotsGroup.current,
        "Mask map": featureGroup.current
      };
      L.control.layers(null, overlays, { collapsed: false }).addTo(mapRef.current);
      mapRef.current.removeLayer(featureGroup.current);
      markers.current = []
      fetchData();
      setIsLoading(false);
      console.log("created the map:", isLoading);
    }
  
  }, []);


  return (
    <div style={{ position: "relative", width: "100%", height: "100%"}}>
      {(isLoading) &&<Spin>{t('loading')}</Spin>}
      <div id="mapId" style={{ height: '100vh', width: '100vw' }}>
      </div>
    </div>
  );
};
  
export default MapContainer;
