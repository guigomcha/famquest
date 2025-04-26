import React, { useState, useEffect, useRef } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import { EditOutlined, DeleteOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import SpotForm from './SpotForm';
import NoteForm from './NoteForm';
import { GlobalMessage, SpotFromForm } from '../functions/components_helper';
import { renderDescription, renderEmptyState } from '../functions/render_message';
import { getUserInfo, deleteInDB, fetchAndPrepareSpots, getInDB } from '../functions/db_manager_api';
import SlideMenu from './SlideMenu';
import { useTranslation } from "react-i18next";
import { Spin, Alert } from 'antd';
import Note from './Note';

const SpotPopup = ({ location, handledFinished, user }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [component, setComponent] = useState(null);
  const [info, setInfo] = useState({ "name": "unknown" });
  const [spotInfo, setSpotInfo] = useState({ "id": location.refId });
  const [reload, setReload] = useState(true);
  const [notes, setNotes] = useState([]);
  
  const handleRequestEdit = (e) => {
    setComponent(<SpotForm initialData={spotInfo} handledFinished={handleNestedRequestEdit} />);
  };

  const handleRequestNewNote = (e) => {
    setComponent(<NoteForm handledFinished={handleNestedRequestEdit} userId={info.id} parentInfo={spotInfo} refType={'spot'}/>);
  }; 

  const handleRequestDelete = async (e) => {
    setIsLoading(true);
    const deleteResponse = await deleteInDB(spotInfo.id, 'spot');
    console.info("delete response: ", deleteResponse);
    if (deleteResponse == "OK") {
      GlobalMessage(t("actionCompleted"), "info");
      handledFinished({"msg": "done", "id": spotInfo.id});
      setComponent(null);
    } else {
      GlobalMessage(t("actionInvalid"), "warning");
    }
    setIsLoading(false);
  }; 

  const handleNestedRequestEdit = async (comp) => {
    console.info("handleNested ", comp);
    if (comp == "done" || !comp) {
      const resp = await fetchRelatedInfo(spotInfo);
      console.info("response from fetch", resp);
      setComponent(null);
      setReload(!reload);
    } else {
      console.info("should open the secondary slide ");
      setComponent(comp); // Trigger show slideMenu
    }
  };

  // fetch the additional info for this spot
  const fetchRelatedInfo = async (model) => {
    setIsLoading(true);
    let tempSpot = await fetchAndPrepareSpots(model.refId, user);
    console.info("Fetched initial spots ", tempSpot);
    tempSpot.location = location;
    setSpotInfo(tempSpot);
    console.info("fetching info for ", tempSpot);
    if (!tempSpot){
      setIsLoading(false);
      return;
    }
    let tempNotes = await getInDB('note', 0, `?refId=${tempSpot.id}&refType=spot`);
    const updatedNotes = await Promise.all(
      tempNotes.map(async (note) => {
        const userInfo = await getUserInfo(note.refUserUploader);
        return { ...note, "userInfo": userInfo };
      })
    );
    setNotes(updatedNotes);
    console.info("obtained tempNotes ", updatedNotes);
    const userInfo = await getUserInfo(tempSpot.refUserUploader);
    console.info("obtained userInfo ", userInfo);
    setInfo(userInfo);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRelatedInfo(location);
  }, [component, reload]);

  return (
    <>    
      {(isLoading) &&<Spin>{t('loading')}</Spin>}
      <Card>
        <Card.Header>id: {spotInfo.id}</Card.Header>
        <Card.Title>{t('spot')}: {spotInfo.name}</Card.Title>
        <Card>
          {/* <Card.Body>
            <Card.Text>discovered {JSON.stringify(spotInfo.discovered)}</Card.Text>
            </Card.Body> */}
          <Card.Body>
            {!spotInfo.id && <Card.Text>{t('invalidSpot')}{JSON.stringify(location)}</Card.Text>}
            <Card.Text>{renderDescription(spotInfo.description)}</Card.Text>
          </Card.Body>
          <Card.Footer>
            <Button
              trigger="click"
              type="default"
              icon={<EditOutlined />}
              onClick={handleRequestEdit}
            >
              {t('edit')}
            </Button>
            <Button trigger="click"
              type="default"
              icon={<DeleteOutlined />}
              onClick={handleRequestDelete}
              >{t('delete')}
            </Button>
            {/* <Card.Text>{t('owner')}: {info.name}</Card.Text> */}
          </Card.Footer>
          </Card>
          <Card>
            <Card.Title>{t('notesInSpot')}</Card.Title>
              {notes.length > 0 ? ( 
              <ListGroup as="ol" numbered>
                {notes
                  .map((note, index) => (
                    <ListGroup.Item  as="li" action onClick={() => handleNestedRequestEdit(<Note initialData={note} user={user} parentInfo={spotInfo} refType={'spot'} handledFinished={handleNestedRequestEdit} />)} key={index} variant="light">
                      {note.name}
                      <Badge bg="primary" pill>
                      {t('category')}: {note.category}
                      </Badge>
                      <Badge bg="info" pill>
                      {t('owner')}: {note.userInfo.name}
                      </Badge>
                      <Badge bg="secondary" pill>
                      {t('datetimeRef')}: {note.datetime}
                      </Badge>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
              ) : (                  
                renderEmptyState(t('empty'))
              )}
              <Card.Footer> 
                  <Button trigger="click"
                    type="default"
                    icon={<AppstoreAddOutlined />}
                    onClick={handleRequestNewNote}
                    >{t('new')}
                  </Button>
              </Card.Footer>
          </Card>
      </Card>
      <SlideMenu component={component} handledFinished={handleNestedRequestEdit}/>
    </>
  );
};

export default SpotPopup;
