import React, { useState, useEffect } from 'react';
import Images from './Images';
import Audio from './Audio';
import Card from 'react-bootstrap/Card';
import { EditOutlined, AppstoreAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import NoteForm from './NoteForm';
import { renderDescription } from '../utils/render_message';
import { getUserInfo, deleteInDB } from '../backend_interface/db_manager_api';
import SlideMenu from './SlideMenu';
import { useTranslation } from "react-i18next";

const Note = ({ initialData, userId, handledFinished }) => {
  const { t, i18n } = useTranslation();
  const [component, setComponent] = useState(null);
  const [info, setInfo] = useState({ "name": "unknown" });
  const [reload, setReload] = useState(true);
     
  const handleRequestEdit = (e) => {
    setComponent(<NoteForm initialData={initialData} handledFinished={handleNestedRequestEdit} />);
  };
  
  const handleRequestDelete = async (e) => {
    const deleteResponse = await deleteInDB(initialData.id, 'note');
    console.info("delete response: ", deleteResponse);
    handledFinished("done");  
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

  // fetch the additional info for this note
  const fetchRelatedInfo = async (model) => {
    console.info("fetching info for ", model);
    if (!model){
      return;
    }
    const userInfo = await getUserInfo(model.refUserUploader);
    setInfo(userInfo);
  };

  useEffect(() => {
    console.info("Showing note ", initialData);
    fetchRelatedInfo(initialData);
  }, [initialData, component]);

  return (
    <>
      <Card>
        <Card.Header>id: {initialData.id}</Card.Header>
        <Card.Title>{t('note')}: {initialData.name}</Card.Title>
        <Card>
          <Card.Body>
            <Card.Text>{renderDescription(initialData.description)}</Card.Text>
          </Card.Body>
          <Card.Footer>
            <Card.Text>{t('owner')}: {info.name}</Card.Text>
            {(userId == initialData.refUserUploader) &&
              <>
                <Button trigger="click"
                  type="default"
                  icon={<EditOutlined />}
                  onClick={handleRequestEdit}
                  >{t('edit')}
                </Button>
                <Button trigger="click"
                  type="default"
                  icon={<DeleteOutlined />}
                  onClick={handleRequestDelete}
                  >{t('delete')}
                </Button>
              </>
            }
          </Card.Footer>
        </Card>
        <Card>
          <Card.Title>{t('audiosInNote')}</Card.Title>
          <Audio refId={initialData.id} refType={'note'} handleMenuChange={handleNestedRequestEdit} />
        </Card>
        <Card>
          <Card.Title>{t('imagesInNote')}</Card.Title>
          <Images refId={initialData.id} refType={'note'} handleMenuChange={handleNestedRequestEdit} />
        </Card>
      </Card>
      <SlideMenu component={component} handledFinished={handleNestedRequestEdit}/>
    </>
  );
};

export default Note;
