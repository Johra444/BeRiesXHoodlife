import React, { useState } from 'react';
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import NavigationLinks from "./navigation-links";
import styles from "../styles/Navbar.module.css"
import { Spin as Hamburger } from 'hamburger-react'


const Navbar = () => {
  const [display, setDisplay] = useState('none');

  const handleClick = () => {
    setDisplay(display === 'none' ? 'flex' : 'none');
  };

  
  return (
    <>
        <nav className={styles.navbarHeader}>
            <Link href="/">
              <a className={styles.navbarLink}>
                <img
                  src="/assets/logo.svg"
                  className={styles.navbarImage}
                />
              </a>
            </Link>
          <NavigationLinks></NavigationLinks>
          <ConnectButton />


          
        </nav>

    </>
  );
};

export default Navbar;
