import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

const mapStyles = {
  height: "400px",
  width: "100%",
};

const defaultCenter = {
  lat: 37.31942002016036,
  lng: -6.0678988062297465,
};


const Map = ({ coordinates, spots }) => {
  const [selectedMarker, setSelectedMarker] = useState(null); // Track selected marker for InfoWindow
  const canvasRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
  prepareMap();
  }, [coordinates, spots]);

  
  const prepareMap = (location) => {
    hideMap();
    // After the map is loaded, reveal the area around each marker
    if (mapRef.current && coordinates.length > 0) {
      coordinates.forEach((location) => {
        revealMapAroundMarker(location);
      });
    }
    if (mapRef.current && spots.length > 0) {
      spots.locations.forEach((location) => {
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
    ctx.globalCompositeOperation = "destination-out"; // Set to reveal the area
    ctx.beginPath();
    ctx.arc(offsetX, offsetY, calculateRadius(scale), 0, Math.PI * 2, true);
    ctx.fill();
  };

  const handleZoomChanged = (location) => {
    prepareMap(location);  
  
  };


  return (
    <div style={{ position: "relative" }}>
      {/* Canvas for revealing part of the map */}
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2, pointerEvents: "none"}} />

      {/* Interactive Google Map with markers */}
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={14}
          center={defaultCenter}
          onLoad={(map) => (mapRef.current = map)} // Store the map reference
          onZoomChanged={handleZoomChanged} // Add zoom change handler
          onDrag={handleZoomChanged} // Add zoom change handler
          onIdle={handleZoomChanged} // Add zoom change handler
        >
          {spots.locations.map((location, index) => (
            <Marker
              key={index}
              position={{ lat: location.latitude, lng: location.longitude }}
              onClick={() => setSelectedMarker(location)} // Set selected marker when clicked
            />
          ))}

          {/* InfoWindow for the selected marker */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
              onCloseClick={() => setSelectedMarker(null)} // Close InfoWindow when clicked outside
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
