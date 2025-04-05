const API_URL = "https://api.REPLACE_TARGET_USER.famquest.REPLACE_BASE_DOMAIN";
const isLocal = true;

export const registerUser = async (data) => {
  console.info("URL: "+ API_URL + "user connected " + JSON.stringify(data));
  console.log("Registering new user");
  // Register
  var role = "contributor"
  for (let r of ["contributor", "owner", "hybrid", "admin", "target"]) {
    if (data.groups.some(group => group.includes(r))) {
      role = r;
    }
  }
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: 'POST',
      body: JSON.stringify({
        "extRef": data.user,
        "name": data.preferredUsername,
        "email": data.email,
        "role": role
      }
      ),
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (response.ok) {
      const finalUser = await response.json();
      return finalUser; // return the URL or data if needed
    } else {
      console.error('Failed to upload the user:', response.text());
      return null;
    }
  } catch (error) {
    console.error('Error uploading user:', error);
    return null;
  }
  
};

export const getUserInfo = async (refId) => {
  console.info("URL: "+ API_URL + " user requested " + refId);
  let prefix = ""; 
  if (refId > 0 ) {
    prefix = "/"+ refId;
  }
  try {
    // console.info("users with prefix ", prefix);
    const response = await fetch(`${API_URL}/user`+prefix, {
      headers: {
        'accept': 'application/json',
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const user = await response.json();
    // console.info("Fetched user "+ JSON.stringify(user))
    return user;
  } catch (error) {
    console.error("Error fetching user: ", error);
    return {};
  }
};

export const getConfigure = async () => {
  console.info("URL: "+ API_URL);
  try {
    const response = await fetch(`${API_URL}/configure`, {
      headers: {
        'accept': 'application/json',
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const resp = await response.json();
    console.info("configure response: ", resp);
    return;  // Returning the resp array
  } catch (error) {
    console.error(`Error requesting configure: `, error);
    return;
  }
};
export const getInDB = async (endpoint, refId=0) => {
  let url = `${API_URL}/${endpoint}`
  if (refId > 0) {
    url = url + `/${refId}`
  }
  console.info("URL: "+ url);
  try {
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const resp = await response.json();

    return resp;  // Returning the resp array or single item
  } catch (error) {
    console.error(`Error fetching ${endpoint}: `, error);
    return [];
  }
};

export const deleteInDB = async (refId, endpoint) => {
  console.info("URL: "+ API_URL);
  try {
    const response = await fetch(`${API_URL}/${endpoint}/${refId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const resp = await response.text();

    return "OK";  // Returning the notes array
  } catch (error) {
    console.error(`Error deleting ${endpoint}: `, error);
    return "";
  }
};

export const fetchAndPrepareSpots = async (refId) => {
  try {
    // Fetch spots data
    const spotsData = await getInDB('spot', refId);
    console.info("fetching spot: ", refId, spotsData);
    let discovered = await getInDBWithFilter(spotsData.id, "spot", "discovered");
    // console.info("Discovered: "+JSON.stringify(discovered));
    if (discovered.length > 0) {
      // more than one??
      spotsData.discovered = discovered[0];
    } else {
      console.error("All spots should have a discovered entry");
      spotsData.discovered = {
        "show": true,
        "condition": {
          "conformanceComparator": "eq",
          "parameterType": "location",
          "thresholdTarget": ""
        }
      }
    }

    // Set the fully fetched completed spot data
    return spotsData;
  } catch (err) {
    console.error("Error fetching completed spot:", err);
    return {};
  }
};

export const addLocationToSpot = async (spot) => {
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

export const updateDiscoveredConditionsForUser = async (userInfo) => {
  const response = await fetch(`${API_URL}/discovered/updateConditions?refId=${userInfo.id}&refType=user`, {
    method: "POST",
    headers: {
      'accept': 'application/json',
    },
    ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
    // mode: 'cors',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const resp = await response.json();
  console.info("updated discovered: ", resp)
  return resp; 
};

export const createInDB = async (body, endpoint, extra={"headers": {
      'accept': 'application/json',
      'Content-Type': 'application/json'
    }}) => {

  try {
    const response = await fetch(`${API_URL}/`+endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...extra,
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      return data; // return the URL or data if needed
    } else {
      console.error(`Failed to post the ${endpoint}:`, await response.text());
      return null;
    }
  } catch (error) {
    console.error(`Error posting ${endpoint}:`, error);
    return null;
  }
};

export const updateInDB = async (body, endpoint) => {

  const updateObject = { ...body };
  delete updateObject.id;
  console.info(`puting ${endpoint} with ${updateObject}`, updateObject);
  try {
    const response = await fetch(`${API_URL}/${endpoint}/${body.id}`, {
      method: 'PUT',
      body: JSON.stringify(updateObject),
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
      console.error(`Failed to update the ${endpoint}:`, await response.text());
      return null;
    }
  } catch (error) {
    console.error(`Error updating ${endpoint}:`, error);
    return null;
  }
};

export const uploadAttachment = async (data, formData) => {
  console.info("Uploading attachment");
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

export const addReferenceInDB = async (targetId, refId, refType, endpoint) => {
  console.info(`Trying to add ${refType} and id ${refId} reference to ${endpoint}`);
  try {
    const response = await fetch(`${API_URL}/${endpoint}/${targetId}/ref?refId=${refId}&refType=${refType}`, {
      method: 'PUT',
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (!response.ok) {
      console.info("response not ok: ", await response.text());
      throw new Error(`Failed to add ${refType} and id ${refId} reference to ${endpoint}`);
    }
  } catch (error) {
    console.error(`Error to add ${refType} and id ${refId} reference to ${endpoint}`, error);
    return;
  }
  return "OK";
};

export const getInDBWithFilter = async (refId, refType, endpoint) => {
  try {
    var filter = "";
    if (refId > 0) {
      filter = `?refId=${refId}&refType=${refType}`
    }
    const response = await fetch(`${API_URL}/${endpoint}${filter}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      },
      ...(isLocal ? {} : { credentials: 'include' }), // Ensures cookies (including OAuth2 session cookie) are sent along with the request
      // mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      //console.info(`Received ${endpoint}: `+ JSON.stringify(data))
      return data; // return attachment data if needed
    } else {
      throw new Error(`Failed to fetch ${endpoint}`);
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
};
