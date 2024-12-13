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
  const [component, setComponent] = useState(null); // main drawer
  const handleRequestEdit = (e) => {
    setComponent(<SpotForm initialData={spot} onSubmit={async (data) => SpotFromForm(data, e.target.data)} />); // Trigger show slideMenu
  }; 

  return (
    <>    
    <Card> 
      <Card.Title>Spot: {spot.name}</Card.Title> 
      <Card.Body>
        <Card.Text>{spot.description}</Card.Text>
        <Audio refId={spot.id} refType={'spot'}/>
        <Button trigger="click"
          type="default"
          style={{
            insetInlineEnd: 24,
          }}
          icon={<EditOutlined />}
          onClick={handleRequestEdit}
          >Edit</Button>
        <Card>
          <Card.Text>Images in the Spot</Card.Text> 
          <Images refId={spot.id} refType={'spot'} />
        </Card> 
      </Card.Body>
    </Card>
    (component && <SlideMenu component={component}></SlideMenu> )
    </>   
  );
};

export default SpotPopup;
