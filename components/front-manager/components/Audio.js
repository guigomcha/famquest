import React, { useState, useRef } from "react";

const Audio = () => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioOpened, setAudioOpened] = useState(false);
  const audioRecorder = useRef(null);
  const [audioStream, setAudioStream] = useState(null);

  // Start recording audio
  const toggleAudioRecording = async () => {
    setAudioOpened(!audioOpened);
    // Uses the previous value (anticipate it will be false)
    if (audioOpened) {
      audioRecorder.current?.stop();
      audioStream?.getTracks().forEach((track) => track.stop());
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioRecorder.current = recorder;
    setAudioStream(stream);

    recorder.ondataavailable = (e) => setAudioBlob(e.data);
    recorder.start();
  };


  return (
    <div>
      <h2>Audio Recoder</h2>

      {/* Audio Recording */}
      <div>
        <h3>Describe with audio</h3>
        <button onClick={toggleAudioRecording}>Start/Stop Audio Recording
          {audioOpened && (<div
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "5px 10px",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            Recording
          </div>)}
        </button>
        {audioBlob && (
          <audio controls src={URL.createObjectURL(audioBlob)}></audio>
        )}
      </div>
    </div>
  );
};

export default Audio;
