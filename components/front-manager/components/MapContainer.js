import '../node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import '../node_modules/leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';
import '../css/leaflet-custom.css';
import * as L from 'leaflet';
import { CanvasLayer } from "./CanvasLeaflet"
import React, { useEffect, useRef, useState } from "react";
import SpotForm from './SpotForm';
import SpotPopup from './SpotPopup';
import { CreateSpotFromForm } from '../backend_interface/components_helper';

const scale = 13;

const defaultCenter = {
  lat: 37.31942002016036,
  lng: -6.0678988062297465,
};

const iconStyle = {
  iconUrl: 'assets/marker-icon.png'
};


const MapContainer = ( {locations, spots, handleMenuChange } ) => {
  const canvasRef = useRef(null);
  const mapRef = useRef(null);
  const guilleSpotsGroup   = useRef(null);
  const featureGroup = useRef(null);
  const locs = useRef(null);

  const prepareMap = () => {
    // After the map is loaded, reveal the area around each marker
    if (mapRef.current && locs.current) {
      locs.current.forEach((location) => {
        console.log("used coordinate: "+ location.id)
        canvasRef.current.revealArea(
          mapRef.current.latLngToContainerPoint(L.latLng(location.latitude, location.longitude)),
          scale
        )
      });
    }
  };
  const sendBackComponent = (e) => {
    console.info("SENDING BACK", e.target.data);
    if (e.target.data.componentType == "SpotPopup") {
      handleMenuChange(<SpotPopup spot={e.target.data} />);
    } else {
      handleMenuChange(<SpotForm onSubmit={async (data) => CreateSpotFromForm(data, e.target.data)} />);
    }
  };

  // Create and configure the map
  useEffect(() => {
    if (!mapRef.current) {
      console.log("Creating the map")
      mapRef.current = L.map('mapId').setView([defaultCenter.lat, defaultCenter.lng], scale);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'GuiGomcha FamQuest powered by OpenStreetMap',
      }).addTo(mapRef.current);
      // Create layer groups

      // Add layer group to host the spots from 1 user
      guilleSpotsGroup.current = L.layerGroup().addTo(mapRef.current);

      // Add feature group to enable/disable the discovery map
      featureGroup.current = L.featureGroup().addTo(mapRef.current);
      
      // Create a canvas overlay for the feature group
      canvasRef.current = new CanvasLayer();
      featureGroup.current.addLayer(canvasRef.current);

      // Events associated to the canvas
      const handleEvent = () => {
        if (canvasRef.current) {
          canvasRef.current.redraw(mapRef.current); // Pass current map
          prepareMap()
        }
      };
      // Add map event listeners
      const events = ['zoom', 'zoomend', 'move', 'moveend', 'drag', 'dragend', 'resize'];
      events.forEach(event => {
        mapRef.current.addEventListener(event, handleEvent);
      });


      // Right click to create a new spot
      mapRef.current.on('contextmenu', (e) => {
        console.info("should send event location : "+ JSON.stringify(e.latlng)+ "from ", e)
        data = {
          "target": {
            "data": {"lat": e.latlng.lat, "lng": e.latlng.lng,  "componentType": "SpotForm"}
          }
        }
        sendBackComponent(data);
      }); 
      
      // Get user location
      mapRef.current.locate({setView: false, watch: true})
            // Probably better to try to save the location if it does not exist something close and the get the markers
            .on('locationfound', function(e){
                var marker = L.marker([e.latitude, e.longitude], {
                  icon: L.icon(iconStyle),
                }).bindPopup('Your are here :)'); 
                var circle = L.circle([e.latitude, e.longitude], Math.min(e.accuracy/2, 100), {
                    weight: 1,
                    color: 'blue',
                    fillColor: '#cacaca',
                    fillOpacity: 0.2
                });
                mapRef.current.addLayer(marker);
                mapRef.current.addLayer(circle);
            })
           .on('locationerror', function(e){
                console.log(e);
                alert("Location access denied.");
            });

      // Create overlay controls
      const overlays = {
        "Spots Guille": guilleSpotsGroup.current,
        "Mask map": featureGroup.current
      };
      L.control.layers(null, overlays, { collapsed: false }).addTo(mapRef.current);
      mapRef.current.removeLayer(featureGroup.current);
    }
  
    return () => {
    };
  }, []);

  // Add the reveal locations
  useEffect(() => {
    locs.current = locations;
    prepareMap();
  }, [locations]);
  
  // Add the markers in the spots
  useEffect(() => {
    if (mapRef.current && spots) {
      spots.forEach((spot) => {
        console.log("used spot: "+ spot.id)
        // Todo: Decide the owner based on something
        // Adding a marker with custom icon
        const marker = L.marker([spot.location.latitude, spot.location.longitude], {
          icon: L.icon(iconStyle),
        })
          .addTo(mapRef.current);
        guilleSpotsGroup.current.addLayer(marker);
        marker.data = {...spot, componentType: "SpotPopup"}
        marker.addEventListener("click", sendBackComponent);

      });
    }
      
  }, [spots]);


  return (
    <div style={{ position: "relative", width: "100%", height: "100%"}}>
      <div id="mapId" style={{ height: '100vh', width: '100vw' }}></div>;
    </div>
  );
};
  
export default MapContainer;
