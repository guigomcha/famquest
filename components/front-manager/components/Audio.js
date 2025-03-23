import React, { useState, useRef, useEffect } from "react";
import { getInDBWithFilter, getUserInfo, deleteInDB } from '../backend_interface/db_manager_api';
import {renderEmptyState} from '../utils/render_message';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';
import { Button } from 'antd';
import { EditOutlined, AudioOutlined, DeleteOutlined } from '@ant-design/icons';
import AudioForm from './AudioForm';
import { useTranslation } from "react-i18next";
import { GlobalMessage } from "../backend_interface/components_helper";
import { Spin, Alert } from 'antd';

const Audio = ({ parentInfo, refType, handleMenuChange }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reload, setReload] = useState(true);
  const [selectedAudios, setSelectedAudios] = useState([]);
  const [info, setInfo] = useState({"name": "unknown"});

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  const handledFinished = (msg) => {
    callFetchAttachmentsForSpot(parentInfo.refId, refType);
    handleMenuChange(msg);
    setReload(!reload);
  };

  const handleRequestNew = (e) => {
    handleMenuChange(<AudioForm initialData={{"refId": parentInfo.id}} refType={refType} handledFinished={handledFinished}/>);
  }; 
  
  const handleRequestEdit = (e) => {
    handleMenuChange(<AudioForm initialData={selectedAudios[activeIndex]} refType={refType} handledFinished={handledFinished}/>); 
  }; 

  const handleRequestDelete = async (e) => {
    setIsLoading(true);
    const deleteResponse = await deleteInDB(selectedAudios[activeIndex].id, 'attachment');
    console.info("delete response: ", deleteResponse);
    if (deleteResponse == "OK") {
      GlobalMessage(t("actionCompleted"), "info");
    } else {
      GlobalMessage(t("actionInvalid"), "warning");
    }
    setIsLoading(false);
    setReload(!reload);
  }; 

  const callFetchAttachmentsForSpot = async (refId, refType) => {
    setSelectedAudios([]);
     
    const attachments = await getInDBWithFilter(refId, refType, 'attachment');
    console.info("Filling audios for ", refId, attachments);
    attachments.forEach(attachment => {
      attachment.refId = parentInfo.id;
      if (attachment.contentType.startsWith("audio/")) {
        setSelectedAudios([...selectedAudios, attachment]);
      }
    });
    fetchRelatedInfo(attachments[0]);
  };

  // fetch the attachments for this spot
  useEffect(() => {
    callFetchAttachmentsForSpot(parentInfo.id, refType)
  }, [parentInfo, reload]);

  // fetch the additional info for this audio
  const fetchRelatedInfo = async (model) => {
    console.info("fetching info for ", model);
    if (!model){
      return;
    }
    const userInfo = await getUserInfo(model.refUserUploader);
    setInfo(userInfo); 
  }

  useEffect(() => {
    fetchRelatedInfo(selectedAudios[activeIndex]);
  }, [activeIndex]);

  return (
      <>
        {(isLoading) &&<Spin>{t('loading')}</Spin>}
        <Card.Body>
          {selectedAudios.length > 0 ? (
              <Carousel activeIndex={activeIndex} onSelect={handleSelect} slide={false} interval={null} data-bs-theme="dark" controls={true}> 
              {selectedAudios.map((audio, index) => (
                <Carousel.Item>
                  <Card className="bg-dark text-white">
                    <Card.Header>id: {audio.id}</Card.Header>
                    <Card.Body style={{
                            justifyContent: "center",
                            alignItems: "center",
                            margin: "auto",
                        }}>
                        <audio controls src={audio.url} style={{width: "200px", height: "50px"}}></audio>
                    </Card.Body>
                    <Card.Footer>
                        <Card.Title>{audio.name}</Card.Title>
                        <Card.Text>{audio.description}</Card.Text>
                        <Card.Text>{t('signedAs')}: {info.name}</Card.Text>
                    </Card.Footer>
                  </Card>
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            renderEmptyState(t('empty'))
          )}
        </Card.Body>
        <Card.Footer>
          <Button trigger="click"
            type="default"
            icon={<AudioOutlined />}
            onClick={handleRequestNew}
            >{t('new')}</Button>

          {selectedAudios.length > 0 && 
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
          </>}
        </Card.Footer>
      </>
  );
};

export default Audio;
