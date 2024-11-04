import '../node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import '../node_modules/leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';
import '../css/leaflet-custom.css';
import * as L from 'leaflet';
import { CanvasLayer } from "./CanvasLeaflet"
import { createRoot } from 'react-dom/client'; // Import createRoot
import React, { useEffect, useRef, useState } from "react";
import SpotForm from './SpotForm';
import SpotPopup from './SpotPopup';

const scale = 13;

const defaultCenter = {
  lat: 37.31942002016036,
  lng: -6.0678988062297465,
};

const iconStyle = {
  iconUrl: 'node_modules/leaflet/dist/images/marker-icon.png'
};


const popUpStyle = {
  'className' : 'leaflet-popup'
};


const MapContainer = ( {locations, spots } ) => {
  const canvasRef = useRef(null);
  const mapRef = useRef(null);
  const locs = useRef(null);

  const prepareMap = () => {
    console.log("locations in prepare: "+ JSON.stringify(locs))
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

  function CreateSpotFromForm(data, latlng) {
    // Create marker which will be later a location + spot
    const marker = L.marker(latlng, {
      icon: L.icon(iconStyle),
    })
      .addTo(mapRef.current);
    // Inject our custom component 
    const popupContainer = document.createElement('div');
    const root = createRoot(popupContainer); 
    root.render(<SpotPopup {...data} />);
    marker.bindPopup(popupContainer, popUpStyle);   
    // Close the popup after submission
    marker.openPopup();
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
      const layerGroup = L.layerGroup().addTo(mapRef.current);

      // Add feature group to enable/disable the discovery map
      const featureGroup = L.featureGroup().addTo(mapRef.current);
      
      // Create a canvas overlay for the feature group
      canvasRef.current = new CanvasLayer();
      featureGroup.addLayer(canvasRef.current);

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
        const formContainer = document.createElement('div');
        const root = createRoot(formContainer); // Create root for new container
        // TODO: change to the creation of the spot + location in our DB and force re-render somehow
        root.render(
          <SpotForm onSubmit={(data) => CreateSpotFromForm(data, e.latlng)} />
        );
        L.popup(popUpStyle)
          .setLatLng(e.latlng)
          .setContent(formContainer)
          .openOn(mapRef.current);
      }); 
      
      // Get user location
      mapRef.current.locate({setView: false, watch: true})
            // Probably better to try to save the location if it does not exist something close and the get the markers
            .on('locationfound', function(e){
                var marker = L.marker([e.latitude, e.longitude], {
                  icon: L.icon(iconStyle),
                }).bindPopup('Your are here :)');
                var circle = L.circle([e.latitude, e.longitude], e.accuracy/2, {
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
        "Spots Guille": layerGroup,
        "Mask map": featureGroup
      };
      L.control.layers(null, overlays, { collapsed: false }).addTo(mapRef.current);
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
        // Adding a marker with custom icon
        L.marker([spot.location.latitude, spot.location.longitude], {
          icon: L.icon(iconStyle),
        })
          .addTo(mapRef.current)
          .bindPopup(spot.name);
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
