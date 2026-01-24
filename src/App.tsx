import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Scan from "./pages/Scan";
import Request from "./pages/Request";
import History from "./pages/History";
import AnalyticsPage from "./pages/Analytics";
import EditProfile from './pages/EditProfile'; 

import Rewards from "./pages/Rewards";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/request" element={<Request />} />
        <Route path="/history" element={<History />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/EditProfile" element={<EditProfile />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;
