import { View } from 'react-native';
import MapManager from './MapManager';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools';
import React, { useState } from "react";
import 'leaflet/dist/leaflet.css';
import UserInfo from './UserInfo';

const queryClient = new QueryClient()

export default function App() {  
  

  return (
    
    <div style={{ width: "100%", height: "100%"}}>
      <UserInfo totalSpots={10} visibleSpots={7} totalTasks={5} visibleTasks={3} />
      <QueryClientProvider client={queryClient}>
      <View >
        <MapManager/>
      </View>
      <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>  
    </div>
  );
}