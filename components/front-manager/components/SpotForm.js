import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Spin } from 'antd';
import '../css/classes.css';

// This request the baseline info to create a new Spot in DB
const SpotForm = ({ initialData, onSubmit, handledFinished }) => {
  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event) => {
    setIsLoading(true);
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() === false) {
      setIsLoading(false);
      return;
    }
    const formDataObj = new FormData(form);
    // Convert FormData to a plain object
    const formValues = {};
    formDataObj.forEach((value, key) => {
      formValues[key] = value;
    });
    setValidated(true);
    onSubmit(formValues);
    setIsLoading(false);
    handledFinished("done");
  };

  return (
    <>
      {isLoading && (
        <div className="spin-overlay">
          <Spin tip="Loading" />
        </div>
      )}
      <Form noValidate onSubmit={handleSubmit}>
        {initialData?.id && (
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridId">
              <Form.Label>Id (readOnly)</Form.Label>
              <Form.Control type="text" name="id" defaultValue={initialData?.id} readOnly />
            </Form.Group>
          </Row>
        )}
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              required
              type="text"
              name="name"
              placeholder="Add a new name"
              defaultValue={initialData?.name}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="formGridDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={10}
              name="description"
              placeholder="Add an initial description"
              defaultValue={initialData?.description}
              style={{
                resize: 'none',
                overflowY: 'scroll',
                maxHeight: '200px',
              }}
            />
          </Form.Group>
        </Row>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </>
  );
};

export default SpotForm;
