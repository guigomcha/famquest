import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react";
import Map from "./Map";
import { fetchCoordinates } from "./api";

function App() {
  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    fetchCoordinates()
      .then((data) => setCoordinates(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Google Maps with Markers</h1>
      <Map coordinates={coordinates} />
    </div>
  );
}

export default App;
