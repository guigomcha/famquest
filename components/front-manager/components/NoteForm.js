import React, { useState } from 'react';
import { Button } from 'antd';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Spin } from 'antd';
import '../css/classes.css';
import { updateInDB, createInDB, addReferenceInDB } from '../functions/db_manager_api';
import { useTranslation } from "react-i18next";
import { GlobalMessage } from '../functions/components_helper';


// This request the baseline info to create a new Note in DB
const NoteForm = ({ initialData, parentInfo, refType, handledFinished }) => {
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
    formDataObj.set("datetime", formDataObj.get("datetime")+"T00:00:00Z")
    // Convert FormData to a plain object
    const formValues = {};
    formDataObj.forEach((value, key) => {
      formValues[key] = value;
    });
    console.info("form content ", formValues);
    let newNote = {}
    if (formValues['id']) {
      newNote = await updateInDB(formValues, 'note');
    } else {
      newNote = await createInDB(formValues, 'note');
      withRef = await addReferenceInDB(newNote.id, parentInfo.id, refType, 'note');
      console.info("note after ref update", withRef);
    }
    if (!newNote){
      GlobalMessage(t('internalError'), "error");
    } else {
      GlobalMessage(t('actionCompleted'), "info");
    }
    console.info("Received new note ", newNote);
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
          <Form.Group as={Col} controlId="formGridCategory">
            <Form.Label>{t('category')}</Form.Label>
            <Form.Control
              required
              type="text"
              name="category"
              placeholder={t('editCategory')}
              defaultValue={initialData?.category}
            />
          </Form.Group>
          <Form.Group as={Col} controlId="formGridDatetime">
            <Form.Label>{t('datetime')}</Form.Label>
            <Form.Control
              required
              type="date"
              name="datetime"
              defaultValue={initialData?.datetime?.split("T")[0] || new Date().toISOString().split("T")[0]}
            />
          </Form.Group>
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
        <Button variant="primary" type="submit">
          {t('submit')}
        </Button>
      </Form>
    </>
  );
};

export default NoteForm;
