import React, { useState, useRef, useEffect } from 'react';
import TaskForm from './TaskForm';
import Images from './Images';
import Audio from './Audio';
import {renderEmptyState} from '../utils/render_message';
import Card from 'react-bootstrap/Card';

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

  return (
    <Card > 
      <Card.Title>Spot: {spot.name}</Card.Title> 
      <Card.Body>
        <Card.Text>{spot.description}</Card.Text>
          <Audio refId={spot.id} refType={'spot'}/>
        <Card> 
          <Card.Body>
          <Card.Text>Tasks in the Spot</Card.Text>
          <button onClick={() => setShowTaskForm(!showTaskForm)}>
              {showTaskForm ? 'Cancel' : 'Add Task'}
            </button>            
            {showTaskForm && <TaskForm onAddTask={addTask} />}
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <div key={index} > 
                  <a onClick={() => openTaskWindow(task)}>
                    {task.name}
                  </a>
                </div>
              ))
            ) : (
              renderEmptyState("Create new to see it")
            )}            
          </Card.Body>
        </Card> 
        <Card>
          <Card.Text>Images in the Spot</Card.Text> 
          <Images refId={spot.id} refType={'spot'} />
        </Card> 
      </Card.Body>
    </Card>
  );
};

export default SpotPopup;
