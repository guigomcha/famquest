import React, { useState, useEffect, useRef } from 'react';
import Images from './Images';
import Audio from './Audio';
import Card from 'react-bootstrap/Card';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import SpotForm from './SpotForm';
import { SpotFromForm } from '../backend_interface/components_helper';
import { renderDescription } from '../utils/render_message';
import { getUserInfo, deleteInDB, fetchAndPrepareSpots } from '../backend_interface/db_manager_api';
import SlideMenu from './SlideMenu';
import { useTranslation } from "react-i18next";
import { Spin, Alert } from 'antd';

const SpotPopup = ({ location, handledFinished }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [component, setComponent] = useState(null);
  const [info, setInfo] = useState({ "name": "unknown" });
  const [spotInfo, setSpotInfo] = useState({ "id": location.refId });
  const [reload, setReload] = useState(true);
  
  const handleRequestEdit = (e) => {
    setComponent(<SpotForm initialData={spotInfo} handledFinished={handleNestedRequestEdit} />);
  };

  const handleRequestDelete = async (e) => {
    const deleteResponse = await deleteInDB(spotInfo.id, 'spot');
    console.info("delete response: ", deleteResponse);
    setComponent(null);
    handledFinished("done");
  }; 

  const handleNestedRequestEdit = async (comp) => {
    console.info("handleNested ", comp);
    if (comp == "done" || !comp) {
      const resp = await fetchRelatedInfo(spotInfo);
      console.info("response from fetch", resp);
      setComponent(null);
      setReload(!reload);
    } else {
      console.info("should be to open the slide with a form ");
      setComponent(comp); // Trigger show slideMenu
    }
  };

  // fetch the additional info for this spot
  const fetchRelatedInfo = async (model) => {
    setIsLoading(true);
    let tempSpot = await fetchAndPrepareSpots(model.refId);
    console.info("Fetched initial spots ", tempSpot);
    tempSpot.location = location;
    setSpotInfo(tempSpot);
    console.info("fetching info for ", tempSpot);
    if (!tempSpot){
      setIsLoading(false);
      return;
    }
    const userInfo = await getUserInfo(tempSpot.refUserUploader);
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
            {/* Render description with line breaks */}
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
            <Card.Text>{t('owner')}: {info.name}</Card.Text>
          </Card.Footer>
        </Card>
        <Card>
          <Card.Title>{t('audiosInSpot')}</Card.Title>
          <Audio refId={location.refId} refType={'spot'} handleMenuChange={handleNestedRequestEdit} />
        </Card>
        <Card>
          <Card.Title>{t('imagesInSpot')}</Card.Title>
          <Images refId={location.refId} refType={'spot'} handleMenuChange={handleNestedRequestEdit} />
        </Card>
      </Card>
      <SlideMenu component={component} handledFinished={handleNestedRequestEdit}/>
    </>
  );
};

export default SpotPopup;
