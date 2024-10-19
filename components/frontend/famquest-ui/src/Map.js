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

const revealRadius = 500; // Radius for map reveal in pixels

const Map = ({ coordinates }) => {
  const [selectedMarker, setSelectedMarker] = useState(null); // Track selected marker for InfoWindow
  const canvasRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size based on the map container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fill the entire canvas with a black mask initially
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // After the map is loaded, reveal the area around each marker
    if (mapRef.current && coordinates.length > 0) {
      coordinates.forEach((markerPos) => {
        revealMapAroundMarker(markerPos);
      });
    }
  }, [coordinates]);

  const revealMapAroundMarker = (markerPos) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const projection = mapRef.current.getProjection();
    const scale = Math.pow(2, mapRef.current.getZoom());
    const bounds = mapRef.current.getBounds();
    // Convert LatLng to pixel position on the map
    const latLng = new window.google.maps.LatLng(markerPos.latitude, markerPos.longitude);
    const point = projection.fromLatLngToPoint(latLng);
    const centerPoint = projection.fromLatLngToPoint(mapRef.current.getCenter());

    const offsetX = (point.x - centerPoint.x) * scale + canvas.width / 2;
    const offsetY = (point.y - centerPoint.y) * scale + canvas.height / 2;

    // Clear a circular area to reveal the map beneath the marker
    ctx.globalCompositeOperation = "destination-out"; // Set to reveal the area
    ctx.beginPath();
    ctx.arc(offsetX, offsetY, revealRadius, 0, Math.PI * 2, true);
    ctx.fill();
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Blurred Google Map Background */}
      <div className="map-blur" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={14}
            center={defaultCenter}
            onLoad={(map) => (mapRef.current = map)} // Store the map reference
          />
        </LoadScript>
      </div>

      {/* Canvas for revealing part of the map */}
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2, pointerEvents: "none"}} />

      {/* Interactive Google Map with markers */}
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={14}
          center={defaultCenter}
          onLoad={(map) => (mapRef.current = map)} // Store the map reference
        >
          {coordinates.map((coordinate, index) => (
            <Marker
              key={index}
              position={{ lat: coordinate.latitude, lng: coordinate.longitude }}
              onClick={() => setSelectedMarker(coordinate)} // Set selected marker when clicked
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
