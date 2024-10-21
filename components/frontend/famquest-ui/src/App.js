import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react";
import Map from "./Map";
import { fetchLocations } from "./api";

function App() {
  const [locations, setCoordinates] = useState([]);

  useEffect(() => {
    fetchLocations()
      .then((data) => setCoordinates(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Google Maps with Markers</h1>
      <Map coordinates={locations} />
    </div>
  );
}

export default App;
