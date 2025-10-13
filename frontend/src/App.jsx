import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";


function App() {
  return (
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />
        <Route path="/admin/atraksi" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
