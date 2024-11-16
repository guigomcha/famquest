import React, { useState, useRef } from "react";

const MediaRecorderComponent = () => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const audioRecorder = useRef(null);
  const videoRecorder = useRef(null);
  const [audioStream, setAudioStream] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null); // For real-time preview
  const canvasRef = useRef(null); // To capture still images

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

  // Start camera for capturing image
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
  };

  // Stop camera
  const stopCamera = () => {
    mediaStream?.getTracks().forEach((track) => track.stop());
  };

  // Start video recording with audio
  const startVideoRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMediaStream(stream);
    videoRef.current.srcObject = stream;
    videoRef.current.play();

    const recorder = new MediaRecorder(stream);
    videoRecorder.current = recorder;

    recorder.ondataavailable = (e) => setVideoBlob(e.data);
    recorder.start();
  };

  const stopVideoRecording = () => {
    videoRecorder.current?.stop();
    mediaStream?.getTracks().forEach((track) => track.stop());
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
        <video ref={videoRef} style={{ width: "300px" }}></video>
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
        <div>
          <button onClick={startCamera}>Start Camera</button>
          <button onClick={captureImage}>Capture Image</button>
          <button onClick={stopCamera}>Stop Camera</button>
        </div>
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
        <video ref={videoRef} style={{ width: "300px" }} autoPlay muted></video>
        <div>
          <button onClick={startVideoRecording}>Start Video Recording</button>
          <button onClick={stopVideoRecording}>Stop Video Recording</button>
        </div>
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