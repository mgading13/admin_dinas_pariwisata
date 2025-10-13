import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "../src/Pages/Component/Atraksi/Dashboard";
import DashboardPaketWisata from "../src/Pages/Component/PaketWisata/Dashboard";


function App() {
  return (
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />
        <Route path="/admin/atraksi" element={<Dashboard />} />
        <Route path="/admin/paket-wisata" element={<DashboardPaketWisata />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
