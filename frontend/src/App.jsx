import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './components/landingPage';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<Chatbot />} />
      </Routes>
    </Router>
  );
}

export default App;