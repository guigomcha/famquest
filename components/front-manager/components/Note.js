import React, { useState, useEffect } from 'react';
import Images from './Images';
import Audio from './Audio';
import Card from 'react-bootstrap/Card';
import { EditOutlined, AppstoreAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import NoteForm from './NoteForm';
import { renderDescription } from '../utils/render_message';
import { getUserInfo, deleteInDB } from '../backend_interface/db_manager_api';
import { GlobalMessage } from '../backend_interface/components_helper';
import SlideMenu from './SlideMenu';
import { useTranslation } from "react-i18next";
import { Spin, Alert } from 'antd';

const Note = ({ initialData, userId, parentInfo, refType, handledFinished }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const [component, setComponent] = useState(null);
  const [info, setInfo] = useState({ "name": "unknown" });
  const [reload, setReload] = useState(true);
     
  const handleRequestEdit = (e) => {
    setComponent(<NoteForm initialData={initialData} parentInfo={parentInfo} refType={refType} handledFinished={handleNestedRequestEdit} />);
  };
  
  const handleRequestDelete = async (e) => {
    setIsLoading(true);
    const deleteResponse = await deleteInDB(initialData.id, 'note');
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
      handledFinished("done");
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
  }, [initialData, component, reload]);

  return (
    <>
      {(isLoading) &&<Spin>{t('loading')}</Spin>}
      <Card>
        <Card.Header>id: {initialData.id}</Card.Header>
        <Card.Title>{t('note')}: {initialData.name}</Card.Title>
        <Card.Subtitle>{initialData.datetime}</Card.Subtitle>
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
          <Audio parentInfo={initialData} refType={'note'} handleMenuChange={handleNestedRequestEdit} />
        </Card>
        <Card>
          <Card.Title>{t('imagesInNote')}</Card.Title>
          <Images parentInfo={initialData} refType={'note'} handleMenuChange={handleNestedRequestEdit} />
        </Card>
      </Card>
      <SlideMenu component={component} handledFinished={handleNestedRequestEdit}/>
    </>
  );
};

export default Note;
