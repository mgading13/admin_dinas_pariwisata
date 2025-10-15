import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "../src/Pages/Component/Atraksi/Dashboard";
import DashboardPaketWisata from "../src/Pages/Component/PaketWisata/Dashboard";
import ProtectedRoute from "./Pages/Component/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />
        <Route
          path="/admin/atraksi"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/paket-wisata"
          element={
            <ProtectedRoute>
              <DashboardPaketWisata />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
