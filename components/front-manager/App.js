import { View } from 'react-native';
import MapManager from './MapManager';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools';
import React, { useState } from "react";
import { fetchCoordinates, fetchAndPrepareSpots } from "./db_manager_api";

const queryClient = new QueryClient()

export default function App() {  
  

  return (
    <div style={{ width: "100%", height: "100%"}}>
      <QueryClientProvider client={queryClient}>
      <View >
        <MapManager/>
      </View>
      <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>  
    </div>
  );
}