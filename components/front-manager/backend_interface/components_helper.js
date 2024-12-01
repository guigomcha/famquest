import { uploadLocation, uploadSpot, addReferenceToLocation } from '../backend_interface/db_manager_api';

export async function CreateSpotFromForm(data, latlng) {
  // Add to DB
  var locationBody = {
    "name": "location for spot "+ data.name,
    "longitude": latlng.lng,
    "latitude": latlng.lat
  }
  const locationDb = await uploadLocation(locationBody);
  if (locationDb) {
    const spotDb = await uploadSpot(data);
    if (spotDb) {
      await addReferenceToLocation(locationDb.id, spotDb.id, "spot");    
      window.location.reload();
    }
  }    
};