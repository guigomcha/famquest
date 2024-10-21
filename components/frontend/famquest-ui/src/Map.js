import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { fetchSpots, fetchLocation } from './api'; // Adjust the import as necessary

const mapStyles = {
  height: "400px",
  width: "100%",
};

const defaultCenter = {
  lat: 37.31942002016036,
  lng: -6.0678988062297465,
};

const Map = ({ locations }) => {
  const [selectedMarker, setSelectedMarker] = useState(null); // Track selected marker for InfoWindow
  const [markers, setMarkers] = useState([]); // State to store markers
  const canvasRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    prepareMap();
  }, [locations]);

  const prepareMap = () => {
    hideMap();
    if (mapRef.current && locations.length > 0) {
      locations.forEach((location) => {
        revealMapAroundMarker(location);
      });
    }
  };

  const hideMap = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Set canvas size based on the map container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    // Fill the entire canvas with a black mask initially
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const calculateRadius = (scale) => {
    // Cap radius based on the scale thresholds
    const minRadius = 10;
    const maxRadius = 100;
    const minScale = 500;
    const maxScale = 200000;

    if (scale >= maxScale) return maxRadius;
    if (scale <= minScale) return minRadius;

    // Linear interpolation to smoothly adjust radius based on scale
    const ratio = (scale - minScale) / (maxScale - minScale);
    return minRadius + ratio * (maxRadius - minRadius);
  };

  const revealMapAroundMarker = (location) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // const bounds = mapRef.current.getBounds();
    const projection = mapRef.current.getProjection();
    const scale = Math.pow(2, mapRef.current.getZoom());
  
    // Convert LatLng to pixel position on the map
    const latLng = new window.google.maps.LatLng(location.latitude, location.longitude);
    const point = projection.fromLatLngToPoint(latLng);
    const centerPoint = projection.fromLatLngToPoint(mapRef.current.getCenter());
  
    const offsetX = (point.x - centerPoint.x) * scale + canvas.width / 2;
    const offsetY = (point.y - centerPoint.y) * scale + canvas.height / 2;

    // Clear a circular area to reveal the map beneath the marker
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(offsetX, offsetY, calculateRadius(scale), 0, Math.PI * 2, true);
    ctx.fill();
  };

  const handleZoomChanged = () => {
    prepareMap();
  };

  // Fetch spots and locations
  useEffect(() => {
    const loadSpots = async () => {
      const spots = await fetchSpots();
      const locationsPromises = spots.map(async (spot) => {
        const location = await fetchLocation(spot.location);
        return { ...spot, position: location }; // Combine spot data with its fetched position
      });

      const resolvedMarkers = await Promise.all(locationsPromises);
      setMarkers(resolvedMarkers); // Update the markers state
    };

    loadSpots();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* Canvas for revealing part of the map */}
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2, pointerEvents: "none" }} />

      {/* Interactive Google Map with markers */}
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={14}
          center={defaultCenter}
          onLoad={(map) => (mapRef.current = map)}
          onZoomChanged={handleZoomChanged}
          onDrag={handleZoomChanged}
          onIdle={handleZoomChanged}
        >
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={{ lat: marker.position.latitude, lng: marker.position.longitude }} // Adjust according to your location structure
              onClick={() => setSelectedMarker(marker)}
            />
          ))}

          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.position.latitude, lng: selectedMarker.position.longitude }} // Adjust as needed
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div style={{ padding: "10px", maxWidth: "200px" }}>
                <h4 style={{ margin: 0 }}>{selectedMarker.name}</h4>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default Map;
