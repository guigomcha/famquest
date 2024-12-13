import React, { useState, useRef, useEffect } from "react";
import Carousel from 'react-bootstrap/Carousel';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import { Button } from 'antd';
import { EditOutlined, FileAddOutlined } from '@ant-design/icons';
import { fetchAttachments } from '../backend_interface/db_manager_api';
import {renderEmptyState} from '../utils/render_message';
import Audio from './Audio';
import ImagesForm from './ImagesForm';

const Images = ( {refId, refType, handleMenuChange} ) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  const handleRequestNew = (e) => {
    handleMenuChange(<ImagesForm refId={refId} refType={refType} />);
  }; 
  
  const handleRequestEdit = (e) => {
    handleMenuChange(<ImagesForm initialData={selectedImages[activeIndex]} refId={refId} refType={refType} />); 
  }; 
 
  const callFetchAttachmentsForSpot = async (refId, refType) => {
    setSelectedImages([]); 
    const attachments = await fetchAttachments(refId, refType);

    attachments.forEach(attachment => {
      if (attachment.contentType.startsWith("image/")) {
        setSelectedImages((prevImages) => [...prevImages, attachment]);
      }
    });
  };

  // fetch the attachments for this spot
  useEffect(() => {
    callFetchAttachmentsForSpot(refId, refType)
  }, [refId]);

  
  return (
    <>
      <Card.Body>
        {selectedImages.length > 0 ? (
          <Container>
          <Carousel activeIndex={activeIndex} onSelect={handleSelect} slide={false} interval={null} data-bs-theme="dark" controls={true}> 
            {selectedImages.map((image, index) => (
              <Carousel.Item>
                <Card className="bg-dark text-black">
                  <Card.Img src={image.url} alt={`Attachment ${index + 1}`} className="center-block" />
                  <Card.Title>{image.name}</Card.Title>
                  <Card.Text>{image.description}</Card.Text>
                </Card>
              </Carousel.Item>
            ))}
          </Carousel>
          <Card>
            <Card.Title>Audios in the image</Card.Title> 
            <Audio refId={selectedImages[activeIndex].id} refType={'attachment'} handleMenuChange={handleMenuChange}/> 
          </Card>
          </Container>
        ) : (
          renderEmptyState("Create new to see it")
        )}
      </Card.Body>
      <Card.Footer>
          <Button trigger="click"
            type="default"
            icon={<FileAddOutlined />}
            onClick={handleRequestNew}
            >New</Button>

          {selectedImages.length > 0 && <Button trigger="click"
            type="default"
            icon={<EditOutlined />}
            onClick={handleRequestEdit}
            >Edit</Button>}
        </Card.Footer>
      </>

  );
};
export default Images;
