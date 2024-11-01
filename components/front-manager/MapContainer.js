import './node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import './node_modules/leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import {CanvasLayer} from "./CanvasLeaflet"
import React, { useEffect, useRef, useState } from "react";

const mapStyles = {
    height: "400px",
    width: "100%",
  };
  
const scale = 13;
const defaultCenter = {
  lat: 37.31942002016036,
  lng: -6.0678988062297465,
};
  
const MapContainer = ( {locations, spots } ) => {
  // const [selectedMarker, setSelectedMarker] = useState(null); // Track selected marker for InfoWindow
  const canvasRef = useRef(null);
  const mapRef = useRef(null);
  const locs = useRef(null);

  const prepareMap = () => {
    console.log("locations in prepare: "+ JSON.stringify(locs))
    // After the map is loaded, reveal the area around each marker
    if (mapRef.current && locs.current) {
      locs.current.forEach((location) => {
        console.log("used coordinate: "+ location.id)
        canvasRef.current.revealArea(
          mapRef.current.latLngToContainerPoint(L.latLng(location.latitude, location.longitude)),
          scale
        )
      });
    }
  };


  // 
  useEffect(() => {
    locs.current = locations;
    prepareMap();
  }, [locations]);

  useEffect(() => {
    if (!mapRef.current) {
      console.log("Adding event")
      mapRef.current = L.map('mapId').setView([defaultCenter.lat, defaultCenter.lng], scale);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
          // Create layer groups

      // Add layer group with circles
      const layerGroup = L.layerGroup().addTo(mapRef.current);
      L.circle([defaultCenter.lat+0.05, defaultCenter.lng+0.05], { color: 'blue', fillColor: 'blue', fillOpacity: 0.5, radius: 200 }).addTo(layerGroup);
      L.circle([defaultCenter.lat+0.08, defaultCenter.lng+0.05], { color: 'red', fillColor: 'red', fillOpacity: 0.5, radius: 100, stroke: false }).addTo(layerGroup);
      L.circle([defaultCenter.lat+0.06, defaultCenter.lng+0.05], { color: 'green', fillColor: 'green', fillOpacity: 0.5, radius: 100 }).addTo(layerGroup);

      // Add feature group with a popup and shapes
      const featureGroup = L.featureGroup().addTo(mapRef.current);
      // L.popup().setContent('Popup in FeatureGroup').setLatLng([defaultCenter.lat+0.15, defaultCenter.lng+0.05]).openOn(mapRef.current);
      L.circle([defaultCenter.lat+0.05, defaultCenter.lng+0.01], { color: 'purple', radius: 200 }).addTo(featureGroup);
      L.rectangle([[defaultCenter.lat+0.15, defaultCenter.lng+0.19],[defaultCenter.lat+0.05, defaultCenter.lng+0.25]], { color: 'purple', weight: 1 }).addTo(featureGroup);
      
      // Create a blue canvas overlay
      canvasRef.current = new CanvasLayer();
      featureGroup.addLayer(canvasRef.current);
      canvasRef.current.addTo(mapRef.current);

      // Events
      const handleEvent = () => {
        if (canvasRef.current) {
          canvasRef.current.redraw(mapRef.current); // Pass current map
        }
      };
      mapRef.current.addEventListener('zoom', handleEvent);
      mapRef.current.addEventListener('zoomend', handleEvent);
      mapRef.current.addEventListener('move', handleEvent);
      mapRef.current.addEventListener('moveend', handleEvent);
      mapRef.current.addEventListener('drag', handleEvent);
      mapRef.current.addEventListener('idle', handleEvent);
      mapRef.current.addEventListener('dragend', handleEvent);
      mapRef.current.addEventListener('resize', handleEvent);
      
      // Create overlay controls
      const overlays = {
        // "Marker with popup": marker,
        "Layer group with circles": layerGroup,
        "Feature group": featureGroup
      };

      L.control.layers(null, overlays, { collapsed: false }).addTo(mapRef.current);
    }
  
    return () => {
    };
  }, []);

  
  // Add the markers in the spots
  useEffect(() => {
    if (mapRef.current && spots) {
      spots.forEach((spot) => {
        console.log("used spot: "+ spot.id)
        // Adding a marker with custom icon
        L.marker([spot.location.latitude, spot.location.longitude], {
          icon: L.icon({
            iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
            iconSize: [28, 75],
            iconAnchor: [22, 94],
            popupAnchor: [-3, -76],
            zIndexOffset: 1
          }),
        })
          .addTo(mapRef.current)
          .bindPopup(spot.name);
      });
    }
      
  }, [spots]);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%"}}>
      {/* Canvas for revealing part of the map */}
      {/* <canvas ref={canvasRef} style={{position: "absolute", width: "100%", height: "100%", zIndex: 10000, pointerEvents: "none"}} /> */}
      <div id="mapId" style={{ height: '100vh', width: '100vw' }}></div>;
    </div>
  );
};
  
export default MapContainer;
