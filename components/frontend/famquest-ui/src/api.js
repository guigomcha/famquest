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
    console.info(coordinates)
    return coordinates;  // Returning the coordinates array
  } catch (error) {
    console.error("Error fetching coordinates: ", error);
    return [];
  }
};
export const fetchSpotsWithLocation = async () => {
  try {
    const response = await fetch(`${API_URL}/spots`, {
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
    console.info(spots)
    return spots;  // Returning the spots array
  } catch (error) {
    console.error("Error fetching spots: ", error);
    return [];
  }
};