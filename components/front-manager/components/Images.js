import React, { useState, useRef, useEffect } from "react";
import Carousel from 'react-bootstrap/Carousel';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import { Button } from 'antd';
import { EditOutlined, FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { getInDBWithFilter, getUserInfo, deleteInDB } from '../functions/db_manager_api';
import { GlobalMessage } from '../functions/components_helper';
import {renderEmptyState} from '../functions/render_message';
import Audio from './Audio';
import ImagesForm from './ImagesForm';
import { useTranslation } from "react-i18next";
import { Spin, Alert } from 'antd';


const Images = ( {parentInfo, refType, handleMenuChange, user} ) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [info, setInfo] = useState({"name": "unknown"});
  const [reload, setReload] = useState(true);

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  const handledFinished = (msg) => {
    callFetchAttachmentsForSpot(parentInfo.id, refType);
    handleMenuChange(msg);
    setReload(!reload);
  };

  const handleRequestDelete = async (e) => {
    setIsLoading(true);
    const deleteResponse = await deleteInDB(selectedImages[activeIndex].id, 'attachment');
    console.info("delete response: ", deleteResponse);
    if (deleteResponse == "OK") {
      GlobalMessage(t("actionCompleted"), "info");
    } else {
      GlobalMessage(t("actionInvalid"), "warning");
    }
    setReload(!reload);
    setIsLoading(false);
  }; 

  const handleRequestNew = (e) => {
    handleMenuChange(<ImagesForm initialData={{"refId": parentInfo.id }} refType={refType} handledFinished={handledFinished}/>);
  }; 
  
  const handleRequestEdit = (e) => {
    handleMenuChange(<ImagesForm initialData={selectedImages[activeIndex]} refType={refType} handledFinished={handledFinished}/>); 
  }; 
 
  const callFetchAttachmentsForSpot = async (refId, refType) => {
    setSelectedImages([]); 
    const attachments = await getInDBWithFilter(refId, refType, 'attachment');
    console.info("Filling images for ", refId, attachments);
    let filteredAttachments = []
    attachments.forEach(attachment => {
      attachment.refId = parentInfo.id;
      if (attachment.contentType.startsWith("image/")) {
        filteredAttachments = [...filteredAttachments, attachment];
      }
    });
    setSelectedImages(filteredAttachments);
    fetchRelatedInfo(attachments[0]);
  };

  // fetch the additional info for this spot
  const fetchRelatedInfo = async (model) => {
    console.info("fetching info for ", model);
    if (!model){
      return;
    }
    const userInfo = await getUserInfo(model.refUserUploader);
    setInfo(userInfo);
  }

  // fetch the attachments for this spot
  useEffect(() => {
    callFetchAttachmentsForSpot(parentInfo.id, refType)
  }, [parentInfo, reload]);
  
  useEffect(() => {
    fetchRelatedInfo(selectedImages[activeIndex]);
  }, [activeIndex]);


  return (
    <>
      {(isLoading) &&<Spin>{t('loading')}</Spin>}
      <Card.Body>
        {selectedImages.length > 0 ? (
          <Container>
          <Carousel activeIndex={activeIndex} onSelect={handleSelect} slide={false} interval={null} data-bs-theme="dark" controls={true}> 
            {selectedImages.map((image, index) => (
              <Carousel.Item>
                <Card className="bg-dark text-black">
                  <Card.Header>id: {image.id}</Card.Header>
                  <Card.Img src={image.url} alt={`Attachment ${index + 1}`} className="center-block" />
                  <Card.Title>{image.datetime}: {image.name}</Card.Title>
                  <Card.Text>{image.description}</Card.Text>
                  <Card.Text>{t('owner')}: {info.name}</Card.Text>
                  <Card.Footer>
                    {user.id == info.id &&
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
              </Carousel.Item>
            ))}
          </Carousel>
          <Card>
            <Card.Title>{t('audiosInImage')}</Card.Title> 
            <Audio parentInfo={selectedImages[activeIndex]} refType={'attachment'} handleMenuChange={handleMenuChange}/> 
          </Card>
          </Container>
        ) : (
          renderEmptyState(t('empty'))
        )}
      </Card.Body>
      <Card.Footer>
          <Button trigger="click"
            type="default"
            icon={<FileAddOutlined />}
            onClick={handleRequestNew}
            >{t('new')}</Button>
        </Card.Footer>
      </>
  );
};
export default Images;
