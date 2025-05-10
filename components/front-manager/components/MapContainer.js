import '../node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import '../node_modules/leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import React, { useEffect, useRef, useState } from "react";
import SpotForm from './SpotForm';
import SpotPopup from './SpotPopup';
import TripsForm from './TripForm';
import { Modal, Radio, message } from 'antd';
import { GlobalMessage, SpotFromForm } from '../functions/components_helper';
import { worldPolygon, uncoverFog, locationVisible } from '../functions/fog_functions';
import { getInDB, updateDiscoveredConditionsForUser } from "../functions/db_manager_api";
import { useTranslation } from "react-i18next";
import Row from 'react-bootstrap/Row';
import { Select, Space, Spin } from 'antd';

const scale = 13;

const defaultCenter = {
  lat: 37.31942002016036,
  lng: -6.0678988062297465,
};

const iconStyle = {
  iconUrl: 'assets/marker-icon.png',
  iconSize: [24, 36],
  iconAnchor: [12, 36],
};

const MapContainer = ( { handleMenuChange, handleMapRef, user } ) => {
  const { t, i18n } = useTranslation();
  const mapRef = useRef(null);
  const guilleSpotsGroup = useRef(null);
  const tripsGroup = useRef(null);
  const featureGroup = useRef(null);
  const markers = useRef([]);
  const fogLayer = useRef(null);
  const fogGeoJson = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const allDiscovered = useRef(null);
  const allLocations = useRef(null);
  const allTrips = useRef(null);
  const geoLines = useRef([]);
  const [reload, setReload] = useState(true);
  const userRef = useRef();
  const [configuration, setConfiguration] = useState({"mode": "adventure"});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [componentType, setComponentType] = useState('SpotForm'); 
  const [clickPosition, setClickPosition] = useState(null);
  
  const fetchData = async () => {
    setIsLoading(true);
    const tempLocations = await getInDB('location');
    console.info("Fetched initial locations ", tempLocations);
    allLocations.current = tempLocations;

    const tempTrips = await getInDB('trip');
    console.info("Fetched initial trips ", tempTrips);
    allTrips.current = tempTrips;

    // Gets and creates missing ones
    let tempDiscovered = await getInDB('discovered', 0, `?refUserUploader=${user.id}`);
    console.info("Discovered for user: ", tempDiscovered);
    const resp = await updateDiscoveredConditionsForUser(user);
    console.info("requested discover update: ", resp);
    if (resp.length >0) {
      GlobalMessage(resp.length + "x" +t('discoveredUpdate')+": "+resp, "info");
      tempDiscovered = await getInDB('discovered', 0, `?refUserUploader=${user.id}`);
      console.info("Re-requested discovered for user: ", tempDiscovered);
    }
    allDiscovered.current = tempDiscovered;
    
    prepareMap();
    setIsLoading(false);
  };

  const prepareMap = () => {
    console.info("prepare with user ", userRef.current, mapRef.current.hasLayer(featureGroup.current));
    // Add the trips
    if (mapRef.current && allTrips.current && tripsGroup.current) {
      // Adding a marker with custom icon
      let geoLineExists = false;
      allTrips.current.forEach((trip) => {
        geoLines.current.forEach((geoLine) => {
          if (geoLine.tripId == trip.id){
            console.info("trip already has geoLine ", trip);
            geoLineExists = true;
          }
        })
        if (geoLineExists){
          return;
        }
        console.info("adding geoLine for trip", trip)
        const geoLine = L.geoJSON(trip.geometry, {
            style: {
              color: 'blue',
              weight: 5
            }
        });
        geoLine.addTo(mapRef.current)
        geoLine.data = {...trip}
        tripsGroup.current.addLayer(geoLine);
        geoLines.current.push({"tripId": trip.id, "geoLine": geoLine});
      })
    }
    
    // After the map is loaded, reveal the area around each marker
    if (mapRef.current && allLocations.current && fogLayer.current && userRef.current) {
      // First uncover fog and add markers 
      allLocations.current.forEach((location, index) => {
        if (location.refType == "user" && location.refId == userRef.current.id){
          //Uncover new area in fog
          fogGeoJson.current = uncoverFog(location, fogGeoJson.current);
          fogLayer.current = L.geoJSON([fogGeoJson.current], {
            style(feature) {
              return feature.properties && feature.properties.style;
            },
          });
          //console.info("uncover fog for user and location", location, userRef.current, fogGeoJson.current)

        } else if (location.refType == "spot") {
          // Adding a marker with custom icon
          let markerExists = false;
          markers.current.forEach((mark) => {
            if (mark.spotId == location.refId){
              console.info("spot already has marker ", location);
              markerExists = true;
            }
          })
          if (markerExists){
            return;
          }
          console.info("adding marker for location", location)
          const marker = L.marker([location.latitude, location.longitude], {
            icon: L.icon(iconStyle),
          }).addTo(mapRef.current);
          marker.data = {...location, componentType: "SpotPopup"}
          marker.addEventListener("click", sendBackComponent);
          guilleSpotsGroup.current.addLayer(marker);
          markers.current.push({"spotId": location.refId, "marker": marker});
        } else if (location.refId == 0 ) {
          console.info("location invalid or deprecated ", location)
        }
      });
      // Second iteration to decide if spot markers are visible
      if (mapRef.current.hasLayer(featureGroup.current)) {
        allLocations.current.forEach((location, index) => {
          console.info("Checking it should display spot: ", location.refId);
          if (location.refId != 0 && location.refType == "spot") {
            let visible = true;
            let markerRef = null;
            markers.current.forEach((mark) => {
              if (mark.spotId == location.refId){
                markerRef = mark.marker;
              }
            })
            // Visibility based on Fog
            // console.info("markerfound for location", location, markerRef)
            if (!isVisibleWithFog(location, rightClick=false)){
              console.info("markerfound not visible", markerRef)
              visible = false;
            }
            // The show condition is for adventure mode
            if (visible){
              let discovered = allDiscovered.current.filter(item => item.refId == location.refId && item.refType == "spot")
              console.info("it was visible but discovered for marker", discovered)
              visible = discovered[0].show;
            }
            // Visibility based on spot condition which is handled in the backend
            if (!visible){
              console.info("deleting marker ", location)
              if (markerRef) {
                guilleSpotsGroup.current.removeLayer(markerRef);
                markers.current = markers.current.filter(item => item.spotId != location.refId);
              } else {
                console.info("all spots should have marker at this point... ", location)
              }
            }
          }
        }); 
      }
    }
  };
  
  const sendBackComponent = (e) => {
    if (e == "done") {
      // An spot has been updated
      handleMenuChange(null);
      fetchData();
      setReload(!reload);
    } else if (e?.id) {
      // An spot has been deleted
      console.info("an spot was deleted");
      markers.current.forEach((mark) => {
        console.info("should delete? ", mark.spotId, e.id);
        if (mark.spotId == e.id){
          guilleSpotsGroup.current.removeLayer(mark.marker);
          markers.current = markers.current.filter(item => item.spotId != e.id);
        }
      });
      fetchData();
      handleMenuChange(null);
      setReload(!reload);
    } else if (e?.target.data.componentType == "SpotPopup") {
      handleMenuChange(<SpotPopup location={e.target.data} handledFinished={sendBackComponent} user={userRef.current}/>);
    } else if (e?.target.data.componentType == "SpotForm") {
      handleMenuChange(<SpotForm initialData={e.target.data} handledFinished={sendBackComponent}/>);
    } else if (e?.target.data.componentType == "TripForm") {
      handleMenuChange(<TripsForm locations={allLocations.current} mapRef={mapRef.current}/>);
      }
  };

  const isVisibleWithFog = (location, rightClick=true) => {
    if (!mapRef.current.hasLayer(featureGroup.current)){
      // console.info("mask disabled: "+ JSON.stringify(location));
    } else if (!locationVisible(location, fogGeoJson.current)){
      if (rightClick) {
        console.info("can only right click and see outside of fog");
        GlobalMessage(t("actionInvalid"), "warning");
      }
      return false;
    }
    return true;
  }

  const handleChangeMode = (e) => {
    console.info("modechange ", e)
    setConfiguration({...configuration, mode: e})
  }
  
  useEffect(() => {
    if (!mapRef.current || !fogLayer.current || !featureGroup.current){
      return;
    }
    console.info("configuration re-render ", configuration, mapRef.current.hasLayer(featureGroup.current))
    if (configuration.mode == "adventure" && !mapRef.current.hasLayer(featureGroup.current) ) {
      featureGroup.current.addTo(mapRef.current);
      console.info("should have added the mask and triggered event")
    } else if (configuration.mode == "visualization" && mapRef.current.hasLayer(featureGroup.current)) {
      featureGroup.current.remove();
      console.info("should have deleted the mask and triggered event")
    }
  }, [configuration])
  
  // Create and configure the map
  useEffect(() => {
    if (user?.id) {
      userRef.current = user;
      console.info("added user to mapcontainer ", user);
    } else {
      console.info("rerender mapcontainer with null user ", user)
      return;
    }
    if (!mapRef.current) {
      console.log("Creating the map:", isLoading);
      const mapDiv = document.getElementById("mapId");
      mapRef.current = L.map(mapDiv).setView([defaultCenter.lat, defaultCenter.lng], scale);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'GuiGomcha FamQuest App',
      }).addTo(mapRef.current);
      L.control.scale().addTo(mapRef.current);
      handleMapRef(mapRef);
      // To support map inside of tab
      const resizeObserver = new ResizeObserver(() => {
        mapRef.current.invalidateSize();
      });      
      resizeObserver.observe(mapDiv);
      
      // Add layer groups
      guilleSpotsGroup.current = L.layerGroup().addTo(mapRef.current);
      tripsGroup.current = L.layerGroup().addTo(mapRef.current);
      // Create the fog if it doesn't exist
      if (!fogLayer.current){
        fogGeoJson.current = worldPolygon();
        fogLayer.current = L.geoJSON([fogGeoJson.current], {
          style(feature) {
            return feature.properties && feature.properties.style;
          },
        });
        console.info("initial geojson ", fogGeoJson.current)
        fogLayer.current.bringToFront();
        featureGroup.current = L.featureGroup();
        featureGroup.current.addLayer(fogLayer.current);
        featureGroup.current.on('remove', async (e) => {
          // Re-add markers (old, and then refresh)
          prepareMap();
          await fetchData();
          console.info("mask removed", e);
        });
        featureGroup.current.on('add', async (e) => {
          // TODO: There should be a trigger to refresh every second or so 
          // Recreate fog and delete markers (refresh to bring the latest locations to the fog)
          prepareMap();
          await fetchData();
          featureGroup.current.clearLayers();
          featureGroup.current.addLayer(fogLayer.current);
          console.info("after add ", featureGroup.current)
          console.info("mask added", e);
        });
        
        // Add feature group to enable aligned with the default in the select
        featureGroup.current.addTo(mapRef.current)
      }
      // Right click to create a new spot
      mapRef.current.on('contextmenu', (e) => {
        // check if the location is within the fog or not
        console.info("Right click detected: "+ JSON.stringify(e.latlng)+ "from ", e);
        console.info("Layers has: ", mapRef.current.hasLayer(featureGroup.current));

        if (!isVisibleWithFog({"longitude": e.latlng.lng, "latitude": e.latlng.lat})){
          return;
        }
        const { latlng } = e;
        setClickPosition(latlng);
        setIsModalVisible(true);

      }); 
      
      // Create overlay controls
      const overlays = {
        "Spots": guilleSpotsGroup.current,
        "Trips": tripsGroup.current,
      };
      L.control.layers(null, overlays, { collapsed: false }).addTo(mapRef.current);
      markers.current = []
      console.log("created the map:", isLoading);
    }
    const interval = setInterval(async () => {
      console.log('Function executed at', new Date().toLocaleTimeString());
      if (mapRef.current && userRef.current && featureGroup.current && fogLayer.current){
        await fetchData();
        featureGroup.current.clearLayers();
        featureGroup.current.addLayer(fogLayer.current);
      }
    }, 10000);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  
  }, [reload, user]);

  const handleOk = () => {
    if (!clickPosition) return;

    sendBackComponent({
      target: {
        data: {
          lat: clickPosition.lat,
          lng: clickPosition.lng,
          componentType: componentType,
        },
      },
    });

    setIsModalVisible(false);
    setClickPosition(null);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%"}}>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Modal
          title="Create Component"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={() => setIsModalVisible(false)}
        >
          <Radio.Group
            onChange={(e) => setComponentType(e.target.value)}
            value={componentType}
          >
            <Radio value="SpotForm">Spot</Radio>
            <Radio value="TripForm">Trip</Radio>
          </Radio.Group>
        </Modal>
        <Row>
          <Select
            prefix={t("mode")}
            defaultValue="adventure"
            style={{ width: 200 }}
            onChange={handleChangeMode}
            options={[
              { value: 'adventure', label: t("adventure") },
              { value: 'visualization', label: t("visualization") },
            ]}
          />
        </Row>
        <Row>
          <div id="mapId" style={{ height: '100vh', width: '100vw' }}>
            {(isLoading) &&<Spin >{t('loading')}</Spin>}
          </div>
        </Row>
      </Space>
    </div>
  );
};
  
export default MapContainer;
