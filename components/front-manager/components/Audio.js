import React, { useState, useRef, useEffect } from "react";
import { uploadAttachment, addReferenceToAttachment, fetchAttachments } from '../backend_interface/db_manager_api';
import {renderEmptyState} from '../utils/render_message';

const Audio = ({ refId, refType }) => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioOpened, setAudioOpened] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const audioRecorder = useRef(null);
  const [audioStream, setAudioStream] = useState(null);
  const [selectedAudios, setSelectedAudios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const callFetchAttachmentsForSpot = async (refId, refType) => {
    setSelectedAudios([]); 
    const attachments = await fetchAttachments(refId, refType);

    attachments.forEach(attachment => {
      if (attachment.contentType.startsWith("audio/")) {
        setSelectedAudios((prevImages) => [...prevImages, attachment]);
      }
    });
  };

  // Handle form submission and send audio file
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioBlob) {
      setStatusMessage("Please record an audio first.");
      return;
    }

    const attachment = await uploadAttachment(audioBlob, "default", "default");

    if (attachment) {
      // Add reference to current spot
      await addReferenceToAttachment(attachment.id, refId, refType);
      callFetchAttachmentsForSpot(refId, refType)
    } else {
      setStatusMessage("Unable to send audio.");
    }
    setAudioBlob('');
    
  };
  // Handle carousel navigation
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % selectedAudios.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + selectedAudios.length) % selectedAudios.length
    );
  };
  // fetch the attachments for this spot
  useEffect(() => {
    callFetchAttachmentsForSpot(refId, refType)
  }, [refId]);
  return (
    <div>
      {/* Audio Recording */}
      <div>
        <h3>Record your audio</h3>
        <button onClick={toggleAudioRecording}>
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
        </button>
        {audioBlob && (
          <audio controls src={URL.createObjectURL(audioBlob)}></audio>
        )}
      </div>

      {/* Audio Upload Form */}
      <div>
        <button onClick={handleSubmit}>Upload Audio</button>
        {statusMessage && <p>{statusMessage}</p>}
      </div>
      {selectedAudios.length > 0 ? (
        <div className="carousel-container">
          <button onClick={handlePrev} disabled={selectedAudios.length <= 1}>Prev</button>
          <audio controls src={selectedAudios[currentIndex].url}></audio>
          <button onClick={handleNext} disabled={selectedAudios.length <= 1}>Next</button>
        </div>
      ) : (
        renderEmptyState("Create new to see it")
      )}
    </div>
  );
};

export default Audio;
