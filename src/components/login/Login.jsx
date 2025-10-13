import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaUser, FaPhone } from "react-icons/fa";
import styles from "./Login.module.scss";

const Login = () => {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === "login") {
      if (!username.trim() && !phone.trim()) {
        alert("Please enter username or phone number!");
        return;
      }
      localStorage.setItem("wechatUser", username || phone);
      navigate("/chat");
    } else {
      if (!username.trim() || !phone.trim()) {
        alert("Please enter username and phone number to register!");
        return;
      }
      localStorage.setItem("wechatUser", username);
      alert("Registration successful!");
      navigate("/chat");
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
        <motion.div
          className={styles.leftPanel}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <h2 className={styles.title}>
            {mode === "login" ? "Welcome back" : "Create an account"} <span>WeChat</span>
          </h2>
          <p className={styles.subtitle}>
            {mode === "login"
              ? "Enter your credentials to continue"
              : "Register to start chatting instantly"}
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Username input */}
            <div className={styles.inputGroup}>
              <FaUser className={styles.icon} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Phone input */}
            <div className={styles.inputGroup}>
              <FaPhone className={styles.icon} />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={styles.button}
            >
              <FaLock className={styles.btnIcon} />
              {mode === "login" ? "Login" : "Register"}
            </motion.button>
          </form>

          <p className={styles.switchMode}>
            {mode === "login" ? "New user?" : "Already have an account?"}{" "}
            <span onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Register here" : "Login here"}
            </span>
          </p>
        </motion.div>

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

            {/* Floating emojis */}
            <div className={styles.floater + " " + styles.floater1}>💬</div>
            <div className={styles.floater + " " + styles.floater2}>🔒</div>
            <div className={styles.floater + " " + styles.floater3}>⚡</div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Login;
