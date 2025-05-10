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
  message,
  Empty,
} from 'antd';

import '../css/classes.css';

const { Option } = Select;

export default function TripsFormAntd() {
  const [form] = Form.useForm();
  const [tripList, setTripList] = useState([]);
  const [refIdOptions, setRefIdOptions] = useState([1, 2, 4]);

  const resetNewTrip = () => {
    form.resetFields();
  };

  const addTripToEnd = (values) => {
    setTripList([...tripList, values]);
    resetNewTrip();
    message.success('Trip added');
  };

  const deleteTrip = (index) => {
    setTripList(tripList.filter((_, i) => i !== index));
  };

  const handleTripClick = (trip, index) => {
    message.info(`Trip #${index + 1} clicked: Start ${trip.refIdStart}, End ${trip.refIdEnd}`);
  };

  const handleIdSelect = (value, field) => {
    if (value === 0) {
      message.error(`ID 0 is not allowed for ${field}`);
    } else {
      message.success(`Selected ${field}: ${value}`);
    }
  };

  const submitTrips = () => {
    fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripList),
    })
      .then((res) => {
        if (res.ok) {
          message.success('Trips submitted!');
          setTripList([]);
        } else {
          message.error('Submission failed');
        }
      })
      .catch(() => message.error('Submission error'));
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Create Trip</Typography.Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          <Form form={form} layout="vertical" onFinish={addTripToEnd}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item name="mode" label="Mode" initialValue="car">
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
                    onSelect={(val) => handleIdSelect(val, 'Start ID')}
                  >
                    {refIdOptions.map((id) => (
                      <Option key={id} value={id}>
                        {id}
                      </Option>
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
                    onSelect={(val) => handleIdSelect(val, 'End ID')}
                  >
                    {refIdOptions.map((id) => (
                      <Option key={id} value={id}>
                        {id}
                      </Option>
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
                    onClick={submitTrips}
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
