import React, { useEffect, useRef, useState } from "react";
import { View } from 'react-native';
import MapContainer from './MapContainer';
import { fetchCoordinates, fetchSpots, addLocationToSpot } from "./db_manager_api";

export default function App() {
  const [coordinates, setCoordinates] = useState([]);
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    // Fetch coordinates only once on component mount
    fetchCoordinates()
      .then((data) => setCoordinates(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const prepareSpots = async () => {
      try {
        // Fetch spots data
        const spotsData = await fetchSpots();

        // Wait for all spots to be updated with location
        const spotsWithLocation = await Promise.all(
          spotsData.map(async (spot) => {
            const updatedSpot = await addLocationToSpot(spot);
            console.info("Updated spot with location:", updatedSpot); // Log each updated spot
            return updatedSpot;
          })
        );

        // Set the fully fetched spots with location data
        setSpots(spotsWithLocation);
      } catch (err) {
        console.error("Error fetching spots with location:", err);
      }
    };
    // Call the function to fetch spots and update location
    prepareSpots();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%"}}>
    <View >
      <MapContainer coordinates={coordinates} spots={spots}  />
    </View>
    </div>
  );
}