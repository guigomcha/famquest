import React, { useState, useEffect } from "react";
import Map from "./Map";
import { fetchCoordinates, fetchSpots, addLocationToSpot } from "./Api";

function App() {
  const [coordinates, setCoordinates] = useState([]);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading

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
        setLoading(false); // Set loading to false after data is fetched
      } catch (err) {
        console.error("Error fetching spots with location:", err);
        setLoading(false); // Stop loading even in case of an error
      }
    };

    // Call the function to fetch spots and update location
    prepareSpots();
  }, []);

  return (
    <div>
      <h1>Google Maps with Markers</h1>
      {/* Show loading indicator if data is still being fetched */}
      {loading ? (
        <div>Loading spots...</div> // Render this when spots are being fetched
      ) : (
        // Only render Map when spots are available
        <Map coordinates={coordinates} spots={spots} />
      )}
    </div>
  );
}

export default App;
