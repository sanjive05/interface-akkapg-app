import { BrowserRouter, Routes, Route } from "react-router-dom";
import Guests from "./pages/Guests";
import AddGuest from "./pages/AddGuest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/guests" element={<Guests />} />
        <Route path="/add-guest" element={<AddGuest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
