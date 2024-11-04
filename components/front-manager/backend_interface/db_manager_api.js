// export const fetchCoordinates = async () => {
//   // Simulate API call
//   return [
//     { lat: 37.321355840986044, lng: -6.056325106677641 }, // Sample coordinates (Blue Padel)
//     { lat: 37.31942002016036, lng: -6.0678988062297465 }, // Sample coordinates (Palomares)
//   ];
// };

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const fetchCoordinates = async () => {
  try {
    const response = await fetch(`${API_URL}/location`, {
      headers: {
        'accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Use response.json() to parse the JSON body
    const coordinates = await response.json();

    // Assuming the API returns { coordinates: [{ lat: ..., lng: ... }] }
    // console.info("Fetched locations "+ JSON.stringify(coordinates))
    return coordinates;  // Returning the coordinates array
  } catch (error) {
    console.error("Error fetching coordinates: ", error);
    return [];
  }
};
export const fetchSpots = async () => {
  try {
    const response = await fetch(`${API_URL}/spot`, {
      headers: {
        'accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Use response.json() to parse the JSON body
    const spots = await response.json();
    // Return location + info about task for the markers
    // console.info(spots)
    return spots;  // Returning the spots array
  } catch (error) {
    console.error("Error fetching spots: ", error);
    return [];
  }
};

export const fetchAndPrepareSpots = async () => {
  try {
    // Fetch spots data
    const spotsData = await fetchSpots();

    // Wait for all spots to be updated with location
    const spotsWithLocation = await Promise.all(
      spotsData.map(async (spot) => {
        const updatedSpot = await addLocationToSpot(spot);
        // console.info("Updated spot with location:", updatedSpot); // Log each updated spot
        return updatedSpot;
      })
    );

    // Set the fully fetched spots with location data
    return spotsWithLocation;
  } catch (err) {
    console.error("Error fetching spots with location:", err);
  }
};

export const addLocationToSpot = async (spot) => {
  // Replace with your API call logic
  //console.info("Spot: "+spot.id)
  const response = await fetch(`${API_URL}/location/${spot.location}`, {
    headers: {
      'accept': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const location = await response.json();
  //console.info("Spot: "+spot.id+" "+JSON.stringify(location))
  spot.location = location
  //console.info(spot)
  return spot; // Combine original spot with additional data
};