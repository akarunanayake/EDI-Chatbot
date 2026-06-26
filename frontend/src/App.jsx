import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import LandingPage from './components/landingPage';
import Chatbot from './components/Chatbot';
import { apiPath } from "./api/client";

function ViewFileRedirect() {
  const location = useLocation();

  useEffect(() => {
    window.location.replace(apiPath(`/viewFile${location.search}`));
  }, [location.search]);

  return null;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/viewFile" element={<ViewFileRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;