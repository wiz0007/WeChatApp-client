import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Lock } from "lucide-react";
import styles from "./ResetPassword.module.scss";

const API = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
    setUserId(params.get("id"));
  }, []);

  const handleReset = async () => {
    if (!password) return toast.error("Enter new password");

    try {
      setLoading(true);
      await axios.post(`${API}/api/auth/reset-password`, {
        userId,
        token,
        newPassword: password,
      });

      toast.success("Password changed!");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Reset Password</h1>

        <div className={styles.inputBox}>
          <Lock className={styles.icon} />
          <input
            type={showPass ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {showPass ? (
            <EyeOff className={styles.eye} onClick={() => setShowPass(false)} />
          ) : (
            <Eye className={styles.eye} onClick={() => setShowPass(true)} />
          )}
        </div>

        <button onClick={handleReset} className={styles.btn}>
          {loading ? "Changing..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}
