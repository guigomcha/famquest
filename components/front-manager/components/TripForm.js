import React, { useState } from 'react';
import {
  Form,
  Select,
  Button,
  List,
  Typography,
  Row,
  Col,
  Tooltip,
  Popconfirm,
  Empty,
} from 'antd';

import '../css/classes.css';
import { GlobalMessage } from '../functions/components_helper';
import { createInDB } from '../functions/db_manager_api';
import * as L from 'leaflet';

const { Option } = Select;

// Reverse API
//curl "https://nominatim.openstreetmap.org/reverse?lat=39.48497350584166&lon=-0.36549389362335205&zoom=10&format=json"

// https://project-osrm.org/ -> https://project-osrm.org/docs/v5.24.0/api/
//  curl 'https://router.project-osrm.org/route/v1/driving/-0.36549389362335205,39.48497350584166;-3.6841,40.4245?geometries=geojson'
const example = {"code":"Ok","routes":
  [
    {"geometry":
        {"coordinates":[[-0.365509,39.484834],[-0.418377,39.469281],[-0.457907,39.481744],[-0.694923,39.470861],[-0.805724,39.429041],[-0.874826,39.460494],[-0.934681,39.451108],[-1.05204,39.479481],[-1.217131,39.56274],[-1.41199,39.525668],[-1.504931,39.550406],[-1.655797,39.508329],[-1.898323,39.534953],[-2.077872,39.470689],[-2.129749,39.493262],[-2.176093,39.484875],[-2.249672,39.528491],[-2.292223,39.61743],[-2.39113,39.684696],[-2.427821,39.789068],[-2.527624,39.85854],[-2.690003,39.88893],[-2.734655,39.911895],[-2.807078,39.915376],[-2.922776,39.957523],[-2.972305,39.993979],[-3.019368,39.998303],[-3.152147,40.12094],[-3.289601,40.169643],[-3.356994,40.259336],[-3.448515,40.272945],[-3.554634,40.35706],[-3.68418,40.424504]],
          "type":"LineString"},"legs":[{"steps":[],"summary":"","weight":14209.5,"duration":14209.5,"distance":356937.8}],"weight_name":"routability","weight":14209.5,"duration":14209.5,"distance":356937.8}],"waypoints":[{"hint":"some","distance":15.596932204,"name":"street","location":[-0.365509,39.484834]},{"hint":"some","distance":6.803481902,"name":"street","location":[-3.68418,40.424504]

    }
  ]
}

const TripsForm = ({locations, mapRef}) => {
  const [form] = Form.useForm();
  const [tripList, setTripList] = useState([]);
  const [tripStep, setTripStep] = useState({"start": 0 , "end": 0, "layer": null, "mode": "car", geometry: {}});

  const resetNewTrip = () => {
    form.resetFields();
  };

  const addTripToEnd = (values) => {
    console.info("adding trip list ", values, tripStep, tripList)
    if (!tripStep.layer){
      GlobalMessage('Not adding step because there is no layer', "error");
      return;
    }
    setTripList([...tripList, {...values, layer: tripStep.layer, geometry: tripStep.geometry}]);
    setTripStep(prev => ({...prev, start: 0, end: 0, layer: null, geometry: {}}))
    resetNewTrip();
    GlobalMessage('Trip added', "info");
  };

  const deleteTrip = (index) => {
    mapRef.removeLayer(tripList[index].layer)
    setTripList(tripList.filter((_, i) => i !== index));
  };

  const handleTripClick = (trip, index) => {
    GlobalMessage(`Trip #${index + 1} clicked: Start ${trip.refIdStart}, End ${trip.refIdEnd}`, "info");
  };

  function centerMapForLoc(latlng) {
    const size = mapRef.getSize(); // size in pixels
    const originalPoint = mapRef.latLngToContainerPoint(latlng);
    // Move the point downward by 25% of the map height
    const shiftedPoint = L.point(originalPoint.x, originalPoint.y + size.y * 0.25);  
    const newLatLng = mapRef.containerPointToLatLng(shiftedPoint);
    mapRef.panTo(newLatLng, { animate: true });
  }
  
  function centerMapForTrip(geojsonLayer) {
    const bounds = geojsonLayer.getBounds();
    if (!bounds.isValid()) return;
  
    const size = mapRef.getSize();
  
    // Convert bounds corners to container points
    const ne = mapRef.latLngToContainerPoint(bounds.getNorthEast());
    const sw = mapRef.latLngToContainerPoint(bounds.getSouthWest());
  
    // Shift both points downward by 25% of the map height (so the center ends up higher)
    // TODO: Improve this
    const offset = 0 // size.y * 0.25;
    const newNe = L.point(ne.x, ne.y + offset);
    const newSw = L.point(sw.x, sw.y + offset);
  
    // Convert back to lat/lng
    const newBounds = L.latLngBounds(
      mapRef.containerPointToLatLng(newSw),
      mapRef.containerPointToLatLng(newNe)
    );
  
    mapRef.fitBounds(newBounds, { animate: true });
  }
  

  const handleIdSelect = (value, field) => {
    let startLoc = 0
    let endLoc = 0
    let geoLoc = null 
    console.info("handle select with ", tripStep, {[field]: value})
    if (tripStep.end != 0 && tripStep.start != 0 && tripStep.layer) {
      console.info("deleting layer not yet submitted", tripStep)
      mapRef.removeLayer(tripStep.layer)
    }

    if (field == "start") {
      startLoc = locations.filter((loc) => loc.refId == value)[0]
      centerMapForLoc(L.latLng(startLoc.latitude, startLoc.longitude))
      if (tripStep.end != 0) {
        endLoc = locations.filter((loc) => loc.refId == tripStep.end)[0]
      } else {
        startLoc = 0
      }
      console.info("found ", startLoc, endLoc)
    } else if (field == "end") {
      endLoc = locations.filter((loc) => loc.refId == value)[0]
      centerMapForLoc(L.latLng(endLoc.latitude, endLoc.longitude))
      if (tripStep.start != 0) {
        startLoc = locations.filter((loc) => loc.refId == tripStep.start)[0]
      } else {
        endLoc = 0
      }
      console.info("found ", startLoc, endLoc)
    }
    if (startLoc != 0) {
      console.info("about to request layer for ", startLoc, endLoc)
      let mode = tripStep.mode == "car" ? "driving" : "walking"
      endpoint = `https://router.project-osrm.org/route/v1/${mode}/${startLoc.longitude},${startLoc.latitude};${endLoc.longitude},${endLoc.latitude}?geometries=geojson`
      fetch(endpoint)
        .then((res) => res.json())
        .then((data) => {
          console.info("received layer ", data)
          geoLoc = L.geoJSON(data.routes[0].geometry, {
            style: {
              color: 'blue',
              weight: 5
            }
          });
          geoLoc.addTo(mapRef)
          console.info("created layer ", geoLoc)
          centerMapForTrip(geoLoc)
          console.info("adding ", geoLoc, {[field]: value, layer: geoLoc, geometry: data.routes[0].geometry})
          setTripStep(prev => ({...prev, [field]: value, layer: geoLoc, geometry: data.routes[0].geometry}))
        }
      )
      .catch((err) => {
        GlobalMessage('Failed to load reference IDs', "error")
        console.info("error ", err)
      });
    } else {
      console.info("adding ", {[field]: value})
      setTripStep(prev => ({...prev, [field]: value}))
    }
  };

  const uploadAllTrips = async () => {
    try {
      const responses = await Promise.all(
        tripList.map((trip) => {
          console.info("uploading trip");
          mapRef.removeLayer(trip.layer)
          delete trip.layer
          return createInDB(
            { ...trip, refTypeStart: "spot", refTypeEnd: "spot" },
            "trip"
          );
        })
      );
      console.info("All trips uploaded", responses);
    } catch (err) {
      console.error("Error uploading trips:", err);
    }
    setTripList([])
    setTripStep({"start": 0 , "end": 0, "layer": null, "mode": "car", "geometry": {}})
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Create Trip</Typography.Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          <Form form={form} layout="vertical" onFinish={addTripToEnd}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item name="mode" label="Mode" initialValue="car" onSelect={(val) => setTripStep(prev => ({...prev, mode: val}))}>
                  <Select>
                    <Option value="car">car</Option>
                    <Option value="foot">foot</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="refIdStart"
                  label="Ref ID Start"
                  rules={[
                    { required: true, message: 'Please select a start ID' },
                    {
                      validator: (_, value) =>
                        value === 0
                          ? Promise.reject('ID 0 is not allowed')
                          : Promise.resolve(),
                    },
                  ]}
                >
                  <Select
                    placeholder="Select Start ID"
                    onSelect={(val) => handleIdSelect(val, 'start')}
                  >
                    {locations.map((loc) => (
                      (loc.refType == "spot") &&
                      (<Option key={loc.refId} value={loc.refId}>
                        {loc.refId}
                      </Option>)
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="refIdEnd"
                  label="Ref ID End"
                  rules={[
                    { required: true, message: 'Please select an end ID' },
                    {
                      validator: (_, value) =>
                        value === 0
                          ? Promise.reject('ID 0 is not allowed')
                          : Promise.resolve(),
                    },
                  ]}
                >
                  <Select
                    placeholder="Select End ID"
                    onSelect={(val) => handleIdSelect(val, 'end')}
                  >
                    {locations.map((loc) => (
                      (loc.refType == "spot") &&
                      (<Option key={loc.refId} value={loc.refId}>
                        {loc.refId}
                      </Option>)
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Add Trip Step
                  </Button>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Tooltip
                  title={tripList.length === 0 ? 'Add at least one trip step' : ''}
                >
                  <Button
                    type="primary"
                    danger
                    block
                    onClick={uploadAllTrips}
                    disabled={tripList.length === 0}
                  >
                    Submit Full Trip
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          </Form>
        </Col>

        <Col xs={24} md={10}>
          <Typography.Title level={4}>Trip Steps</Typography.Title>
          <List
            bordered
            dataSource={tripList}
            locale={{
              emptyText: <Empty description="No trip steps yet" />,
            }}
            renderItem={(trip, index) => (
              <List.Item
                onClick={() => handleTripClick(trip, index)}
                className="hoverable-list-item"
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  padding: '12px 16px',
                }}
                actions={[
                  <Popconfirm
                    key="delete"
                    title="Delete this step?"
                    onConfirm={() => deleteTrip(index)}
                  >
                    <Button danger size="small">Delete</Button>
                  </Popconfirm>,
                ]}
              >
                <span>
                  <strong>Start:</strong> {trip.refIdStart} &nbsp;|&nbsp;
                  <strong>End:</strong> {trip.refIdEnd}
                </span>
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </div>
  );
}

export default TripsForm;