import { useState } from "react";
import { toast } from "react-hot-toast";
import styles from "./ForgetPassword.module.scss";
import { Mail } from "lucide-react";
import api from "../../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleForgot = async () => {
    if (!email) return toast.error("Enter your email");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success(res.data?.message || "Reset link sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Forgot Password</h1>

        <div className={styles.inputBox}>
          <Mail className={styles.icon} />
          <input
            type="email"
            placeholder="Enter registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button onClick={handleForgot} className={styles.btn}>
          Send Reset Link
        </button>

        <p className={styles.back} onClick={() => (window.location.href = "/")}>
          Back to Login
        </p>
      </div>
    </div>
  );
}
