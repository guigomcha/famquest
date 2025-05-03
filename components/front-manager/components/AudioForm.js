import React, { useState, useRef, useEffect } from "react";
import { Button } from 'antd';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
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
  const audioRecorder = useRef(null);
  const [audioStream, setAudioStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localAudioFile, setLocalAudioFile] = useState({});

  const handleFileChange = (event) => {
    event.preventDefault();  // Prevent form submission
    event.stopPropagation(); // Stop event propagation to parent form
    console.info("file selection ", event.target.files)
    const file = event.target.files[0];
    setAudioBlob(file);
    setLocalAudioFile(file);
  };
  
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
    console.info("submit handled: ", form);
    const formDataObj = new FormData(form);
    if (form.checkValidity() === false) {
      console.info("validity failed");
      formDataObj.forEach((value, key) => {
        console.info("form key: "+key + "- value: "+value)
      });
      setIsLoading(false);
      GlobalMessage(t('formNotValid'), "error");
      return;
    }
    const dataToUpload = audioBlob || formDataObj.get("file");
    formDataObj.set("datetime", formDataObj.get("datetime")+"T00:00:00Z")
    // for some reason in android it does not receive a type and the name does not have extension....
    formDataObj.set("contentType", dataToUpload?.type || "audio/ogg")

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
    console.info("new audio to be sent: "+dataToUpload?.type + ' - '+formDataObj.get("contentType"), dataToUpload)
    if (!dataToUpload) {
      console.info("form not valid", formDataObj)
      formDataObj.forEach((value, key) => {
        console.info("form key: "+key + "- value: "+value)
      });
      GlobalMessage(t('formNotValid'), "error");
      setIsLoading(false);
      return;
    }
    // Add default name and description
    if (formDataObj.get("name") == "") {
      formDataObj.set("name", dataToUpload?.name || t("autoName"));
    }
    if (formDataObj.get("description") == "") {
      formDataObj.set("description", t("autoDescription"));
    }
    
    const attachment = await uploadAttachment(dataToUpload, formDataObj);
    
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
          {!initialData?.id && (
            <>
              <Form.Group as={Col} controlId="formGridUploadAudio">
                <Form.Label>{t('selectFromDevice')}</Form.Label>
                <Form.Control type="file" name="file" accept="audio/*" onChange={handleFileChange} />
              </Form.Group>
              <Col className="mb-3">
                <Button 
                  onClick={toggleAudioRecording}
                  color="primary" 
                  variant="solid"
                  >
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
                </Button>
              </Col>
            </>
          )}
        <Col className="mb-3">
          <Card>
            <Card.Title>{t('cameraPreview')}</Card.Title>
            <Card.Body>
              {audioBlob && (
                <audio controls src={URL.createObjectURL(audioBlob)}></audio>
              )}
            </Card.Body>
          </Card>
        </Col>
        </Row>
        <Button 
          color="primary" 
          variant="solid"
          htmlType="submit"
        >{initialData?.id ? (t('update')) : (t('upload'))}
        </Button>
      </Form>
    </>
  );
};

export default AudioForm;
