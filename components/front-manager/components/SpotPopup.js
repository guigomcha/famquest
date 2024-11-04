import React, { useState, useRef } from 'react';
import TaskForm from './TaskForm';
// Import your CSS for styling
import '../css/TaskContainer.css'; 
import '../css/SpotPopup.css'; 

const attachments = [
  "https://th.bing.com/th/id/OIP.Z4qIxA17cq1sPEirnRyzGQHaLT?w=655&h=1000&rs=1&pid=ImgDetMain",
  "https://th.bing.com/th/id/R.49837456df01910ef35de88bdff89bea?rik=kU1JPVDY5co4%2fQ&riu=http%3a%2f%2farteguias.com%2fimagenes4%2fjaimeconquistador-2.jpg&ehk=YvUEHibrNGst307pVny1muBp2Vec5YJwqwqZQQKVPmQ%3d&risl=&pid=ImgRaw&r=0"
];

const SpotPopup = ({ name, description }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState(attachments);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const fileInputRef = useRef(null);

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
    setSelectedImages((prevImages) => [...prevImages, ...newFileURLs]);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
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
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleImageUpload} 
            className="file-input" 
            ref={fileInputRef} 
          />
        </div>
        
        <div className="task-container">
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

      <button onClick={() => setShowTaskForm(!showTaskForm)}>
        {showTaskForm ? 'Cancel' : 'Add Task'}
      </button>
      
      {showTaskForm && <TaskForm onAddTask={addTask} />}
      
      {selectedImages.length > 0 ? (
        <div className="carousel">
          <button onClick={handlePrev} disabled={selectedImages.length <= 1}>Prev</button>
          <img src={selectedImages[currentIndex]} alt={`Attachment ${currentIndex + 1}`} className="carousel-image" />
          <button onClick={handleNext} disabled={selectedImages.length <= 1}>Next</button>
        </div>
      ) : (
        renderEmptyState("Create new to see it")
      )}
    </div>
  );
};

export default SpotPopup;
