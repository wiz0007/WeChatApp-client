import React, { useState } from "react";
import styles from "./Register.module.scss";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);

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
      const res = await api.post("/auth/register", form);
      toast.success(res.data?.message || "Account created successfully");
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
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
            {loading ? "Creating..." : "Register"}
          </button>

          <div className={styles.or}>OR</div>

          <button
            type="button"
            className={styles.googleBtn}
            onClick={() =>
              toast("Google OAuth is not configured in this build yet.")
            }
          >
            <img src="https://www.svgrepo.com/show/355037/google.svg" />
            Continue with Google
          </button>

          <p className={styles.switch}>
            Already have an account? <a href="/">Login</a>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
