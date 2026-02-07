import { BrowserRouter, Routes, Route } from "react-router-dom";
import Guests from "./pages/Guests";
import AddGuest from "./pages/AddGuest";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/guests" element={<Guests />} />
        <Route path="/add-guest" element={<AddGuest />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
