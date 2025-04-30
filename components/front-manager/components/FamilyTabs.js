import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import { Button } from 'antd';
import Note from './Note';
import NoteForm from './NoteForm';
import { EditOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import { getUserInfo, getInDB } from '../functions/db_manager_api';
import {renderEmptyState, renderDescription} from '../functions/render_message';
import SlideMenu from './SlideMenu';
import UserForm from './UserForm';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import { useTranslation } from "react-i18next";
import FamilyTree from './FamilyTree';

// TODO: Connect to User generation with, and without app access
// Shows the user info and all the notes from other family members
const FamilyTabs = ({ user }) => {
  const [component, setComponent] = useState(null);
  const { t, i18n } = useTranslation();
  // const [info, setInfo] = useState({});
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [key, setKey] = useState('');
  const [reload, setReload] = useState(true);
    
  const selectTab = async (key) => {
    setKey(key);
    const tempNotes = await getInDB('note');
    setNotes(tempNotes);
  };

  const handleRequestNew = (e) => {
    const parentInfo = users.filter(u => u.id == key)[0]
    setComponent(<NoteForm handledFinished={handleNestedRequestEdit} parentInfo={parentInfo} refType={'user'}/>);
  }; 

  const handleRequestNewUser = (e) => {
    setComponent(<UserForm handledFinished={handleNestedRequestEdit} />);
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
    setUsers(tempUsers);
    selectTab(user.id);
  };
  
  useEffect(() => {
    console.info("main useffect")
    fetchRelatedInfo();
  }, [component, reload]);

  return (
    <>
    <Row>
      <Card>
        <Card.Title>{t("familyTitle")}</Card.Title>
        <FamilyTree users={users} ></FamilyTree>
      </Card>
    </Row>
    <Row>
      <Tabs
        id="user-tabs"
        activeKey={key}
        onSelect={(k) => selectTab(k)}
        className="mb-3"
      >
        {users.map((u, index) => (
          <Tab eventKey={u.id} title={u.name}>
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
                        .filter(note => note.refId == u.id && note.refType == "user")
                        .map((note, index) => (
                          <ListGroup.Item className="justify-content-between" as="li" action onClick={() => handleNestedRequestEdit(<Note initialData={note} userId={user.id} parentInfo={{"id": key}} refType={'user'} handledFinished={handleNestedRequestEdit} />)} key={index} variant="light">
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
                {(user.id == u.id || u.extRef == "") && 
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
        <Button trigger="click"
          type="default"
          icon={<AppstoreAddOutlined />}
          onClick={handleRequestNewUser}
        >{t('new')}</Button>
      </Tabs>     
    </Row>
    <SlideMenu component={component} handledFinished={handleNestedRequestEdit}/>
    </>
  );
};

export default FamilyTabs;
