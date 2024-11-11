import React, { useState, useRef } from 'react';
import '../css/SpotPopup.css';
import TaskForm from './TaskForm';
import { uploadAttachment, addReferenceToAttachment, fetchAttachment } from '../backend_interface/db_manager_api';

const attachments = [
  "https://th.bing.com/th/id/OIP.Z4qIxA17cq1sPEirnRyzGQHaLT?w=655&h=1000&rs=1&pid=ImgDetMain",
  "https://th.bing.com/th/id/R.49837456df01910ef35de88bdff89bea?rik=kU1JPVDY5co4%2fQ&riu=http%3a%2f%2farteguias.com%2fimagenes4%2fjaimeconquistador-2.jpg&ehk=YvUEHibrNGst307pVny1muBp2Vec5YJwqwqZQQKVPmQ%3d&risl=&pid=ImgRaw&r=0"
];

const SpotPopup = ({ id, name, description }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState(attachments);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [imageName, setImageName] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [file, setFile] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !imageName || !imageDescription) {
      console.info("FILL OUT EVERYTHING");
      setStatusMessage("Please fill out all fields.");
      return;
    }

    const attachment = await uploadAttachment(file, imageName, imageDescription);

    if (attachment) {
      // Add reference to current spot
      await addReferenceToAttachment(attachment.id, id, "spot");

      // Fetch the attachment data
      const fullAttachment = await fetchAttachment(attachment.id);
      console.debug("image Name: "+ imageName + " Url: "+fullAttachment.url)
      // Update the selected images
      setSelectedImages((prevImages) => [...prevImages, fullAttachment.url]);
    } else {
      setStatusMessage("Unable to send image.");
    }
    setImageName('');
    setImageDescription('');
    setFile('');

  };

  const addTask = (task) => {
    setTasks((prevTasks) => [...prevTasks, task]);
    setShowTaskForm(false);
  };

  const openTaskWindow = (task) => {
    const taskWindow = window.open('', 'TaskWindow', 'width=400,height=300');
    taskWindow.document.write(`
      <html>
        <head>
          <title>${task.name}</title>
        </head>
        <body>
          <h1>${task.name}</h1>
          <p>${task.description}</p>
          <button onclick="window.close()">Close</button>
        </body>
      </html>
    `);
    taskWindow.document.close();
  };

  const renderEmptyState = (message) => (
    <div className="empty-container">
      <p>{message}</p>
    </div>
  );

  return (
    <div className="custom-popup">
      <div className="header-container">
        <div className="info-container">
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
        
        <div className="task-container">
          <button onClick={() => setShowTaskForm(!showTaskForm)}>
            {showTaskForm ? 'Cancel' : 'Add Task'}
          </button>
          
          {showTaskForm && <TaskForm onAddTask={addTask} />}
          
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div key={index} className="task-item">
                <a onClick={() => openTaskWindow(task)}>
                  {task.name}
                </a>
              </div>
            ))
          ) : (
            renderEmptyState("Create new to see it")
          )}
        </div>
      </div>

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
              <label htmlFor="fileUpload">Upload from Device</label>
              <input type="file" id="fileUpload" name="fileUpload" accept="image/*" style={{"display": "none"}} onChange={handleFileChange}/>
            </div>
            <div className="form-cell">
              <label htmlFor="cameraCapture">Capture from Camera</label>
              <input type="file" id="cameraCapture" name="cameraCapture" accept="image/*" capture="environment" style={{"display": "none"}} onChange={handleFileChange}/>
            </div>
          </div>
            <button type="submit">Upload</button>
            {statusMessage && <p>{statusMessage}</p>}
        </form>
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

export default SpotPopup;
