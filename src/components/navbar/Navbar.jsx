import React from "react";
import styles from "./Navbar.module.scss";
import logo from "../../assets/logo.png";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <a
        href="https://we-chatt-ruby.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.logoContainer}
      >
        <img
          src={logo}
          alt="WeChat Logo"
          className={styles.logo}
        />
        <span className={styles.logoText}>WeChat</span>
      </a>
    </nav>
  );
};

export default Navbar;
