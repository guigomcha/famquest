import { uploadLocation, uploadSpot, addReferenceToLocation, updateSpot } from '../backend_interface/db_manager_api';

export async function SpotFromForm(data, latlng) {
  // It is a PUT
  if (data?.id) {
    const spotDb = await updateSpot(data);
    console.info("Received response put: ", spotDb);
    // window.location.reload();
    return;
  }
  // Add to DB
  var locationBody = {
    "name": "location for spot "+ data.name,
    "longitude": latlng.lng,
    "latitude": latlng.lat
  }
  // It is a new one
  const locationDb = await uploadLocation(locationBody);
  if (locationDb) {
    const spotDb = await uploadSpot(data);
    if (spotDb) {
      await addReferenceToLocation(locationDb.id, spotDb.id, "spot");    
      // window.location.reload();
    }
  }    
};