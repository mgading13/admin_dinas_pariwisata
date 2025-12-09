import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import DashboardAtraksi from "../src/Pages/Component/Atraksi/Dashboard";
import DashboardDesaWisata from "../src/Pages/Component/DesaWisata/Dashboard";
import DashboardPaketWisata from "../src/Pages/Component/PaketWisata/Dashboard";
import DashboardKuliner from "../src/Pages/Component/Kuliner/Dashboard";
import DashboardRumahMakan from "../src/Pages/Component/RumahMakan/Dashboard";
import DashboardHotel from "../src/Pages/Component/Hotel/Dashboard";
import ProtectedRoute from "./Pages/Component/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin/desa-wisata"
          element={
            <ProtectedRoute>
              <DashboardDesaWisata />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/atraksi"
          element={
            <ProtectedRoute>
              <DashboardAtraksi />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/register" element={<Register />} />

        <Route
          path="/admin/paket-wisata"
          element={
            <ProtectedRoute>
              <DashboardPaketWisata />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kuliner"
          element={
            <ProtectedRoute>
              <DashboardKuliner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rumah-makan"
          element={
            <ProtectedRoute>
              <DashboardRumahMakan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hotel"
          element={
            <ProtectedRoute>
              <DashboardHotel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
