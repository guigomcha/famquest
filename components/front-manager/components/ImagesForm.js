import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from 'react-query';
import Form from 'react-bootstrap/Form';
import { CameraOutlined, VideoCameraAddOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Spin, Alert } from 'antd';
import { uploadAttachment, updateInDB, addReferenceInDB } from '../functions/db_manager_api';
import { GlobalMessage } from '../functions/components_helper';
import '../css/classes.css';
import { useTranslation } from "react-i18next";

const ImagesForm = ( {initialData, refType, handledFinished} ) => {
  const { t, i18n } = useTranslation();
  const [imageBlob, setImageBlob] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [cameraOpened, setCameraOpened] = useState(false);
  const [cameraOption, setCameraOption] = useState("front");
  const [isRecording, setIsRecording] = useState(false); // State for recording label
  const videoRecorder = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null); // For real-time preview
  const canvasRef = useRef(null); // To capture still images
  const cameraRef = useRef(null); // To keep track of the camera stream
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);

  const stopCameraPreview = () => {
    mediaStream?.getTracks().forEach((track) => track.stop());
    setCameraOpened(false);
    cameraRef.current = null;
  };

  // Open the camera for capturing image or recording video
  const toggleCamera = async (e) => {
    e.preventDefault();  // Prevent form submission
    e.stopPropagation(); // Stop event propagation to parent form
    setCameraOpened(!cameraOpened);
    // Uses the previous value (anticipate it will be false)
    if (cameraOpened) {
      stopCameraPreview();
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: (cameraOption == "front")? "user" : "environment"
      },
      audio: true,
    });
    setMediaStream(stream);
    cameraRef.current = stream;
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  // Capture an image from the camera
  const captureImage = async (e) => {
    e.preventDefault();  // Prevent form submission
    e.stopPropagation(); // Stop event propagation to parent form
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => setImageBlob(blob), "image/jpeg");

    // Stop the camera after capturing the image
    stopCameraPreview();
    setVideoBlob(null);
  };

  // Start video recording
  const toggleVideoRecording = async (e) => {
    e.preventDefault();  // Prevent form submission
    e.stopPropagation(); // Stop event propagation to parent form
    setIsRecording(!isRecording);
    // Uses the previous value (anticipate it will be false)
    if (isRecording) {
      videoRecorder.current?.stop();
      stopCameraPreview();
      setIsRecording(false); // Remove recording label
      setImageBlob(null);
      return;
    }

    const recorder = new MediaRecorder(cameraRef.current);
    videoRecorder.current = recorder;

    recorder.ondataavailable = (e) => setVideoBlob(e.data);
    recorder.start();
    setIsRecording(true); // Show recording label
  };

  const handleCameraOptionEvent = (e) => {
    e.preventDefault();  // Prevent form submission
    e.stopPropagation(); // Stop event propagation to parent form
    setCameraOption(e.target.name);
  }
  // Handle file selection and show the image on the canvas
  const handleFileChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  
    const fileType = selectedFile.type;
  
    if (fileType.startsWith("image/") || fileType == "application/pdf") {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const context = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => setImageBlob(blob), fileType);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(selectedFile);
      setVideoBlob(null);
    } else if (fileType.startsWith("video/")) {
      setVideoBlob(selectedFile);
      setImageBlob(null);
    } else {
      GlobalMessage(t('unsupportedFileType'), "error");
    }
  };
  

  const handleSubmit = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      console.info("not valid");
      setIsLoading(false);
      GlobalMessage(t('formNotValid'), "error");
      return;
    }
    
    console.info("submit handled: ", form);
    const formDataObj = new FormData(form);
    const dataToUpload = videoBlob || imageBlob || formDataObj.get("file");
    formDataObj.set("datetime", formDataObj.get("datetime")+"T00:00:00Z")
    formDataObj.set("contentType", dataToUpload.type)
    // Is a put
    if (initialData?.id){
      // Convert FormData to a plain object
      console.info("creating formvalues version");
      const formValues = {};
      formDataObj.forEach((value, key) => {
        formValues[key] = value;
      });
      if (dataToUpload) {
        console.info("image is not updated, only name and description");
      }  
      const attachment = await updateInDB(formValues, 'attachment');
      if (!attachment) {
        console.info("error updating attachment");
      }
      console.info("Updated: ", attachment)
      setIsLoading(false);
      handledFinished("done");
      GlobalMessage(t('actionCompleted'), "info");
      return;
    }
    console.info("new image to be sent")
    if (!dataToUpload) {
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
      // Add reference to current parent
      await addReferenceInDB(attachment.id, initialData.refId, refType, 'attachment');
      GlobalMessage(t('actionCompleted'), "info");
    } else {
      console.info(t('internalError'));
      GlobalMessage(t('internalError'), "error");
    }

    setFile('');
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
      <Form noValidate onSubmit={handleSubmit} encType="multipart/form-data">
        {initialData?.id && <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridId">
            <Form.Label>Id ({t('readOnly')})</Form.Label>
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
        {!initialData?.id && <Row className="mb-3">
          <Row>
            <Col>
              <Form.Label>{t('selectFromDevice')}</Form.Label>
              <Form.Control 
                type="file" 
                name="file" 
                accept="image/*,video/*,application/pdf"
                onChange={handleFileChange}
                />
            </Col>
            <Col>
            <Dropdown as={ButtonGroup}>
              <Button trigger="click"
                color="primary" 
                variant="solid"
                onClick={toggleCamera}
                >{t('cameraControl')}<br></br>{cameraOption} {t('camera')}</Button>
              <Dropdown.Toggle split variant="default" id="dropdown-split-basic" />
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleCameraOptionEvent} name="front">{t('front')}</Dropdown.Item>
                <Dropdown.Item onClick={handleCameraOptionEvent} name="back">{t('back')}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {cameraOpened && (
              <Row className="mb-2">
                <Col>
                  <Button trigger="click"
                    type="primary"
                    icon={<VideoCameraAddOutlined />}
                    onClick={toggleVideoRecording}
                    >Start/Stop <br></br>Video Recording</Button>
                </Col>
                <Col>
                  <Button trigger="click"
                    color="primary" 
                    variant="outlined"
                    icon={<CameraOutlined />}
                    onClick={captureImage}
                    >{t('cameraTakePhoto')}</Button>
                </Col>
              </Row>
            )}
            </Col>
            
          </Row>
          <Row className="mb-2">
            <Col>
            {(cameraOpened || file != null) && (
              <Card>
                <Card.Title>{t('cameraPreview')}</Card.Title>
                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                {cameraOpened && (                       
                  <video
                    name="videoPreview"
                    ref={videoRef}
                    style={{ width: "300px" }}
                    autoPlay
                    muted
                  ></video>
                )}
                {isRecording && (
                  <label 
                    htmlFor="videoPreview"
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      fontWeight: "bold",
                      zIndex: 10,
                    }}
                  >
                    {t('recording')}
                  </label>
                )}
              </Card>
            )}
            </Col>
            <Col>
              <Card>
              {(imageBlob || videoBlob) &&
                <Card.Title>{t('preview')}</Card.Title>
              }
                {imageBlob &&
                <img
                  src={URL.createObjectURL(imageBlob)}
                  alt="Captured"
                  style={{ width: "200px", marginTop: "10px" }}
                />
                }
                {videoBlob && (
                  <video controls width="300" src={URL.createObjectURL(videoBlob)}></video>
                )}
              </Card>
            </Col>
          </Row>
        </Row>
        }
      <Button 
        color="primary" 
        variant="solid"
        htmlType="submit"
      >{initialData?.id ? t('update') : t('upload')}</Button>
      </Form>
    </>
  );
};
export default ImagesForm;
