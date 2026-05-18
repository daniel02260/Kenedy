import { AppProvider } from './context/AppContext';
import Navbar from '../Navar/Navbar';
import Map from './App/Mapakenedy/Map';
import Chatbot from './App/Chatbot/Chatbot';
import './index.css';

const App = () => {
  return (
    <AppProvider>
      <div className="app-container">
        <Navbar />
        <Map />
        <Chatbot />
      </div>
    </AppProvider>
  );
};

export default App;
