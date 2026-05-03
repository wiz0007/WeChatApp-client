import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.scss";
import logo from "../../assets/logo.png";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logoContainer}>
        <img
          src={logo}
          alt="WeChat Logo"
          className={styles.logo}
        />
        <span className={styles.logoText}>WeChat</span>
      </Link>
    </nav>
  );
};

export default Navbar;
