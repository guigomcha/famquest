import { View } from 'react-native';
import MapContainer from './MapContainer';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools';

const queryClient = new QueryClient()
export default function App() {  
  return (
    <div style={{ width: "100%", height: "100%"}}>
      <QueryClientProvider client={queryClient}>
      <View >
        <MapContainer />
      </View>
      <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>  
    </div>
  );
}