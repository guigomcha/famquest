import React, { useState, useRef, useEffect } from "react";
import { uploadAttachment, addReferenceToAttachment, fetchAttachments } from '../backend_interface/db_manager_api';
import {renderEmptyState} from '../utils/render_message';
import Audio from './Audio';
import { Carousel } from 'antd';

const Images = ( {refId, refType} ) => {
  const [imageBlob, setImageBlob] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [cameraOpened, setCameraOpened] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // State for recording label
  const videoRecorder = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null); // For real-time preview
  const canvasRef = useRef(null); // To capture still images
  const cameraRef = useRef(null); // To keep track of the camera stream
  // 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [imageName, setImageName] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [file, setFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);


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
      video: true,
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


  // Handle file selection and show the image on the canvas
  const handleFileChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToUpload = file || imageBlob;
    if (!dataToUpload || !imageName || !imageDescription) {
      setStatusMessage("Please fill out all fields.");
      return;
    }

    const attachment = await uploadAttachment(dataToUpload, imageName, imageDescription);

    if (attachment) {
      // Add reference to current spot
      await addReferenceToAttachment(attachment.id, refId, refType);
      callFetchAttachmentsForSpot(refId, refType)
    } else {
      setStatusMessage("Unable to send image.");
    }
    setImageName('');
    setImageDescription('');
    setFile('');

  };


  // fetch the attachments for this spot
  useEffect(() => {
    callFetchAttachmentsForSpot(refId, refType)
  }, [refId]);

  
  return (
    <div className="attachment-container">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="attachment-container">
          <input 
            type="text" 
            value={imageName} 
            onChange={(e) => setImageName(e.target.value)} 
            placeholder="Image Name" 
            required 
          />
          <textarea 
            value={imageDescription} 
            onChange={(e) => setImageDescription(e.target.value)} 
            placeholder="Image Description" 
            required 
          />
        </div>
        <div className="form-row">
          <div className="form-cell">
            <label htmlFor="fileUpload" style={{
                display: "inline-block",
                padding: "10px 20px",
                backgroundColor: "#007BFF", // Button color
                color: "#FFFFFF",          // Text color
                border: "none",
                borderRadius: "4px",
                textAlign: "center",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                textDecoration: "none",    // Remove underline
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Optional shadow
                transition: "background-color 0.3s ease",
            }}>Upload from Device</label>
            <input 
              type="file" 
              id="fileUpload" 
              name="fileUpload" 
              accept="image/*" 
              style={{ display: "none" }} 
              onChange={handleFileChange} 
            />
          </div>
          <div className="form-cell">
            <button onClick={toggleCamera}>Open/Close Camera</button>
            {cameraOpened && (
              <div>
                <button onClick={toggleVideoRecording}>Start/Stop Video Recording</button>
                <button onClick={captureImage}>Capture Image</button>
              </div>
            )}
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
          </div>
        </div>
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
        <div className="form-row">
          <button type="submit">Upload</button>
          {statusMessage && <p>{statusMessage}</p>}
        </div>
      </form>
      {selectedImages.length > 0 ? (
        <Carousel arrows infinite={false}>
          {selectedImages.map((image, index) => (
            <div key={index} style={{
              margin: 0,
              height: '160px',
              color: '#fff',
              lineHeight: '160px',
              textAlign: 'center',
              background: '#364d79',
            }}>
              <h3>{image.name}</h3>
              <h4>{image.description}</h4>
              <img src={image.url} alt={`Attachment ${index + 1}`} className="carousel-image" />
              <Audio refId={image.id} refType={'attachment'} />
            </div>
          ))}
        </Carousel>
      ) : (
        renderEmptyState("Create new to see it")
      )}
    </div>
  );
};
export default Images;
