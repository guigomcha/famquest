import { createInDB, addReferenceInDB, updateInDB } from '../backend_interface/db_manager_api';

export async function SpotFromForm(data, latlng) {
  // It is a PUT
  if (data?.id) {
    const spotDb = await updateInDB(data, 'spot');
    console.info("Received response put: ", spotDb);
    return;
  }
  // Add to DB
  var locationBody = {
    "name": "location for spot "+ data.name,
    "longitude": latlng.lng,
    "latitude": latlng.lat
  }
  // It is a new one
  const locationDb = await createInDB(locationBody, 'location');
  if (locationDb) {
    const spotDb = await createInDB(data, "spot");
    if (spotDb) {
      await addReferenceInDB(locationDb.id, spotDb.id, "spot", "location");
    }
  }    
};

export const findById = (list, id) => list.find(item => item.id === id);