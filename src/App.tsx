import { AppProvider } from './context/AppContext';
import Navbar from './componentes/Navbar';
import Map from './componentes/Map';
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
