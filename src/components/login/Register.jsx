import React, { useState, useRef } from "react";
import styles from "./Register.module.scss";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const Register = () => {
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function onInputChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      await axios.post(`${API}/api/auth/register`, form);
      toast.success("OTP sent to email");
      setStep("otp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return toast.error("Enter complete OTP");

    try {
      setLoading(true);
      await axios.post(`${API}/api/auth/verify-otp`, {
        email: form.email,
        otp: code,
      });
      toast.success("Account verified!");
      setTimeout(() => (window.location.href = "/"), 1500);
    } catch (err) {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await axios.post(`${API}/api/auth/resend-otp`, { email: form.email });
      toast.success("OTP resent");
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    if (value && index < 5) otpRefs.current[index + 1].focus();
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-center" />
      <motion.div
        className={styles.card}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        {/* FORM */}
        {step === "form" && (
          <form className={styles.form} onSubmit={handleRegister}>
            <h1>Create Account</h1>

            <div className={styles.inputGroup}>
              <User />
              <input
                name="name"
                placeholder="Full Name"
                required
                onChange={onInputChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <User />
              <input
                name="username"
                placeholder="Username"
                required
                onChange={onInputChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <Mail />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                onChange={onInputChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <Lock />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Set Password"
                required
                onChange={onInputChange}
              />
              <span onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff /> : <Eye />}
              </span>
            </div>

            <div className={styles.inputGroup}>
              <Lock />
              <input
                type={showCPass ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                onChange={onInputChange}
              />
              <span onClick={() => setShowCPass(!showCPass)}>
                {showCPass ? <EyeOff /> : <Eye />}
              </span>
            </div>

            <button className={styles.primaryBtn} disabled={loading}>
              {loading ? "Processing..." : "Register"}
            </button>

            <div className={styles.or}>OR</div>

            <button
              type="button"
              className={styles.googleBtn}
              onClick={() => (window.location.href = `${API}/auth/google-login`)}
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" />
              Continue with Google
            </button>

            <p className={styles.switch}>
              Already have an account? <a href="/">Login</a>
            </p>
          </form>
        )}

        {/* OTP */}
        {step === "otp" && (
          <div className={styles.otpSection}>
            <div className={styles.otpHeader}>Verify Email</div>
            <p>Enter the 6-digit OTP sent to your email</p>

            <div className={styles.otpInputRow}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  maxLength={1}
                  ref={(el) => (otpRefs.current[index] = el)}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                />
              ))}
            </div>

            <button className={styles.primaryBtn} onClick={verifyOtp}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button className={styles.resendBtn} onClick={resendOtp}>
              Resend OTP
            </button>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className={styles.successBox}>
            <div className={styles.successAnim}>✔</div>
            <h2>Account Verified!</h2>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Register;
