import { View } from 'react-native';
import MapManager from './components/MapManager';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools';
import React, { useState } from "react";
import 'leaflet/dist/leaflet.css';
import UserInfo from './components/UserInfo';

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


export default function App() { 

  return (    
    <div style={{ width: "100%", height: "100%"}}>
      <UserInfo spots={spots} tasks={tasks} />
      <QueryClientProvider client={queryClient}>
      <View >
        <MapManager/>
      </View>
      <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>  
    </div>
  );
}
