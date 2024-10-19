import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

const mapStyles = {
  height: "400px",
  width: "100%",
};

const defaultCenter = {
  lat: 37.31942002016036,
  lng: -6.0678988062297465,
};

const Map = ({ coordinates }) => {
  const [selectedMarker, setSelectedMarker] = useState(null); // Track selected marker for InfoWindow

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={mapStyles} zoom={14} center={defaultCenter}>
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
            <div style={{ padding: "10px", maxWidth: "200px" }}> {/* Styled InfoWindow */}
              <h4 style={{ margin: 0 }}>{selectedMarker.name}</h4> {/* Ensure Name is visible */}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
