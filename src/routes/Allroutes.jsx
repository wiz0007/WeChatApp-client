import { Routes, Route } from "react-router-dom";
import Homepage from "../pages/Home/Homepage";
import LoginPage from "../pages/Login/LoginPage";

const Allroutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<Homepage />} />
    </Routes>
  );
}

export default Allroutes;