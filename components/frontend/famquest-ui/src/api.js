const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const fetchLocations = async () => {
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
    const locations = await response.json();

    // Assuming the API returns { locations: [{ lat: ..., lng: ... }] }
    console.info(locations)
    return locations;  // Returning the locations array
  } catch (error) {
    console.error("Error fetching locations: ", error);
    return [];
  }
};

export const fetchLocation =  async (id) => {
  try {
    const response = await fetch(`${API_URL}/location/`+id, {
      headers: {
        'accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Use response.json() to parse the JSON body
    const location = await response.json();

    // Assuming the API returns { location: [{ lat: ..., lng: ... }] }
    console.info(location)
    return location;  // Returning the location array
  } catch (error) {
    console.error("Error fetching location: ", error);
    return [];
  }
};
export const fetchSpots = async () => {
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