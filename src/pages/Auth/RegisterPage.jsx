import React from 'react'
import Navbar from '../../components/navbar/Navbar'
import Register from '../../components/login/Register';
import styles from "./LoginPage.module.scss";


const RegisterPage = () => {
  return (
    <div>
      <Navbar/>
      <Register/>
    </div>
  )
}

export default RegisterPage;
