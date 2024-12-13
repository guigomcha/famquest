import React, { useState } from 'react';
import Images from './Images';
import Audio from './Audio';
import Card from 'react-bootstrap/Card';
import { EditOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import SlideMenu from './SlideMenu';
import SpotForm from './SpotForm';
import { SpotFromForm } from '../backend_interface/components_helper';

const SpotPopup = ({ spot }) => {
  const [component, setComponent] = useState(null);
  const handleRequestEdit = (e) => {
    setComponent(<SpotForm initialData={spot} onSubmit={async (data) => SpotFromForm(data, e.target.data)} />); // Trigger show slideMenu
  }; 
  const handleNestedRequestEdit = (comp) => {
    setComponent(comp); // Trigger show slideMenu
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
            style={{
              insetInlineEnd: 24,
            }}
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
        <Images refId={spot.id} refType={'spot'} />
      </Card> 
    </Card>
    (component && <SlideMenu component={component}></SlideMenu> )
    </>   
  );
};

export default SpotPopup;
