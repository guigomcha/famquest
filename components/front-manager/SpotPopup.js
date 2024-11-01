import React, { useState } from 'react';
import './css/SpotPopup.css'; // Import your CSS for styling

const SpotPopup = ({ name, description, attachments }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % attachments.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex - 1 + attachments.length) % attachments.length
    );
  };

  return (
    <div className="custom-popup">
      <h3>{name}</h3>
      <p>{description}</p>
      {attachments.length > 0 && (
        <div className="carousel">
          <button onClick={handlePrev} disabled={attachments.length <= 1}>Prev</button>
          <img src={attachments[currentIndex]} alt={`Attachment ${currentIndex + 1}`} />
          <button onClick={handleNext} disabled={attachments.length <= 1}>Next</button>
        </div>
      )}
    </div>
  );
};

export default SpotPopup;
