import React, { useState, useRef, useEffect } from "react";
import { uploadAttachment, addReferenceToAttachment, fetchAttachments } from '../backend_interface/db_manager_api';

const Camera = ( {refId, refType} ) => {
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


  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % selectedImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex - 1 + selectedImages.length) % selectedImages.length
    );
  };
  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const callFetchAttachmentsForSpot = async (refId, refType) => {
    setSelectedImages([]); 
    const attachments = await fetchAttachments(refId, refType);

    attachments.forEach(attachment => {
      setSelectedImages((prevImages) => [...prevImages, attachment.url]);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !imageName || !imageDescription) {
      setStatusMessage("Please fill out all fields.");
      return;
    }

    const attachment = await uploadAttachment(file, imageName, imageDescription);

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

  const renderEmptyState = (message) => (
    <div className="empty-container">
      <p>{message}</p>
    </div>
  );
  // fetch the attachments for this spot
  useEffect(() => {
    callFetchAttachmentsForSpot(refId, refType)
  }, [refId]);

  return (

    <div>
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
              <input type="file" id="fileUpload" name="fileUpload" accept="image/*" style={{"display": "none"}} onChange={handleFileChange}/>
            </div>
            <div className="form-cell">
              <button onClick={toggleCamera}>Open/Close Camera</button>
              {cameraOpened && (
                  <div>
                    <button onClick={toggleVideoRecording}>Start/Stop Video Recording</button>
                    <button onClick={captureImage}>Capture Image</button>
                  </div>
                )}
            </div>
          </div>
          <div className="form-row">
            <button type="submit">Upload</button>
            {statusMessage && <p>{statusMessage}</p>}
          </div>
          <div className="form-row">
            {imageBlob && (
              <img
              src={URL.createObjectURL(imageBlob)}
              alt="Captured"
              style={{ width: "200px", marginTop: "10px" }}
              />
            )}
            {videoBlob && (
              <video
              controls
              width="300"
              src={URL.createObjectURL(videoBlob)}
              ></video>
            )}
          </div>
        </form>
        <div className="form-row">
          {cameraOpened && (
              <div style={{ position: "relative", zIndex: 1000000000}}>
                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                <video
                  ref={videoRef}
                  style={{ width: "300px" }}
                  autoPlay
                  muted
                ></video>
                {isRecording && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backgroundColor: "red",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      fontWeight: "bold",
                      zIndex: 10,
                    }}
                  >
                    Recording
                  </div>
                )}
              </div>
            )}
          </div>
        {selectedImages.length > 0 ? (
          <div className="carousel-container">
            <button onClick={handlePrev} disabled={selectedImages.length <= 1}>Prev</button>
            <img src={selectedImages[currentIndex]} alt={`Attachment ${currentIndex + 1}`} className="carousel-image" />
            <button onClick={handleNext} disabled={selectedImages.length <= 1}>Next</button>
          </div>
        ) : (
          renderEmptyState("Create new to see it")
        )}
      </div>


    </div>
  );
};

export default Camera;
