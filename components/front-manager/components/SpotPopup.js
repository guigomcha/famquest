import React, { useState, useRef } from 'react';
import '../css/SpotPopup.css'; // Import your CSS for styling

const attachments = [
  "https://th.bing.com/th/id/OIP.Z4qIxA17cq1sPEirnRyzGQHaLT?w=655&h=1000&rs=1&pid=ImgDetMain",
  "https://th.bing.com/th/id/R.49837456df01910ef35de88bdff89bea?rik=kU1JPVDY5co4%2fQ&riu=http%3a%2f%2farteguias.com%2fimagenes4%2fjaimeconquistador-2.jpg&ehk=YvUEHibrNGst307pVny1muBp2Vec5YJwqwqZQQKVPmQ%3d&risl=&pid=ImgRaw&r=0"
];

const SpotPopup = ({ name, description }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState(attachments); // Start with existing attachments
  const fileInputRef = useRef(null); // Create a ref for the file input

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % selectedImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex - 1 + selectedImages.length) % selectedImages.length
    );
  };
  
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFileURLs = files.map((file) => URL.createObjectURL(file));
    setSelectedImages((prevImages) => [...prevImages, ...newFileURLs]); // Append new images
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className="custom-popup">
      <h3>{name}</h3>
      <p>{description}</p>
      <input 
        type="file" 
        accept="image/*" 
        multiple 
        onChange={handleImageUpload} 
        className="file-input" 
        ref={fileInputRef} // Attach the ref to the input
      />
      {selectedImages.length > 0 && (
        <div className="carousel">
          <button onClick={handlePrev} disabled={selectedImages.length <= 1}>Prev</button>
          <img src={selectedImages[currentIndex]} alt={`Attachment ${currentIndex + 1}`} className="carousel-image" />
          <button onClick={handleNext} disabled={selectedImages.length <= 1}>Next</button>
        </div>
      )}
    </div>
  );
};

export default SpotPopup;
