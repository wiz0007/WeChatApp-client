import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import LoginPage from "../pages/Login/LoginPage";

const Allroutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default Allroutes;