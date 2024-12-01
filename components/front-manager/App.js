import { View } from 'react-native';
import MapManager from './components/MapManager';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools';
import React, { useState } from "react";
import 'leaflet/dist/leaflet.css';
import UserInfo from './components/UserInfo';
import OAuth2 from './components/Oauth2';

const queryClient = new QueryClient()

const spots = {
  title: 'Spots',
  visible: 7,
  total: 10,
};

const tasks = {
  title: 'Tasks',
  visible: 3,
  total: 5,
  subtasks: {
    movies: { visible: 1, total: 2 },
    adulting: { visible: 1, total: 1 },
    technology: { visible: 1, total: 2 },
  },
};
const isLocal = true;
// require("dotenv").config({
//   path: `${__dirname}/../.env.${ENV}`,
// });

export default function App() { 
  const [user, setUser] = useState(null);

  const handleUserChange = (userInfo) => {
    setUser(userInfo); // Update parent state with user info
  };

  return (    
    <div style={{ width: "100%", height: "100%"}}>
      {(user || isLocal ) ? (
        <div style={{ width: "100%", height: "100%"}}>
        <UserInfo user={user} spots={spots} tasks={tasks} />
        <QueryClientProvider client={queryClient}>
        <View >
          <MapManager/>
        </View>
        <ReactQueryDevtools initialIsOpen={true} />
        </QueryClientProvider>
        </div>
      ) : (
        <OAuth2 onUserChange={handleUserChange} />
      ) }
    </div>
  );
}
