import React, { useState, useRef, useEffect } from "react";
import { Button } from 'antd';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Spin, Alert } from 'antd';
import { uploadAttachment, addReferenceInDB, updateInDB } from '../functions/db_manager_api';
import { GlobalMessage } from '../functions/components_helper';
import '../css/classes.css';
import { useTranslation } from "react-i18next";


const AudioForm = ({ initialData, refType, handledFinished }) => {
  const { t, i18n } = useTranslation();
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioOpened, setAudioOpened] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const audioRecorder = useRef(null);
  const [audioStream, setAudioStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Start recording audio
  const toggleAudioRecording = async (e) => {
    e.preventDefault();  // Prevent form submission
    e.stopPropagation(); // Stop event propagation to parent form
    setAudioOpened(!audioOpened);

    // If already recording, stop the recording
    if (audioOpened) {
      audioRecorder.current?.stop();
      audioStream?.getTracks().forEach((track) => track.stop());
      return;
    }

    // Start recording audio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioRecorder.current = recorder;
    setAudioStream(stream);

    recorder.ondataavailable = (e) => setAudioBlob(e.data);
    recorder.start();
  };


  // Handle form submission and send audio file
  const handleSubmit = async (event) => {
    setIsLoading(true);
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() === false) {
      console.info("not valid");
      setIsLoading(false);
      GlobalMessage(t('formNotValid'), "error");
      return;
    }
    console.info("submit handled: ", form);
    const formDataObj = new FormData(form);
    formDataObj.set("datetime", formDataObj.get("datetime")+"T00:00:00Z")
    // Is a put
    if (initialData?.id){
      // Convert FormData to a plain object
      console.info("creating formvalues version");
      const formValues = {};
      formDataObj.forEach((value, key) => {
        formValues[key] = value;
      });
      if (audioBlob) {
        console.info("audio is not updated, only name and description");
      }  
      const attachment = await updateInDB(formValues, 'attachment');
      if (!attachment) {
        console.info("error updating attachment");
        GlobalMessage(t('internalError'), "error");
      } else {
        console.info("Updated: ", attachment)
        GlobalMessage(t('actionCompleted'), "info");
      }
      setIsLoading(false);
      handledFinished("done");
      return;
    }
    console.info("new audio to be sent")
    if (!audioBlob) {
      GlobalMessage(t('formNotValid'), "error");
      setIsLoading(false);
      return;
    }
    // Add default name and description
    if (formDataObj.get("name") == "") {
      formDataObj.set("name", t("autoName"));
    }
    if (formDataObj.get("description") == "") {
      formDataObj.set("description", t("autoDescription"));
    }
    
    const attachment = await uploadAttachment(audioBlob, formDataObj);
    
    if (attachment) {
      // Add reference to current spot
      await addReferenceInDB(attachment.id, initialData.refId, refType, 'attachment');
      GlobalMessage(t('actionCompleted'), "info");
    } else {
      console.info("unable to upload audio");
      GlobalMessage(t('internalError'), "error");
    }
    setAudioBlob('');
    setIsLoading(false);
    handledFinished("done");
  };
  return (
    <>
      {(isLoading) && (
        <div className="spin-overlay">
          <Spin tip={t('loading')}></Spin>
        </div>
      )}
      <Form noValidate onSubmit={handleSubmit}>
      {initialData?.id && <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridId">
          <Form.Label>Id (readOnly)</Form.Label>
          <Form.Control type="text" name="id" defaultValue={initialData?.id} readOnly />
        </Form.Group>
      </Row>}
      <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridName">
            <Form.Label>{t('name')}</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder={t('editName')}
              defaultValue={initialData?.name} 
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
              type="textarea"
              rows={10}
              name="description"
              style={{ resize: "none", overflowY: "scroll", maxHeight: "150px" }}
              placeholder={t('editDescription')} 
              defaultValue={initialData?.description}
            />
          </Form.Group>
        </Row>
        <Row>
          { !initialData?.id &&
          <Button onClick={toggleAudioRecording} variant="primary">
              {t('audioControl')}
              {audioOpened && (
                  <div
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    {t('recording')}
                  </div>
                )}
              </Button>}          
              {audioBlob && (
                <audio controls src={URL.createObjectURL(audioBlob)}></audio>
              )}
          </Row>
          <Button variant="primary" type="submit">{initialData?.id ? (t('update')) : (t('upload'))}</Button>
      </Form>
    </>
  );
};

export default AudioForm;
