import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Spin } from 'antd';
import '../css/classes.css';
import { updateInDB } from '../backend_interface/db_manager_api';
import { DatePicker, Space } from 'antd';
import { useTranslation } from "react-i18next";
import { GlobalMessage } from '../backend_interface/components_helper';

// This request the baseline info to create a new User in DB
const UserForm = ({ initialData, handledFinished }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

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
    const formValues = {
      "email": initialData.email,
      "extRef": initialData.extRef,
      "role": initialData.role,
    };
    formDataObj.forEach((value, key) => {
      formValues[key] = value;
    });
    const newUser = await updateInDB(formValues, 'user');
    console.info("Received user", newUser);
    if (!newUser){
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
            <Form.Label>{t('name')} ({t('readOnly')})</Form.Label>
            <Form.Control
              readOnly
              type="text"
              name="name"
              defaultValue={initialData?.name}
            />
          </Form.Group>
          <Form.Group as={Col} controlId="formGridBirthday">
            <Form.Label>{t('birthday')}</Form.Label>
            <Form.Control
              required
              type="date"
              name="birthday"
              defaultValue={initialData?.birthday}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="formGridBio">
            <Form.Label>{t('biography')}</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={10}
              name="bio"
              placeholder={t('editBiography')}
              defaultValue={initialData?.bio}
              style={{
                resize: 'none',
                overflowY: 'scroll',
                maxHeight: '200px',
              }}
            />
          </Form.Group>
        </Row>
        <Button variant="primary" type="submit">
          {t('submit')}
        </Button>
      </Form>
    </>
  );
};

export default UserForm;
