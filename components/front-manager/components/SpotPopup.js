import Images from './Images';
import Audio from './Audio';
import Card from 'react-bootstrap/Card';

const SpotPopup = ({ spot }) => {

  return (
    <Card > 
      <Card.Title>Spot: {spot.name}</Card.Title> 
      <Card.Body>
        <Card.Text>{spot.description}</Card.Text>
          <Audio refId={spot.id} refType={'spot'}/>
        <Card>
          <Card.Text>Images in the Spot</Card.Text> 
          <Images refId={spot.id} refType={'spot'} />
        </Card> 
      </Card.Body>
    </Card>
  );
};

export default SpotPopup;
