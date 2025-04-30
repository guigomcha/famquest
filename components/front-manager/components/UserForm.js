import React, { useState } from 'react';
import { Button } from 'antd';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Spin } from 'antd';
import '../css/classes.css';
import { createInDB, updateInDB } from '../functions/db_manager_api';
import { DatePicker, Space } from 'antd';
import { useTranslation } from "react-i18next";
import { GlobalMessage } from '../functions/components_helper';

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
      "email": initialData?.email || "",
      "extRef": initialData?.extRef || "",
      "role": initialData?.role || "contributor",
    };
    formDataObj.forEach((value, key) => {
      formValues[key] = value;
    });
    let newUser = null;
    if (initialData?.id){
      newUser = await updateInDB(formValues, 'user');
    } else {
      newUser = await createInDB(formValues, 'user');      
    }
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
        {initialData?.extRef != "" ? (
          <Form.Group as={Col} controlId="formGridName">
            <Form.Label>{t('name')} ({t('readOnly')})</Form.Label>
            <Form.Control
              readOnly
              type="text"
              name="name"
              defaultValue={initialData?.name}
            />
          </Form.Group>) : (
          <Form.Group as={Col} controlId="formGridName">
            <Form.Label>{t('name')} </Form.Label>
            <Form.Control
              type="text"
              required
              name="name"
              defaultValue={initialData?.name}
            />
          </Form.Group>) }
          </Row>
          <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridBirthday">
            <Form.Label>{t('birthday')}</Form.Label>
            <Form.Control
              required
              type="date"
              name="birthday"
              defaultValue={initialData?.birthday?.split("T")[0]}
            />
          </Form.Group>
          <Form.Group as={Col} controlId="formGridPassing">
            <Form.Label>{t('passing')}</Form.Label>
            <Form.Control
              type="date"
              name="passing"
              defaultValue={initialData?.passing?.split("T")[0]}
            />
          </Form.Group>
          </Row>
          <Row className="mb-3">
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
        <Button 
          color="primary" 
          variant="solid"
          htmlType="submit"
        >{t('submit')}
        </Button>
      </Form>
    </>
  );
};

export default UserForm;
