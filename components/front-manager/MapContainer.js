import './node_modules/leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import './node_modules/leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import {CanvasLayer} from "./CanvasLeaflet"
import { createRoot } from 'react-dom/client'; // Import createRoot
import React, { useEffect, useRef, useState } from "react";
import SpotForm from './SpotForm';
import SpotPopup from './SpotPopup';

const scale = 13;
const defaultCenter = {
  lat: 37.31942002016036,
  lng: -6.0678988062297465,
};
  
const MapContainer = ( {locations, spots } ) => {
  // const [selectedMarker, setSelectedMarker] = useState(null); // Track selected marker for InfoWindow
  const canvasRef = useRef(null);
  const mapRef = useRef(null);
  const locs = useRef(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [clickLatLng, setClickLatLng] = useState(null);

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


  useEffect(() => {
    if (!mapRef.current) {
      console.log("Creating the map")
      mapRef.current = L.map('mapId').setView([defaultCenter.lat, defaultCenter.lng], scale);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
          // Create layer groups

      // Add layer group with circles
      const layerGroup = L.layerGroup().addTo(mapRef.current);
      // L.circle([defaultCenter.lat+0.05, defaultCenter.lng+0.05], { color: 'blue', fillColor: 'blue', fillOpacity: 0.5, radius: 200 }).addTo(layerGroup);
      // L.circle([defaultCenter.lat+0.08, defaultCenter.lng+0.05], { color: 'red', fillColor: 'red', fillOpacity: 0.5, radius: 100, stroke: false }).addTo(layerGroup);
      // L.circle([defaultCenter.lat+0.06, defaultCenter.lng+0.05], { color: 'green', fillColor: 'green', fillOpacity: 0.5, radius: 100 }).addTo(layerGroup);

      // Add feature group with a popup and shapes
      const featureGroup = L.featureGroup().addTo(mapRef.current);
      // L.popup().setContent('Popup in FeatureGroup').setLatLng([defaultCenter.lat+0.15, defaultCenter.lng+0.05]).openOn(mapRef.current);
      // L.circle([defaultCenter.lat+0.05, defaultCenter.lng+0.01], { color: 'purple', radius: 200 }).addTo(featureGroup);
      // L.rectangle([[defaultCenter.lat+0.15, defaultCenter.lng+0.19],[defaultCenter.lat+0.05, defaultCenter.lng+0.25]], { color: 'purple', weight: 1 }).addTo(featureGroup);
      
      // Create a blue canvas overlay
      canvasRef.current = new CanvasLayer();
      featureGroup.addLayer(canvasRef.current);

      // Events
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
      // Right-click event to show the form
      const handleFormSubmit = (data, latlng, popupContainer) => {
        // Create marker
        const marker = L.marker(latlng, {
          icon: L.icon({
            iconUrl: 'node_modules/leaflet/dist/images/marker-icon.png'
          }),
        })
          .addTo(mapRef.current);
    
        // Use the CustomPopup component
        const popupContent = document.createElement('div');
        const root = createRoot(popupContent); // Create root for popup content
    
        root.render(<SpotPopup {...data} />);
        marker.bindPopup(popupContent);
    
        // Close the popup after submission
        marker.openPopup();
      };
      mapRef.current.on('contextmenu', (e) => {
        const popupContainer = document.createElement('div');
        const root = createRoot(popupContainer); // Create root for new container

        root.render(
          <SpotForm onSubmit={(data) => handleFormSubmit(data, e.latlng, popupContainer)} />
        );
        L.popup()
          .setLatLng(e.latlng)
          .setContent(popupContainer)
          .openOn(mapRef.current);
      });
  
      
      // Create overlay controls
      const overlays = {
        // "Marker with popup": marker,
        "Layer group with circles": layerGroup,
        "Feature group": featureGroup
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
          icon: L.icon({
            iconUrl: 'node_modules/leaflet/dist/images/marker-icon.png'
          }),
        })
          .addTo(mapRef.current)
          .bindPopup(spot.name);
      });
    }
      
  }, [spots]);

  // const handleInputChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const { name, description } = formData;

  //   if (clickLatLng && name) {
  //     console.log("creating marker")
  //     L.marker(clickLatLng, {
  //       icon: L.icon({
  //         iconUrl: 'node_modules/leaflet/dist/images/marker-icon.png'
  //       }),
  //     })
  //       .addTo(mapRef.current)
  //       .bindPopup(<CustomPopup name=${name description=${description} attachments=["https://www.biografiasyvidas.com/biografia/j/fotos/jaime_i_conquistador.jpg"]} />);
  //     setFormData({ name: '', description: '' }); // Reset form
  //     setShowForm(false); // Close the form
  //     setClickLatLng(null); // Clear clicked location
  //   }
  // };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%"}}>
      {/* Canvas for revealing part of the map */}
      {/* <canvas ref={canvasRef} style={{position: "absolute", width: "100%", height: "100%", zIndex: 10000, pointerEvents: "none"}} /> */}
      {/* {showForm && (
        <div style={{ position: 'absolute', top: '10%', left: '10%', background: 'white', padding: '10px', border: '1px solid black', zIndex: 200000 }}>
          <h3>Add Marker</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
              <label>Description:</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} />
            </div>
            <button type="submit">Add Marker</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )} */}
      <div id="mapId" style={{ height: '100vh', width: '100vw' }}></div>;
    </div>
  );
};
  
export default MapContainer;
