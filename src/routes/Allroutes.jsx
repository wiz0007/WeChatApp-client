import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ForgetPassword from "../features/forgetPassword/ForgetPassword";
import ResetPassword from "../features/resetPassword/ResetPassword";


const Allroutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* NEW ROUTES */}
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="/home" element={<Home />} />
    </Routes>
  );
};

export default Allroutes;
