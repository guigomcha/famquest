import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  List,
  Typography,
  Row,
  Col,
  Tooltip,
  Popconfirm,
  message,
  Divider,
} from 'antd';

import '../css/classes.css';

const { TextArea } = Input;
const { Option } = Select;

export default function TripsFormAntd() {
  const [form] = Form.useForm();
  const [tripList, setTripList] = useState([]);
  const [refIdOptions, setRefIdOptions] = useState([1,2,4]);

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
    message.success(`Selected ${field}: ${value}`);
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
      <Row gutter={24}>
        <Col span={14}>
          <Form form={form} layout="vertical" onFinish={addTripToEnd}>
            <Form.Item
              name="geometry"
              label="Geometry (JSON)"
              rules={[{ required: true, message: 'Please enter geometry JSON' }]}
            >
              <TextArea rows={3} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="mode" label="Mode" initialValue="car">
                  <Select>
                    <Option value="car">car</Option>
                    <Option value="foot">foot</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="refTypeStart" label="Ref Type Start" initialValue="spot">
                  <Select>
                    <Option value="spot">spot</Option>
                    <Option value="note">note</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="refTypeEnd" label="Ref Type End" initialValue="spot">
                  <Select>
                    <Option value="spot">spot</Option>
                    <Option value="note">note</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="refIdStart"
                  label="Ref ID Start"
                  rules={[{ required: true, message: 'Please select a start ID' }]}
                >
                  <Select onSelect={(val) => handleIdSelect(val, 'Start ID')}>
                    {refIdOptions.map((id) => (
                      <Option key={id} value={id}>
                        {id}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="refIdEnd"
              label="Ref ID End"
              rules={[{ required: true, message: 'Please select an end ID' }]}
            >
              <Select onSelect={(val) => handleIdSelect(val, 'End ID')}>
                {refIdOptions.map((id) => (
                  <Option key={id} value={id}>
                    {id}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Add Trip Step
              </Button>
            </Form.Item>
          </Form>

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

        <Col span={10}>
          <Typography.Title level={4}>Trip Steps</Typography.Title>
          <List
            bordered
            dataSource={tripList}
            renderItem={(trip, index) => (
              <List.Item
                onClick={() => handleTripClick(trip, index)}
                className="hoverable-list-item"
                style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
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
