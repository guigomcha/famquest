import React, { useState } from 'react';
import Images from './Images';
import Audio from './Audio';
import Card from 'react-bootstrap/Card';
import { EditOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import SpotForm from './SpotForm';
import { SpotFromForm } from '../backend_interface/components_helper';
import SlideMenu from './SlideMenu';

const SpotPopup = ({ spot }) => {
  const [component, setComponent] = useState(null);
  const handleRequestEdit = (e) => {
    setComponent(<SpotForm initialData={spot} onSubmit={async (data) => SpotFromForm(data, e.target.data)} handledFinished={handleNestedRequestEdit}/>); // Trigger show slideMenu
  }; 
  const handleNestedRequestEdit = (comp) => {
    if (comp == "done"){
      setComponent(null);  
    } else {
      setComponent(comp); // Trigger show slideMenu
    }
  }; 

  return (
    <>    
    <Card> 
      <Card.Title>Spot: {spot.name}</Card.Title> 
      <Card>
        <Card.Title>Global info</Card.Title> 
        <Card.Body>
          <Card.Text>{spot.description}</Card.Text>
          <Button trigger="click"
            type="default"
            icon={<EditOutlined />}
            onClick={handleRequestEdit}
            >Edit</Button>
    
        </Card.Body>
      </Card>
      <Card>
        <Card.Title>Audios in the Spot</Card.Title> 
        <Audio refId={spot.id} refType={'spot'} handleMenuChange={handleNestedRequestEdit}/> 
      </Card> 
      <Card>
        <Card.Title>Images in the Spot</Card.Title> 
        <Images refId={spot.id} refType={'spot'} handleMenuChange={handleNestedRequestEdit}/>
      </Card> 
    </Card>
    {component && <SlideMenu component={component} ></SlideMenu>}
    </>   
  );
};

export default SpotPopup;
