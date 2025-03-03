import React, { useState, useEffect } from 'react';
import Images from './Images';
import Audio from './Audio';
import Card from 'react-bootstrap/Card';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import SpotForm from './SpotForm';
import { SpotFromForm } from '../backend_interface/components_helper';
import { renderDescription } from '../utils/render_message';
import { getUserInfo, deleteInDB } from '../backend_interface/db_manager_api';
import SlideMenu from './SlideMenu';
import { useTranslation } from "react-i18next";


const SpotPopup = ({ spot, handledFinished }) => {
  const { t, i18n } = useTranslation();
  const [component, setComponent] = useState(null);
  const [info, setInfo] = useState({ "name": "unknown" });

  const handleRequestEdit = (e) => {
    setComponent(<SpotForm initialData={spot} onSubmit={async (data) => SpotFromForm(data, e.target.data)} handledFinished={handleNestedRequestEdit} />);
  };

  const handleRequestDelete = async (e) => {
    const deleteResponse = await deleteInDB(spot.id, 'spot');
    console.info("delete response: ", deleteResponse);
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

  // fetch the additional info for this spot
  const fetchRelatedInfo = async (model) => {
    console.info("fetching info for ", model);
    if (!model){
      return;
    }
    const userInfo = await getUserInfo(model.refUserUploader);
    setInfo(userInfo);
  };

  useEffect(() => {
    fetchRelatedInfo(spot);
  }, [spot]);

  return (
    <>
      <Card>
        <Card.Header>id: {spot.id}</Card.Header>
        <Card.Title>{t('spot')}: {spot.name}</Card.Title>
        <Card>
          {/* <Card.Body>
            <Card.Text>discovered {JSON.stringify(spot.discovered)}</Card.Text>
          </Card.Body> */}
          <Card.Body>
            {/* Render description with line breaks */}
            <Card.Text>{renderDescription(spot.description)}</Card.Text>
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
            <Card.Text>{t('owner')}: {info.name}</Card.Text>
          </Card.Footer>
        </Card>
        <Card>
          <Card.Title>{t('audiosInSpot')}</Card.Title>
          <Audio refId={spot.id} refType={'spot'} handleMenuChange={handleNestedRequestEdit} />
        </Card>
        <Card>
          <Card.Title>{t('imagesInSpot')}</Card.Title>
          <Images refId={spot.id} refType={'spot'} handleMenuChange={handleNestedRequestEdit} />
        </Card>
      </Card>
      <SlideMenu component={component} handledFinished={handleNestedRequestEdit}/>
    </>
  );
};

export default SpotPopup;
