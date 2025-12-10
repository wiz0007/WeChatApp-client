import React from 'react'
import Navbar from '../../components/navbar/Navbar'
import Login from '../../components/login/Login'
import styles from "./LoginPage.module.scss";


const LoginPage = () => {
  return (
    <div>
      <Navbar/>
      <Login/>
    </div>
  )
}

export default LoginPage
