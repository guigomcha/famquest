import * as turf from "@turf/turf";

export function uncoverFog(location, fogPolygon) {
  //Create new circle polygon based on the user's position.
  const circlePolygon = _createCirclePolygonFromLocation(location, 0.05, 16);
  console.info("generated circle: ", circlePolygon);
  //Extend the fog using our new circle polygon.
  const newFogPolygon = _addPolygonToFog(fogPolygon, circlePolygon);

  return newFogPolygon;
}

function  _addPolygonToFog(fogPolygon, newPolygon) {

  //For each hole in the fog-polygon.
  for (let i = 1; i < fogPolygon.geometry?.coordinates[0].length; i++) {

    //An array of coordinates representing a hole in the fog polygon.
    const holeCoordinates = fogPolygon.geometry.coordinates[0][i]
    //Convert the array of coordinates to a polygon object.
    const holePolygon = turf.polygon([holeCoordinates]);
    console.info("intersection with hole:", holePolygon)
    //If the "hole" intersects with the new polygon then join them together. (e.g. user moved to edge of fog)
    if (turf.intersect(holePolygon, newPolygon)) {
      
      const newHolePolygon = turf.union(holePolygon, newPolygon);
      const newHoleCoordinates = newHolePolygon.geometry.coordinates[0];
      console.info("intersection:", newHolePolygon)
      
      //Overwrite the old hole.
      fogPolygon.geometry.coordinates[0][i] = newHoleCoordinates;
      return fogPolygon;
    }
  }
  
  //If none of the "hole" polygons intersect with the new polygon then add a new hole to the fog-polygon.
  const newHoleCoordinates = newPolygon.geometry.coordinates[0];
  console.info("new hole coordinates:", newHoleCoordinates)
  fogPolygon.geometry.coordinates[0].push(newHoleCoordinates);
  console.info("new fogpolygon:", fogPolygon)

  return fogPolygon;

}

export function worldPolygon() {
    return {
      "type": "Feature",
      "properties": {
          "style": {
              "weight": 2,
              "color": "gray",
              "opacity": 1,
              "fillColor": "gray",
              "fillOpacity": 0.8
          }
      },
      "geometry": {
          "type": "MultiPolygon",
          "coordinates": [
              [
                  [
                    [0, 89.9],
                    [179.9, 89.9],
                    [179.9, -89.9],
                    [0, -89.9],
                    [-179.9, -89.9],
                    [-179.9, 0],
                    [-179.9, 89.9],
                    [0, 89.9],
                  ],
              ]
          ]
      }
    };

  }

function  _createCirclePolygonFromLocation(location, size = 100, steps = 12) {
  //Firstly a point polygon is required to create a circle using turf.circle()

  //The point polygon is generated using the user's longitude and latitude.
  const pointPolygon = turf.point([location.longitude, location.latitude]);

  //A circle polygon is created using the point polygon as its center.
  const circlePolygon = turf.circle(pointPolygon, size, { steps: steps , properties:{"party": "Democrat"}});

  return circlePolygon;
}
