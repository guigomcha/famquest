import React, { useState, useRef, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Spin, Alert } from 'antd';
import { uploadAttachment, addReferenceToAttachment, updateAttachment } from '../backend_interface/db_manager_api';
import '../css/classes.css';

const AudioForm = ({ initialData, refId, refType, handledFinished }) => {
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
      return;
    }
    console.info("submit handled: ", form);
    const formDataObj = new FormData(form);
    
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
      const attachment = await updateAttachment(formValues);
      if (!attachment) {
        console.info("error updating attachment");
      }
      console.info("Updated: ", attachment)
      setIsLoading(false);
      return;
    }
    console.info("new audio to be sent")
    if (!audioBlob) {
      setStatusMessage("Please record an audio first.");
      setIsLoading(false);
      return;
    }
    const attachment = await uploadAttachment(audioBlob, formDataObj);
    
    if (attachment) {
      // Add reference to current spot
      await addReferenceToAttachment(attachment.id, refId, refType);
    } else {
      setStatusMessage("Unable to send audio.");
    }
    setAudioBlob('');
    setIsLoading(false);
    handledFinished("done");
  };
  
  return (
    <>
      {(isLoading) && (
        <div className="spin-overlay">
          <Spin tip="Loading"></Spin>
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
              type="textarea"
              rows={10}
              name="description"
              style={{ resize: "none", overflowY: "scroll", maxHeight: "150px" }}
              placeholder="Add an initial description" 
              defaultValue={initialData?.description}
            />
          </Form.Group>
        </Row>
        <Row>
          { !initialData?.id &&
          <Button onClick={toggleAudioRecording} variant="primary">
              Start/Stop Audio Recording
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
                    Recording
                  </div>
                )}
              </Button>}          
              {audioBlob && (
                <audio controls src={URL.createObjectURL(audioBlob)}></audio>
              )}
          </Row>
          <Button variant="primary" type="submit">{initialData?.id ? ("Update Audio") : ("Upload Audio")}</Button>
          {statusMessage && <p>{statusMessage}</p>}
      </Form>
    </>
  );
};

export default AudioForm;
