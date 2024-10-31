import './node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import './node_modules/leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from "react";

import { MapContainer as Map, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';


const mapStyles = {
    height: "400px",
    width: "100%",
  };
  
const defaultCenter = {
  lat: 37.31942002016036,
  lng: -6.0678988062297465,
};

  
const MapContainer = ({ coordinates , spots }) => {
  // const [selectedMarker, setSelectedMarker] = useState(null); // Track selected marker for InfoWindow
  const canvasRef = useRef(null);
  const mapRef = useRef(null);
  
  const prepareMap = () => {
    hideMap();
    // After the map is loaded, reveal the area around each marker
    if (mapRef.current && coordinates.length > 0) {
      coordinates.forEach((location) => {
        revealMapAroundMarker(location);
      });
    }
  }; 
  
  const calculateRadius = (scale) => {
    // Cap radius based on the scale thresholds
    const minRadius = 10;
    const maxRadius = 100;
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
    const ctx = canvas.getContext("2d");

    // Set canvas size based on the map container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fill the entire canvas with a black mask initially
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  };

  // Use this component to add event listeners to the map
  function MapEventHandlers() {
    const map = useMapEvents({
      zoom: prepareMap,
      zoomend: prepareMap,   // Trigger when zoom ends
      move: prepareMap,
      moveend: prepareMap,
      drag: prepareMap,
      resize: prepareMap,
    });

    // Store the map instance in mapRef when map is created
    if (!mapRef.current) {
      mapRef.current = map;
    }

    return null;  // No need to render anything
  }
  useEffect(() => {
    hideMap();
  }, []);
  useEffect(() => {
    prepareMap();
  }, [coordinates, spots]);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%"}}>
    {/* Canvas for revealing part of the map */}
    <canvas ref={canvasRef} style={{position: "absolute", width: "100%", height: "100%", zIndex: 2, pointerEvents: "none"}} />

        <Map
            center={[defaultCenter.lat, defaultCenter.lng]}
            zoom={13}
            scrollWheelZoom={true}
            style={mapStyles}
            whenCreated={(mapInstance) => (mapRef.current = mapInstance)} // Store map reference    
            zIndex={1}  
        >
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[defaultCenter.lat, defaultCenter.lng]}>
            <Popup>
                An approach to solve using osm in expo web platform.
            </Popup>
        </Marker>
        {/* <MapEventHandlers /> */}
     </Map>
     </div>
  );
};
  
export default MapContainer;
  