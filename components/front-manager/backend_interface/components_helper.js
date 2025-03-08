import { createInDB, addReferenceInDB, updateInDB } from '../backend_interface/db_manager_api';

export async function SpotFromForm(data, contextData) {
  // Remove everything that is not part of the spot datamodel
  let extraData = {
    "condition": "location",
    "show": false,
    "date": ""
  };
  console.info("Received data: ", data, contextData);
  extraData.condition = data.condition;
  extraData.show = data.show == "on";
  extraData.date = data?.date || "";
  delete data.condition;
  delete data.show;
  delete data.date;

  // It is a PUT
  if (data?.id) {
    const spotDb = await updateInDB(data, 'spot');
    console.info("Received response put spot: ", spotDb);
    const discoveredDb = await updateInDB(
      {
        "id": contextData.discovered.id,
        "condition": {
          "conformanceComparator": "eq",
          "parameterType": extraData.condition,
          "thresholdTarget": extraData.date
        },
        "show": extraData.show
      }
      , "discovered");
    console.info("Received response put discovered: ", discoveredDb);
    return;
  }
  // Add location to DB
  var locationBody = {
    "name": "location for spot "+ data.name,
    "longitude": contextData.lng,
    "latitude": contextData.lat
  }
  // It is a new one
  const locationDb = await createInDB(locationBody, 'location');
  if (!locationDb) {
    console.info("Unable to create associated location: ", locationDb);
    return;
  }
  const spotDb = await createInDB(data, "spot");
  if (!spotDb) {
    console.info("Unable to create spot: ", spotDb);
    return;
  }
  const locRef = await addReferenceInDB(locationDb.id, spotDb.id, "spot", "location");
  if (!locRef) {
    console.info("Unable to create ref from spot and loc: ", locRef);
    return;
  }
  const discoveredDb = await createInDB(
    {
      "condition": {
        "conformanceComparator": "eq",
        "parameterType": extraData.condition,
        "thresholdTarget": extraData.date
      },
      "show": extraData.show
    }
    , "discovered");
  console.info("Received response create discovered: ", discoveredDb);
  if (!discoveredDb) {
    console.info("Unable to create discovered: ", discoveredDb);
    return;
  }
  const discRef = await addReferenceInDB(discoveredDb.id, spotDb.id, "spot", "discovered");
  if (!discRef) {
    console.info("Unable to create ref from spot and discovered: ", discRef);
    return;
  }
  // console.info("Received response add reference: ", refResponse);  
};
