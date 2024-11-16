import React, { useState, useRef } from "react";

const MediaRecorderComponent = () => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [cameraOpened, setCameraOpened] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // State for recording label
  const audioRecorder = useRef(null);
  const videoRecorder = useRef(null);
  const [audioStream, setAudioStream] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null); // For real-time preview
  const canvasRef = useRef(null); // To capture still images
  const cameraRef = useRef(null); // To keep track of the camera stream

  // Start recording audio
  const startAudioRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioRecorder.current = recorder;
    setAudioStream(stream);

    recorder.ondataavailable = (e) => setAudioBlob(e.data);
    recorder.start();
  };

  const stopAudioRecording = () => {
    audioRecorder.current?.stop();
    audioStream?.getTracks().forEach((track) => track.stop());
  };

  const stopCameraPreview = () => {
    mediaStream?.getTracks().forEach((track) => track.stop());
    setCameraOpened(false);
    cameraRef.current = null;
  };

  // Open the camera for capturing image or recording video
  const toggleCamera = async () => {
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
    cameraRef.current = stream;
    videoRef.current.srcObject = stream;
    setMediaStream(stream);
    videoRef.current.play();
  };

  // Capture an image from the camera
  const captureImage = () => {
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
  const startVideoRecording = async () => {
    const recorder = new MediaRecorder(cameraRef.current);
    videoRecorder.current = recorder;

    recorder.ondataavailable = (e) => setVideoBlob(e.data);
    recorder.start();
    setIsRecording(true); // Show recording label
  };

  // Stop video recording
  const stopVideoRecording = () => {
    videoRecorder.current?.stop();
    stopCameraPreview();
    setIsRecording(false); // Remove recording label
  };

  return (
    <div>
      <h2>Media Recorder</h2>

      {/* Audio Recording */}
      <div>
        <h3>Audio</h3>
        <button onClick={startAudioRecording}>Start Audio Recording</button>
        <button onClick={stopAudioRecording}>Stop Audio Recording</button>
        {audioBlob && (
          <audio controls src={URL.createObjectURL(audioBlob)}></audio>
        )}
      </div>

      {/* Image Capture */}
      <div>
        <h3>Camera</h3>
        <button onClick={toggleCamera}>Open/Close Camera</button>
        {cameraOpened && (
          <div style={{ position: "relative" }}>
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
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
            <button onClick={captureImage}>Capture Image</button>
          </div>
        )}
        {imageBlob && (
          <img
            src={URL.createObjectURL(imageBlob)}
            alt="Captured"
            style={{ width: "200px", marginTop: "10px" }}
          />
        )}
      </div>

      {/* Video Recording */}
      <div>
        <h3>Video (with Audio)</h3>
        {cameraOpened && (
          <div>
            <div>
              <button onClick={startVideoRecording}>Start Video Recording</button>
              <button onClick={stopVideoRecording}>Stop Video Recording</button>
            </div>
          </div>
        )}
        {videoBlob && (
          <video
            controls
            width="300"
            src={URL.createObjectURL(videoBlob)}
          ></video>
        )}
      </div>
    </div>
  );
};

export default MediaRecorderComponent;
