import React from "react";
import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import BottomSheetInstall from "./components/BottomSheetInstall";
import "./index.css";
import MqttDashboard from "./pages/MqttDashboard";
const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<MqttDashboard />} />
          <Route path="/dashboard" element={<MqttDashboard />} />
        </Routes>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
      <BottomSheetInstall />
    </Router>
  );
};

export default App;
