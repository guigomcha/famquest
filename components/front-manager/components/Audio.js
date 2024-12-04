import React, { useState, useRef, useEffect } from "react";
import { uploadAttachment, addReferenceToAttachment, fetchAttachments } from '../backend_interface/db_manager_api';
import {renderEmptyState} from '../utils/render_message';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';
import Container from "react-bootstrap/esm/Container";

const Audio = ({ refId, refType }) => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioOpened, setAudioOpened] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const audioRecorder = useRef(null);
  const [audioStream, setAudioStream] = useState(null);
  const [selectedAudios, setSelectedAudios] = useState([]);

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
      callFetchAttachmentsForSpot(refId, refType);
    } else {
      setStatusMessage("Unable to send audio.");
    }
    setAudioBlob('');
    
  };

  // fetch the attachments for this spot
  useEffect(() => {
    callFetchAttachmentsForSpot(refId, refType)
  }, [refId]);
  return (
    <Container>
      <Card>
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
      </Card>
      <Card>
        <button onClick={handleSubmit}>Upload Audio</button>
        {statusMessage && <p>{statusMessage}</p>}
      </Card>
      <Card>
      {selectedAudios.length > 0 ? (
          <Carousel slide={false} data-bs-theme="dark" pause="hover" controls={true}> 
          {selectedAudios.map((audio, index) => (
            <Carousel.Item>
              <Card className="bg-dark text-white">
                <Card.Body>
                  <Card.ImgOverlay>
                    <Card.Title>{index}:{audio.name}</Card.Title>
                    <Card.Text>{audio.description}</Card.Text>
                  </Card.ImgOverlay>
                  <Card.Text style={{
                      "display": "flex",
                      "justify-content": "center",
                      "align-items": "center" 
                    }}>
                    <audio controls src={audio.url}></audio>
                  </Card.Text>
                </Card.Body>
              </Card>
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

export default Audio;
