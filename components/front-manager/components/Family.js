import React, { useState, useEffect } from 'react';
import Images from './Images';
import Audio from './Audio';
import Card from 'react-bootstrap/Card';
import { Button } from 'antd';
import SpotForm from './SpotForm';
import Note from './Note';
import NoteForm from './NoteForm';
import { EditOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import { SpotFromForm, findById } from '../backend_interface/components_helper';
import { getUserInfo, getInDB } from '../backend_interface/db_manager_api';
import {renderEmptyState, renderDescription} from '../utils/render_message';
import SlideMenu from './SlideMenu';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

// Shows the user info and all the notes from other family members
const FamilyTab = ({ userId }) => {
  const [component, setComponent] = useState(null);
  // const [info, setInfo] = useState({});
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [key, setKey] = useState('');

  const selectTab = (key) => {
    setKey(key);
  };

  const handleRequestNew = (e) => {
    setComponent(<NoteForm handledFinished={handleNestedRequestEdit} />);
  }; 

  const handleRequestEdit = (e) => {
    console.info("Handle Open with ", e)
    setComponent(<UserForm initialData={findById(tempUsers, userId)} handledFinished={handleNestedRequestEdit} />);
  };

  const handleNestedRequestEdit = (comp) => {
    console.info("handleNested ", comp);
    if (comp == "done" || !comp) {
      setComponent(null);  
    } else {
      setComponent(comp); // Trigger show slideMenu
    }
  };

  // fetch all the relevant info
  const fetchRelatedInfo = async () => {
    console.info("fetching users ");
    const tempUsers = await getUserInfo(0);
    console.info("obtained tempUsers ", tempUsers);
    setKey(findById(tempUsers, userId)?.name || "");
    setUsers(tempUsers);
    const tempNotes = await getInDB('note');
    setNotes(tempNotes);
    console.info("obtained tempNotes ", tempNotes);
  };
  
  useEffect(() => {
    fetchRelatedInfo();
  }, [userId, component]);


  return (
    <>
    <Tabs
          id="user-tabs"
          activeKey={key}
          onSelect={(k) => selectTab(k)}
          className="mb-3"
        >
          {users.map((user, index) => (
            <Tab eventKey={user.name} title={user.name}>
              <Card>
                <Card>
                  <Card.Title>User info</Card.Title>
                  <Card.Body>
                    <Card.Text>{renderDescription(user.bio)}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <Card.Text>Contact: {user.email}</Card.Text>
                    <Card.Text>Birthday: {user.birthday}</Card.Text>
                    {(userId == user.id) && 
                      (<Button
                        trigger="click"
                        type="default"
                        icon={<EditOutlined />}
                        onClick={handleRequestEdit}
                      >
                        Edit
                      </Button>)}
                  </Card.Footer>
                </Card>
                <Card>
                  <Card.Title>Notes</Card.Title>
                  <Card.Body>
                    {notes.length > 0 ? ( 
                      <ListGroup as="ol" numbered>
                        {notes
                          .filter(note => note.refUserUploader === user.id)
                          .map((note, index) => (
                            <ListGroup.Item className="justify-content-between align-items-start" as="li" action onClick={() => handleNestedRequestEdit(<Note initialData={notes[index]} userId={user.id} handledFinished={handleNestedRequestEdit} />)} key={index} variant="light">
                              {note.name}
                              <Badge bg="primary" pill>
                              {note.category}
                              </Badge>
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                      ) : (
                        renderEmptyState("Create new to see it")
                      )}
                  </Card.Body>
                  <Card.Footer>
                  {(userId == user.id) && 
                    <Button trigger="click"
                    type="default"
                    icon={<AppstoreAddOutlined />}
                    onClick={handleRequestNew}
                    >New</Button>}
                  </Card.Footer>
                </Card>
                <Card.Footer>
                  Connected as: {findById(users, userId)?.name}
                </Card.Footer>
              </Card>
            </Tab>
          ))}
      </Tabs>     
      <SlideMenu component={component} handledFinished={handleNestedRequestEdit}/>
    </>
  );
};

export default FamilyTab;
