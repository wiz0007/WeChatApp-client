import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaUser, FaIdCard } from "react-icons/fa";
import styles from "./Login.module.scss";

const LoginPage = () => {
  const [mode, setMode] = useState("login"); // login | register
  const [step, setStep] = useState(1); // 1 = input email, 2 = verify OTP
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) otpRefs[index + 1].current.focus();
    if (!value && index > 0) otpRefs[index - 1].current.focus();
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      alert("Please enter a valid email address!");
      return;
    }

    try {
      setIsSending(true);
      const res = await fetch("https://wechat-server-sorq.onrender.com/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mode }), // 👈 added mode
      });

      const data = await res.json();
      setIsSending(false);

      if (data.success) {
        alert(`OTP sent to ${email}`);
        setStep(2);
      } else {
        alert(data.message || "Error sending OTP");
      }
    } catch (err) {
      setIsSending(false);
      alert("Server error! Please try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    const response = await fetch("https://wechat-server-sorq.onrender.com/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email, // replace phone with email
        otp: enteredOtp,
        ...(mode === "register" ? { name, username } : {}),
      }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("wechatUser", JSON.stringify(data.user));
      localStorage.setItem("wechatToken", data.token);
      navigate("/home");
    } else {
      alert(data.message || "Verification failed");
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <motion.section
        className={styles.loginCard}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Left Panel */}
        <motion.div
          className={styles.leftPanel}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <h2 className={styles.title}>
            {mode === "login" ? "Welcome Back" : "Join"} <span>WeChat</span>
          </h2>
          <p className={styles.subtitle}>
            {mode === "login"
              ? step === 1
                ? "Enter your email to log in"
                : "Enter the OTP we sent to your email"
              : step === 1
              ? "Fill in your details to register"
              : "Enter the OTP sent to your email"}
          </p>

          {/* Step 1 - Input */}
          {step === 1 && (
            <form className={styles.form} onSubmit={handleSendOtp}>
              {mode === "register" && (
                <>
                  <div className={styles.inputGroup}>
                    <FaIdCard className={styles.icon} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <FaUser className={styles.icon} />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className={styles.inputGroup}>
                <FaEnvelope className={styles.icon} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSending}
                className={styles.button}
              >
                {isSending ? "Sending..." : "Send OTP"}
              </motion.button>
            </form>
          )}

          {/* Step 2 - OTP */}
          {step === 2 && (
            <form className={styles.form} onSubmit={handleVerifyOtp}>
              <div className={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        otpRefs[index - 1].current.focus();
                      }
                    }}
                    className={styles.otpBox}
                    required
                  />
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className={styles.button}
              >
                Verify OTP
              </motion.button>
              <p className={styles.resend} onClick={() => setStep(1)}>
                Change Email / Resend OTP
              </p>
            </form>
          )}

          <p className={styles.switchMode}>
            {mode === "login" ? "New user?" : "Already have an account?"}{" "}
            <span
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setStep(1);
                setName("");
                setUsername("");
                setEmail("");
                setOtp(["", "", "", ""]);
              }}
            >
              {mode === "login" ? "Register here" : "Login here"}
            </span>
          </p>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          className={styles.rightPanel}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className={styles.phoneMockup}>
            <div className={`${styles.chatBubble} ${styles.incoming}`}>
              Hey, are you online?
            </div>
            <div className={`${styles.chatBubble} ${styles.outgoing}`}>
              Yup! Just testing the new WeChat 😊
            </div>
            <div className={styles.typing}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default LoginPage;
