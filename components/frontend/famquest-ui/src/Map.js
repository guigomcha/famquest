import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapStyles = {
  height: "400px",
  width: "100%",
};

const defaultCenter = {
  lat: 37.3119, // Default to NYC
  lng: -6.0467,
};

const Map = ({ coordinates }) => {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={mapStyles} zoom={10} center={defaultCenter}>
        {coordinates.map((coordinate, index) => (
          <Marker key={index} position={{ lat: coordinate.lat, lng: coordinate.lng }} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
