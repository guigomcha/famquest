import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import { Button } from 'antd';
import Note from './Note';
import NoteForm from './NoteForm';
import { EditOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import { getUserInfo, getInDB } from '../backend_interface/db_manager_api';
import {renderEmptyState, renderDescription} from '../utils/render_message';
import SlideMenu from './SlideMenu';
import UserForm from './UserForm';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useTranslation } from "react-i18next";

// Shows the user info and all the notes from other family members
const FamilyTab = ({ user }) => {
  const [component, setComponent] = useState(null);
  const { t, i18n } = useTranslation();
  // const [info, setInfo] = useState({});
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [key, setKey] = useState('');
  const [reload, setReload] = useState(true);
    
  const selectTab = (key) => {
    setKey(key);
  };

  const handleRequestNew = (e) => {
    setComponent(<NoteForm handledFinished={handleNestedRequestEdit} userId={user.id}/>);
  }; 

  const handleRequestEdit = (e) => {
    console.info("Handle Open with ", e);
    setComponent(<UserForm initialData={user} handledFinished={handleNestedRequestEdit} />);
  };

  const handleNestedRequestEdit = (comp) => {
    console.info("handleNested ", comp);
    if (comp == "done" || !comp) {
      setComponent(null);
      setReload(!reload);
    } else {
      setComponent(comp); // Trigger show slideMenu
    }
  };

  // fetch all the relevant info
  const fetchRelatedInfo = async () => {
    console.info("fetching users having ", user);
    const tempUsers = await getUserInfo(0);
    console.info("obtained tempUsers ", tempUsers);
    setKey(user.name);
    setUsers(tempUsers);
    const tempNotes = await getInDB('note');
    setNotes(tempNotes);
    console.info("obtained tempNotes ", tempNotes);
  };
  
  useEffect(() => {
    fetchRelatedInfo();
  }, [user, component, reload]);


  return (
    <>
    <Tabs
          id="user-tabs"
          activeKey={key}
          onSelect={(k) => selectTab(k)}
          className="mb-3"
        >
          {users.map((u, index) => (
            <Tab eventKey={u.name} title={u.name}>
              <Card>
                <Card>
                  <Card.Title>{t('userInfo')}</Card.Title>
                  <Card.Body>
                    <Card.Text>{renderDescription(u.bio)}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <Card.Text>Contact: {u.email}</Card.Text>
                    <Card.Text>Birthday: {u.birthday}</Card.Text>
                    {(user.id == u.id) && 
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
                  <Card.Title>{t('notes')}</Card.Title>
                  <Card.Body>
                    {notes.length > 0 ? ( 
                      <ListGroup as="ol" numbered>
                        {notes
                          .filter(note => note.refUserUploader == u.id)
                          .map((note, index) => (
                            <ListGroup.Item className="justify-content-between" as="li" action onClick={() => handleNestedRequestEdit(<Note initialData={note} userId={user.id} handledFinished={handleNestedRequestEdit} />)} key={index} variant="light">
                              {note.name}
                              <Badge bg="primary" pill>
                              {note.category}
                              </Badge>
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                      ) : (
                        renderEmptyState(t('empty'))
                      )}
                  </Card.Body>
                  <Card.Footer>
                  {(user.id == u.id) && 
                    <Button trigger="click"
                    type="default"
                    icon={<AppstoreAddOutlined />}
                    onClick={handleRequestNew}
                    >{t('new')}</Button>}
                  </Card.Footer>
                </Card>
                <Card.Footer>
                  {t('signedAs')}: {user.name}
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
