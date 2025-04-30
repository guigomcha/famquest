import React, { useState } from 'react';
import { Button } from 'antd';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Spin } from 'antd';
import '../css/classes.css';
import { useTranslation } from "react-i18next";
import { SpotFromForm, GlobalMessage } from '../functions/components_helper';

// This request the baseline info to create a new Spot in DB
const SpotForm = ({ initialData, handledFinished }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectValue, setSelectValue] = useState(initialData?.discovered?.condition?.parameterType || 'location');


  const handleSelectValue = (event) => {
    console.info("handle select ", event)
    event.preventDefault();
    event.stopPropagation();
    setSelectValue(event.target.value);
  };

  const handleSubmit = async (event) => {
    setIsLoading(true);
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() === false) {
      setIsLoading(false);
      GlobalMessage(t('formNotValid'), "error");
      return;
    }
    const formDataObj = new FormData(form);
    // Convert FormData to a plain object
    const formValues = {};
    formDataObj.forEach((value, key) => {
      formValues[key] = value;
    });
    console.info("submiting form ", formValues, initialData);
    const resp = await SpotFromForm(formValues, initialData);
    console.info("response from form ", resp);
    if (!resp){
      GlobalMessage(t('internalError'), "error");
    } else {
      GlobalMessage(t('actionCompleted'), "info");
    }
    setIsLoading(false);
    handledFinished("done");
  };

  return (
    <>
      {isLoading && (
        <div className="spin-overlay">
          <Spin tip={t('loading')} />
        </div>
      )}
      <Form noValidate onSubmit={handleSubmit}>
        {initialData?.id && (
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridId">
              <Form.Label>Id ({t('readOnly')})</Form.Label>
              <Form.Control type="text" name="id" defaultValue={initialData?.id} readOnly />
            </Form.Group>
          </Row>
        )}
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridName">
            <Form.Label>{t('name')}</Form.Label>
            <Form.Control
              required
              type="text"
              name="name"
              placeholder={t('editName')}
              defaultValue={initialData?.name}
            />
          </Form.Group>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formDiscoverSelect">
                <Form.Label>{t('editDiscoverOptionSelect')}</Form.Label>
                <Form.Control
                  as="select"
                  name="condition"
                  defaultValue={selectValue}
                  onChange={handleSelectValue}
                >
                  <option value="location">{t('discoverLocation')}</option>
                  <option value="date">{t('discoverDate')}</option>
                </Form.Control>
              </Form.Group>
              {
              (selectValue == "date") &&
              <Form.Group as={Col} controlId="formGridDate">
                <Form.Control
                  type="date"
                  name="date"
                  defaultValue={initialData?.discovered?.condition?.thresholdTarget ||  new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
              }
            </Col>
            <Col>
                <Form.Check
                  type="switch"
                  name="show"
                  label={t('editDiscoverOptionCheckbox')}
                  defaultChecked={initialData?.discovered?.show || false}
                >
                </Form.Check>
            </Col>
          </Row>

          </Row>
          <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridDescription">
            <Form.Label>{t('description')}</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={10}
              name="description"
              placeholder={t('editDescription')}
              defaultValue={initialData?.description}
              style={{
                resize: 'none',
                overflowY: 'scroll',
                maxHeight: '200px',
              }}
            />
          </Form.Group>
        </Row>
        <Button variant="solid" type="primary" htmlType="submit">
          {t('submit')}
        </Button>
      </Form>
    </>
  );
};

export default SpotForm;
