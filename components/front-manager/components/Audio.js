import React, { useState, useRef, useEffect } from "react";
import { getInDBWithFilter, getUserInfo } from '../backend_interface/db_manager_api';
import {renderEmptyState} from '../utils/render_message';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';
import { Button } from 'antd';
import { EditOutlined, AudioOutlined } from '@ant-design/icons';
import AudioForm from './AudioForm';
import { useTranslation } from "react-i18next";

const Audio = ({ refId, refType, handleMenuChange }) => {
  const { t, i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAudios, setSelectedAudios] = useState([]);
  const [info, setInfo] = useState({"name": "unknown"});

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  const handledFinished = (msg) => {
    callFetchAttachmentsForSpot(refId, refType);
    handleMenuChange(msg);
  };


  const handleRequestNew = (e) => {
    handleMenuChange(<AudioForm refId={refId} refType={refType} handledFinished={handledFinished}/>);
  }; 
  
  const handleRequestEdit = (e) => {
    handleMenuChange(<AudioForm initialData={selectedAudios[activeIndex]} refId={refId} refType={refType} handledFinished={handledFinished}/>); 
  }; 

  const callFetchAttachmentsForSpot = async (refId, refType) => {
    setSelectedAudios([]); 
    const attachments = await getInDBWithFilter(refId, refType, 'attachment');

    attachments.forEach(attachment => {
      if (attachment.contentType.startsWith("audio/")) {
        setSelectedAudios((prevImages) => [...prevImages, attachment]);
      }
    });
    fetchRelatedInfo(attachments[0]);
  };

  // fetch the attachments for this spot
  useEffect(() => {
    callFetchAttachmentsForSpot(refId, refType)
  }, [refId]);

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
        <Card.Body>
          {selectedAudios.length > 0 ? (
              <Carousel activeIndex={activeIndex} onSelect={handleSelect} slide={false} interval={null} data-bs-theme="dark" controls={true}> 
              {selectedAudios.map((audio, index) => (
                <Carousel.Item>
                  <Card className="bg-dark text-white">
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

          {selectedAudios.length > 0 && <Button trigger="click"
            type="default"
            icon={<EditOutlined />}
            onClick={handleRequestEdit}
            >{t('edit')}</Button>}
        </Card.Footer>
      </>
  );
};

export default Audio;
