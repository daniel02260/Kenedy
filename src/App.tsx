import { AppProvider } from './context/AppContext';
import Navbar from '../Navar/Navbar';
import Map from './App/Mapakenedy/Map';
import './index.css';

const App = () => {
  return (
    <AppProvider>
      <div className="app-container">
        <Navbar />
        <Map />
      </div>
    </AppProvider>
  );
};

export default App;
