import React, { useState, useEffect } from 'react';
import Images from './Images';
import Audio from './Audio';
import Card from 'react-bootstrap/Card';
import { EditOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import NoteForm from './NoteForm';
import { renderDescription } from '../utils/render_message';
import { getUserInfo } from '../backend_interface/db_manager_api';
import SlideMenu from './SlideMenu';

const Note = ({ initialData, userId, handledFinished }) => {
  const [component, setComponent] = useState(null);
  const [info, setInfo] = useState({ "userName": "unknown" });

  const handleRequestEdit = (e) => {
    setComponent(<NoteForm initialData={initialData} handledFinished={handleNestedRequestEdit} />);
  };
  
  const handleNestedRequestEdit = (comp) => {
    console.info("handleNested ", comp);
    if (comp == "done" || !comp) {
      setComponent(null);
      handledFinished("done");  
    } else {
      setComponent(comp); // Trigger show slideMenu
    }
  };

  // fetch the additional info for this note
  const fetchRelatedInfo = async (model) => {
    console.info("fetching info for ", model);
    if (!model){
      return;
    }
    const userInfo = await getUserInfo(model.refUserUploader);
    setInfo({
      "userName": userInfo?.name || "unknown"
    });
  };

  useEffect(() => {
    console.info("Showing note ", initialData);
    fetchRelatedInfo(initialData);
  }, [initialData, component]);

  return (
    <>
      <Card>
        <Card.Title>Note: {initialData.name}</Card.Title>
        <Card>
          <Card.Title>Global info</Card.Title>
          <Card.Body>
            <Card.Text>{renderDescription(initialData.description)}</Card.Text>
          </Card.Body>
          <Card.Footer>
            <Card.Text>Uploader: {info.userName}</Card.Text>
            {(userId == initialData.refUserUploader) &&
            (<Button trigger="click"
              type="default"
              icon={<EditOutlined />}
              onClick={handleRequestEdit}
              >Edit
            </Button>)}
          </Card.Footer>
        </Card>
        <Card>
          <Card.Title>Audios in the Note</Card.Title>
          <Audio refId={initialData.id} refType={'note'} handleMenuChange={handleNestedRequestEdit} />
        </Card>
        <Card>
          <Card.Title>Images in the Note</Card.Title>
          <Images refId={initialData.id} refType={'note'} handleMenuChange={handleNestedRequestEdit} />
        </Card>
      </Card>
      <SlideMenu component={component} handledFinished={handleNestedRequestEdit}/>
    </>
  );
};

export default Note;
