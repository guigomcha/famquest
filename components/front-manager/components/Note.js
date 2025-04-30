import React, { useState, useEffect } from 'react';
import Images from './Images';
import Audio from './Audio';
import Card from 'react-bootstrap/Card';
import { EditOutlined, AppstoreAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import NoteForm from './NoteForm';
import { renderDescription } from '../functions/render_message';
import { getUserInfo, deleteInDB, getInDB } from '../functions/db_manager_api';
import { GlobalMessage } from '../functions/components_helper';
import SlideMenu from './SlideMenu';
import { useTranslation } from "react-i18next";
import { Spin, Alert } from 'antd';

const Note = ({ initialData, user, parentInfo, refType, handledFinished }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const [component, setComponent] = useState(null);
  const [info, setInfo] = useState({ "name": "unknown" });
  const [reload, setReload] = useState(true);
  const [content, setContent] = useState(initialData);
     
  const handleRequestEdit = (e) => {
    setComponent(<NoteForm initialData={content} parentInfo={parentInfo} refType={refType} handledFinished={handleNestedRequestEdit} />);
  };
  
  const handleRequestDelete = async (e) => {
    setIsLoading(true);
    const deleteResponse = await deleteInDB(content.id, 'note');
    console.info("delete response: ", deleteResponse);
    if (deleteResponse == "OK") {
      GlobalMessage(t("actionCompleted"), "info");
    } else {
      GlobalMessage(t("actionInvalid"), "warning");
    }
    handledFinished("done");
    setReload(!reload);
    setIsLoading(false);
  }; 

  const handleNestedRequestEdit = (comp) => {
    console.info("handleNested ", comp);
    if (comp == "done" || !comp) {
      setComponent(null);
      if (refType == "user"){
        handledFinished("done");
      }
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
    const tempContent = await getInDB("note", content.id);
    setContent(tempContent);
  };

  useEffect(() => {
    console.info("Showing note ", content);
    console.info("Showing note from user ", user);
    fetchRelatedInfo(content);
  }, [component, reload]);

  return (
    <>
      {(isLoading) &&<Spin>{t('loading')}</Spin>}
      <Card>
        <Card.Header>id: {content.id}</Card.Header>
        <Card.Title>{t('note')}: {content.name}</Card.Title>
        <Card.Subtitle>{t('datetimeRef')}: {content.datetime}</Card.Subtitle>
        <Card>
          <Card.Body>
            <Card.Text>{renderDescription(content.description)}</Card.Text>
          </Card.Body>
          <Card.Footer>
            <Card.Text>{t('owner')}: {info.name}</Card.Text>
            {(user.id == content.refUserUploader) &&
              <>
                <Button trigger="click"
                  color="primary" 
                  variant="outlined"
                  icon={<EditOutlined />}
                  onClick={handleRequestEdit}
                  >{t('edit')}
                </Button>
                <Button trigger="click"
                  color="danger" 
                  variant="outlined"
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
          <Audio parentInfo={content} refType={'note'} handleMenuChange={handleNestedRequestEdit} user={user}/>
        </Card>
        <Card>
          <Card.Title>{t('imagesInNote')}</Card.Title>
          <Images parentInfo={content} refType={'note'} handleMenuChange={handleNestedRequestEdit} user={user}/>
        </Card>
      </Card>
      <SlideMenu component={component} handledFinished={handleNestedRequestEdit}/>
    </>
  );
};

export default Note;
