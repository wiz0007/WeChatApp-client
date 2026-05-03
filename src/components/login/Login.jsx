import React, { useState } from "react";
import styles from "./Login.module.scss";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

const Login = () => {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const onInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/auth/login", form);
      localStorage.setItem("wechatToken", res.data.token);
      localStorage.setItem("wechatUser", JSON.stringify(res.data.user));
      toast.success("Login successful!");
      setTimeout(() => (window.location.href = "/home"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
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
        <h1>Welcome Back</h1>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <Mail />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={onInputChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <Lock />
            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={onInputChange}
              required
            />
            <span onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff /> : <Eye />}
            </span>
          </div>

          <a className={styles.forgot} href="/forgot-password">
            Forgot Password?
          </a>

          <button className={styles.primaryBtn} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
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
            Don't have an account? <a href="/register">Register</a>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
