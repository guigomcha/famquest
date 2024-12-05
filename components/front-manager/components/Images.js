import React, { useState, useRef, useEffect } from "react";
import { uploadAttachment, addReferenceToAttachment, fetchAttachments } from '../backend_interface/db_manager_api';
import {renderEmptyState} from '../utils/render_message';
import Audio from './Audio';
import Carousel from 'react-bootstrap/Carousel';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

const Images = ( {refId, refType} ) => {
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

  const [file, setFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [validated, setValidated] = useState(false);

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
    e.preventDefault();  // Prevent form submission
    e.stopPropagation(); // Stop event propagation to parent form
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.width = img.width;  // Set canvas size to image size
        canvas.height = img.height;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);  // Draw image on canvas
        canvas.toBlob((blob) => setImageBlob(blob), "image/jpeg");
      };
      img.src = reader.result;  // Set image source as the result of the FileReader
    };
    reader.readAsDataURL(selectedFile);
  };

  const callFetchAttachmentsForSpot = async (refId, refType) => {
    setSelectedImages([]); 
    const attachments = await fetchAttachments(refId, refType);

    attachments.forEach(attachment => {
      if (attachment.contentType.startsWith("image/")) {
        setSelectedImages((prevImages) => [...prevImages, attachment]);
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      console.info("not valid");
      return;
    }
    const formDataObj = new FormData(form);
    // Convert FormData to a plain object
    const formValues = {};
    formDataObj.forEach((value, key) => {
      formValues[key] = value;
    });
    console.info("Form data", formValues);
    
    const dataToUpload = formDataObj.file || imageBlob;
    if (!dataToUpload) {
      console.info("You need to select at file or photo");
      return;
    }
    
    const attachment = await uploadAttachment(dataToUpload, formValues.name, formValues.description);

    if (attachment) {
      // Add reference to current spot
      await addReferenceToAttachment(attachment.id, refId, refType);
      callFetchAttachmentsForSpot(refId, refType)
    } else {
      console.info("Unable to send image.");
    }
    setFile('');

  };


  // fetch the attachments for this spot
  useEffect(() => {
    callFetchAttachmentsForSpot(refId, refType)
  }, [refId]);

  
  return (
    <Container>
      <Card>
        <Form noValidate onSubmit={handleSubmit} encType="multipart/form-data">
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridName">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                required
                type="text"
                name="name"
                placeholder="Add a new name" 
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formGridDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                required
                type="text"
                name="description"
                placeholder="Add an initial description" 
              />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Row>
              <Col>
                <Form.Label>Select from device</Form.Label>
                <Form.Control 
                  type="file" 
                  name="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  />
              </Col>
              <Col>
              <Dropdown as={ButtonGroup}>
                <Button variant="primary" onClick={toggleCamera}>Open/Close<br></br>{cameraOption} Camera</Button>
                <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" />
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleCameraOptionEvent} name="front">Front</Dropdown.Item>
                  <Dropdown.Item onClick={handleCameraOptionEvent} name="back">Back</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              {cameraOpened && (
                <>
                  <Col>
                    <Button variant="primary" onClick={toggleVideoRecording} size="sm">Start/Stop Video Recording</Button>
                  </Col>
                  <Col>
                    <Button variant="primary" onClick={captureImage} size="sm">Capture Image</Button>
                  </Col>
                </>
              )}
              </Col>
              
            </Row>
            <Row>
              <Col>
              {(cameraOpened || file != null) && (
                <div style={{ position: "relative", zIndex: 1000000000 }}>
                  <h3>Camera Preview</h3>
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
                      Recording
                    </label>
                  )}
                </div>
              )}
              </Col>
              <Col>
              {imageBlob && (
                <div className="form-row">
                  <div className="form-row">
                    <h3>Loaded Content</h3>
                  </div>
                  <div className="form-row">
                    <img
                      src={URL.createObjectURL(imageBlob)}
                      alt="Captured"
                      style={{ width: "200px", marginTop: "10px" }}
                    />
                    {videoBlob && (
                      <video controls width="300" src={URL.createObjectURL(videoBlob)}></video>
                    )}
                  </div>
                </div>
              )}
              </Col>
            </Row>
          </Row>
        <Button variant="primary" type="submit">
          Submit
        </Button>
        </Form>
      </Card>
      <Card>
      {selectedImages.length > 0 ? (
        <Carousel slide={false} data-bs-theme="dark" pause="hover" controls={true}> 
          {selectedImages.map((image, index) => (
            <Carousel.Item>
              <Card className="bg-dark text-black">
                <Card.Img src={image.url} alt={`Attachment ${index + 1}`} className="center-block" />
                <Card.ImgOverlay>
                  <Card.Title>{image.name}</Card.Title>
                  <Card.Text>{image.description}</Card.Text>
                </Card.ImgOverlay>
              </Card>
                <Audio refId={image.id} refType={'attachment'} />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        renderEmptyState("Create new to see it")
      )}
      </Card>

    </Container>
  );
};
export default Images;
