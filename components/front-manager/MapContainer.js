import './node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import './node_modules/leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import React, { useEffect, useRef, useState } from "react";
import { fetchCoordinates, fetchAndPrepareSpots } from "./db_manager_api";
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'

const mapStyles = {
    height: "400px",
    width: "100%",
  };
  
const defaultCenter = {
  lat: 37.31942002016036,
  lng: -6.0678988062297465,
};
  
const MapContainer = () => {
  // const [selectedMarker, setSelectedMarker] = useState(null); // Track selected marker for InfoWindow
  const canvasRef = useRef(null);
  const mapRef = useRef(null);
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
      if (data) {
        setLocations(data);
      }
      // prepareMap()
    }
  });
  const { 
    isLoadingSpots, 
    errorSpots, 
    dataSpots 
  } = useQuery('spots', fetchAndPrepareSpots, {
    keepPreviousData: true,
  });
  const prepareMap = function() {
    hideMap();
    console.log("locations in prepare: "+ JSON.stringify(this.locations))
    // After the map is loaded, reveal the area around each marker
    if (mapRef.current && this.locations) {
      this.locations.forEach((location) => {
        console.log("used coordinate: "+ location.id)
        revealMapAroundMarker(location);
      });
    }
  }.bind({ locations });

  const calculateRadius = (scale) => {
    // Cap radius based on the scale thresholds
    const minRadius = 200;
    const maxRadius = 600;
    const minScale = 500;
    const maxScale = 200000;
  
    // If scale is greater than the max scale, cap radius to maxRadius
    if (scale >= maxScale) return maxRadius;
  
    // If scale is less than the min scale, cap radius to minRadius
    if (scale <= minScale) return minRadius;
  
    // Linear interpolation to smoothly adjust radius based on scale
    const ratio = (scale - minScale) / (maxScale - minScale);
    const radius = minRadius + ratio * (maxRadius - minRadius);
  
    return radius;
  };
  const revealMapAroundMarker = (location) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    // Assuming you have a reference to your leaflet map using ref (mapRef)
    const map = mapRef.current;
  
    if (!map) return;
  
    // Leaflet method to convert LatLng to pixel position on the map
    const latLng = L.latLng(location.latitude, location.longitude);
    const point = map.latLngToLayerPoint(latLng);  // Converts LatLng to a pixel position
  
    // Convert the center of the map to a pixel point
    const centerLatLng = map.getCenter();
    const centerPoint = map.latLngToLayerPoint(centerLatLng);
  
    // Calculate offsets based on zoom level
    const scale = map.getZoom();  // Leaflet zoom level
    const offsetX = point.x - centerPoint.x + canvas.width / 2;
    const offsetY = point.y - centerPoint.y + canvas.height / 2;
  
    // Clear a circular area on the canvas to reveal the map beneath the marker
    ctx.globalCompositeOperation = "destination-out";  // Set to reveal the area
    ctx.beginPath();
    ctx.arc(offsetX, offsetY, calculateRadius(scale), 0, Math.PI * 2, true);
    ctx.fill();
  };
  const hideMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext("2d");

    // Set canvas size based on the map container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fill the entire canvas with a black mask initially
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  };

  // First load the map
  useEffect(() => {
    // Check if map is already initialized
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map('mapId').setView([defaultCenter.lat, defaultCenter.lng], 13);   
      // mapRef.current.on('zoom', prepareMap);
      // mapRef.current.on('zoomend', prepareMap);
      // mapRef.current.on('move', prepareMap);
      // mapRef.current.on('moveend', prepareMap);
      // mapRef.current.on('drag', prepareMap);
      // mapRef.current.on('dragend', prepareMap);
      // mapRef.current.on('resize', prepareMap);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }
    // Hide everything
    // hideMap();
  }, []);

  if (isLoadingLocations || isLoadingSpots ) {
    return <p>Loading...</p>;
  } else if (errorLocations || errorSpots ) {
    return <p>Error Location {errorLocations.message}<br>Error spots {errorSpots.message}</br></p>;
  } 
  else {
    // useEffect(() => {
    prepareMap();
    // });
  }
  
  // Add the markers in the spots
  useEffect(() => {
    if (mapRef.current && dataSpots) {
      dataSpots.forEach((spot) => {
        console.log("used spot: "+ location.id)
        // Adding a marker with custom icon
        L.marker([spot.location.latitude, spot.location.longitude], {
          icon: L.icon({
            iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
            iconSize: [28, 75],
            iconAnchor: [22, 94],
            popupAnchor: [-3, -76],
          }),
        })
          .addTo(mapRef.current)
          .bindPopup('I am an example marker.');
      });
    }
      
  }, [])
  return (
    <div style={{ position: "relative", width: "100%", height: "100%"}}>
      {/* Canvas for revealing part of the map */}
      <canvas ref={canvasRef} style={{position: "absolute", width: "100%", height: "100%", zIndex: 10000, pointerEvents: "none"}} />
      <div id="mapId" style={{ height: '100vh', width: '100vw' }}></div>;
    </div>
  );
};
  
export default MapContainer;
  