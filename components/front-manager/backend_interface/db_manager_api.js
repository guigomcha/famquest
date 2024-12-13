// export const fetchCoordinates = async () => {
//   // Simulate API call
//   return [
//     { lat: 37.321355840986044, lng: -6.056325106677641 }, // Sample coordinates (Blue Padel)
//     { lat: 37.31942002016036, lng: -6.0678988062297465 }, // Sample coordinates (Palomares)
//   ];
// };

const API_URL = "https://api.famquest.REPLACE";
const isLocal = true;

export const fetchCoordinates = async () => {
  console.info("URL: "+ API_URL);
  try {
    const response = await fetch(`${API_URL}/location`, {
      headers: {
        'accept': 'application/json',
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Use response.json() to parse the JSON body
    const coordinates = await response.json();

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
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
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
    method: "GET",
    headers: {
      'accept': 'application/json',
    },
    ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
    // mode: 'cors',
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


export const uploadSpot = async (body) => {

  try {
    const response = await fetch(`${API_URL}/spot`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      return data; // return the URL or data if needed
    } else {
      console.error('Failed to upload the spot:', response.text());
      return null;
    }
  } catch (error) {
    console.error('Error uploading spot:', error);
    return null;
  }
};

export const updateSpot = async (body) => {

  const updateSpotObject = { ...body };
  delete updateSpotObject.id;
  try {
    const response = await fetch(`${API_URL}/spot/${body.id}`, {
      method: 'PUT',
      body: JSON.stringify(updateSpotObject),
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      return data; // return the URL or data if needed
    } else {
      console.error('Failed to update the spot:', response.text());
      return null;
    }
  } catch (error) {
    console.error('Error updating spot:', error);
    return null;
  }
};

export const uploadLocation = async (body) => {

  try {
    console.info("using location data for post: "+ JSON.stringify(body))
    const response = await fetch(`${API_URL}/location`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      return data; // return the URL or data if needed
    } else {
      console.error('Failed to upload the location');
      console.error(response.text());
      return null;
    }
  } catch (error) {
    console.error('Error uploading location:', error);
    return null;
  }
};

export const uploadAttachment = async (data, formData) => {
  console.info("Uploading attahment");
  if (data instanceof Blob) {
    // If it's a Blob (image from the camera or audio fromthe mic), append it with a filename of the right type
    if (name == "audio") {
      formData.append("file", data, "audio.mpeg");
    } else {
      formData.append("file", data, "camera_image.jpg");
    }
  } else {
    // If it's a file selected via the file input
    formData.append("file", data);
  }

  try {
    const response = await fetch(`${API_URL}/attachment`, {
      method: 'POST',
      body: formData,
      headers: {
        'accept': 'application/json',
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      return data; // return the URL or data if needed
    } else {
      console.error('Failed to upload the attachment');
      return null;
    }
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return null;
  }
};

export const updateAttachment = async (body) => {

  const updateAttachmentObject = { ...body };
  delete updateAttachmentObject.id;
  try {
    const response = await fetch(`${API_URL}/attachment/${body.id}`, {
      method: 'PUT',
      body: JSON.stringify(updateAttachmentObject),
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      return data; // return the URL or data if needed
    } else {
      console.error('Failed to update the attachment:', response.text());
      return null;
    }
  } catch (error) {
    console.error('Error updating attachment:', error);
    return null;
  }
};

export const addReferenceToAttachment = async (attachmentId, refId, refType) => {
  try {
    const response = await fetch(`${API_URL}/attachment/${attachmentId}/ref?refId=${refId}&refType=${refType}`, {
      method: 'PUT',
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to add spot reference to attachment');
    }
  } catch (error) {
    console.error('Error adding reference to attachment:', error);
  }
};

export const addReferenceToLocation = async (locationId, refId, refType) => {
  try {
    const response = await fetch(`${API_URL}/location/${locationId}/ref?refId=${refId}&refType=${refType}`, {
      method: 'PUT',
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to add spot reference to location');
    }
  } catch (error) {
    console.error('Error adding reference to spot:', error);
  }
};


export const fetchAttachment = async (attachmentId) => {
  try {
    const response = await fetch(`${API_URL}/attachment/${attachmentId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      console.info("Received attachment: "+ JSON.stringify(data))
      return data; // return attachment data if needed
    } else {
      throw new Error('Failed to fetch attachment');
    }
  } catch (error) {
    console.error('Error fetching attachment:', error);
    return null;
  }
};

export const fetchAttachments = async (refId, refType) => {
  try {
    var filter = "";
    if (refId > 0) {
      filter = `?refId=${refId}&refType=${refType}`
    }
    const response = await fetch(`${API_URL}/attachment${filter}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      console.info("Received attachments: "+ JSON.stringify(data))
      return data; // return attachment data if needed
    } else {
      throw new Error('Failed to fetch attachments');
    }
  } catch (error) {
    console.error('Error fetching attachment:', error);
    return [];
  }
};
