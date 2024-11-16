import React, { useState, useRef, useEffect } from 'react';
import '../css/SpotPopup.css';
import TaskForm from './TaskForm';
import Attachments from './Attachments';
import Audio from './Audio';


const SpotPopup = ({ spot }) => {
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);

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
          <h3>{spot.name}</h3>
          <p>{spot.description}</p>
          {/* <Audio /> */}
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
          <Attachments refId={spot.id} refType={'spot'} />
        </div>
      </div>

    </div>
  );
};

export default SpotPopup;
