import { createInDB, addReferenceInDB, updateInDB } from '../backend_interface/db_manager_api';

export async function SpotFromForm(data, latlng) {
  // Remove everything that is not part of the spot datamodel
  let extraData = {
    "condition": "location",
    "show": false
  };
  console.info("Received data: ", data);
  if (data?.condition){
    extraData.condition = data.condition;
    extraData.show = data.show == "on";
    delete data.condition;
    delete data.show;
  }
  // It is a PUT
  if (data?.id) {
    const spotDb = await updateInDB(data, 'spot');
    console.info("Received response put: ", spotDb);
    // TODO: Have to update the discovered as well....
    return;
  }
  // Add location to DB
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
    const discoveredDb = await createInDB(
      {
        "condition": {
          "conformanceComparator": "eq",
          "parameterType": extraData.condition,
          "thresholdTarget": ""
        },
        "show": extraData.show
      }
      , "discovered");
      // console.info("Received response create discovered: ", discoveredDb);
      const refResponse = await addReferenceInDB(discoveredDb.id, spotDb.id, "spot", "discovered");
      // console.info("Received response add reference: ", refResponse);  
  }    
};
