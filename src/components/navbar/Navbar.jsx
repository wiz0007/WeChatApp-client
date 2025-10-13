import React from "react";
import styles from "./Navbar.module.scss";
import logo from "../../assets/logo.png"

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <img
          src={logo} // Replace with your actual logo path
          alt="WeChat Logo"
          className={styles.logo}
        />
        <span className={styles.logoText}>WeChat</span>
      </div>
    </nav>
  );
};

export default Navbar;
