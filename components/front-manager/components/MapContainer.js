import '../node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import '../node_modules/leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import React, { useEffect, useRef, useState } from "react";
import SpotForm from './SpotForm';
import SpotPopup from './SpotPopup';
import { GlobalMessage, SpotFromForm } from '../functions/components_helper';
import { worldPolygon, uncoverFog, locationVisible } from '../functions/fog_functions';
import { getInDB, fetchAndPrepareSpots } from "../functions/db_manager_api";
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
  const featureGroup = useRef(null);
  const markers = useRef(null);
  const fogLayer = useRef(null);
  const fogGeoJson = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const allDiscovered = useRef(null);
  const allLocations = useRef(null);
  const [reload, setReload] = useState(true);
  const userRef = useRef();
  const [configuration, setConfiguration] = useState({"mode": "adventure"});

  
  const fetchData = async () => {
    setIsLoading(true);
    const tempLocations = await getInDB('location');
    console.info("Fetched initial locations ", tempLocations);
    // setLocations(tempLocations);
    allLocations.current = tempLocations;
    const tempDiscovered = await getInDB('discovered');
    console.info("Fetched initial discovered ", tempDiscovered);
    // setDiscovered(tempDiscovered);
    allDiscovered.current = tempDiscovered;
    prepareMap();
    setIsLoading(false);
  };

  const prepareMap = () => {
    console.info("prepare with user ", userRef.current, mapRef.current.hasLayer(featureGroup.current));
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
      console.info("opening a spot from map ", e);
      handleMenuChange(<SpotPopup location={e.target.data} handledFinished={sendBackComponent} user={userRef.current}/>);
    } else {
      console.info("opening a new form from map ", e);
      handleMenuChange(<SpotForm initialData={e.target.data} handledFinished={sendBackComponent}/>);
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
  /*
  useEffect(() => {
    if (!mapRef.current || !fogLayer.current || !featureGroup.current){
      return;
    }
    console.info("configuration re-render ", configuration, mapRef.current.hasLayer(featureGroup.current))
    if (configuration.mode == "adventure" && !mapRef.current.hasLayer(featureGroup.current) ) {
      featureGroup.current.addLayer(fogLayer.current);
      mapRef.current.addLayer(featureGroup.current)
      console.info("should have added the mask")
    } else if (configuration.mode == "visualization" && mapRef.current.hasLayer(featureGroup.current)) {
      featureGroup.current.removeLayer(fogLayer.current);
      mapRef.current.removeLayer(featureGroup.current)
      console.info("should have deleted the mask")
    }
    prepareMap();
  }, [configuration])
  */
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
      
      // Add layer group to host the spots from 1 user
      guilleSpotsGroup.current = L.layerGroup().addTo(mapRef.current);
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
        // Add feature group to enable/disable the discovery map
        featureGroup.current = L.featureGroup().addTo(mapRef.current);
        featureGroup.current.addLayer(fogLayer.current);
        featureGroup.current.on('remove', async (e) => {
          console.info("before remove ", featureGroup.current,fogLayer.current)
          console.info("after remove ", featureGroup.current,fogLayer.current)
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
        
      }
      // Right click to create a new spot
      mapRef.current.on('contextmenu', (e) => {
        // check if the location is within the fog or not
        console.info("Right click detected: "+ JSON.stringify(e.latlng)+ "from ", e);
        console.info("Layers has: ", mapRef.current.hasLayer(featureGroup.current));

        if (!isVisibleWithFog({"longitude": e.latlng.lng, "latitude": e.latlng.lat})){
          return;
        }
        data = {
          "target": {
            "data": {"lat": e.latlng.lat, "lng": e.latlng.lng,  "componentType": "SpotForm"}
          }
        }
        sendBackComponent(data);
      }); 
      
      // Create overlay controls
      const overlays = {
        "Spots": guilleSpotsGroup.current,
        "mask": featureGroup.current,
      };
      L.control.layers(null, overlays, { collapsed: false }).addTo(mapRef.current);
      featureGroup.current.remove();
      markers.current = []
      console.log("created the map:", isLoading);
    }
    if (mapRef.current && userRef.current){
      fetchData();
    }
  
  }, [reload, user]);


  return (
    <div style={{ position: "relative", width: "100%", height: "100%"}}>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
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
