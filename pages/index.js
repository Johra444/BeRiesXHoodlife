import React from "react";
import Head from "next/head";
import styles from "../styles/Hoodlife.module.css";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useState } from "react";
import { useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { HLC_CONTRACT_ABI, HLC_CONTRACT_ADDRESS } from "../constants";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { utils } from "ethers";

const firebaseConfig = {
  apiKey: "AIzaSyARKOGsDj7zgd_0IBvtbEsancDEX8Ie55w",
  authDomain: "berieshoodlife.firebaseapp.com",
  projectId: "berieshoodlife",
  storageBucket: "berieshoodlife.appspot.com",
  messagingSenderId: "308451013660",
  appId: "1:308451013660:web:b9ef7a1aa43b061aff5bd9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Home = () => {
  const [userBalance, setUserBalance] = useState(0);
  const { address, isConnected } = useAccount();
  const [submitButton, setSubmitButton] = useState(true);
  const [burnedBalance, setBurnedBalance] = useState(0);
  const [minted, setMinted] = useState("x");

  const doubleBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        HLC_CONTRACT_ADDRESS,
        HLC_CONTRACT_ABI,
        signer
      );
      const balanceOf = await contract.balanceOf(address, 0);
      const burned = await contract.burnedToken(address);
      const minted = await contract.minted();
      setMinted(ethers.utils.formatUnits(minted, 0));
      console.log(
        "you have : ",
        ethers.utils.formatUnits(balanceOf, 0),
        " tokens"
      );
      console.log(
        "you have burned : ",
        ethers.utils.formatUnits(burned, 0),
        " tokens"
      );
      setUserBalance(ethers.utils.formatUnits(balanceOf, 0));
      setBurnedBalance(ethers.utils.formatUnits(burned, 0));
      firbaseData(burned);
    } catch (error) {
      console.log(error);
    }
  };
  const firbaseData = async (burned) => {
    const docRef = doc(db, "orders", address);
    const docSnap = await getDoc(docRef);

    try {
      var snapshot = docSnap.data().burned;
      if (snapshot != undefined) {
        var snapshot = docSnap.data().burned;
        console.log(snapshot, "IL RENTRE");
        if (snapshot.toString() != burned.toString()) {
          setSubmitButton(false);
        }
      }
    } catch (error) {
      if (burned.toString() != "0") {
        setSubmitButton(false);
        console.log("You can submit your order");
      }
    }
  };

  const mintFunction = async (amount) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        HLC_CONTRACT_ADDRESS,
        HLC_CONTRACT_ABI,
        signer
      );
      const value = 0.04 * amount;
      const Mint = await contract.Mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      await Mint.wait();
      console.log("Minted");
      doubleBalance();
      //  getMinted();
      toast.success("Minted !", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      toast.error("Something went wrong", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      console.log(error);
    }
  };

  const burn = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        HLC_CONTRACT_ADDRESS,
        HLC_CONTRACT_ABI,
        signer
      );
      console.log("Your current balance is  : ", userBalance);
      console.log("You've already burned : ", burnedBalance, " tokens");
      if (userBalance == 0) {
        throw new Error("You don't have any tokens to burn");
      }
      const Burn = await contract.burn();
      await Burn.wait();
      toast.success("Burned !", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      doubleBalance();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  const handleBurn = async () => {
    if (burnedBalance) burn();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "orders", address), {
        address: address,
        name: state.name,
        email: state.email,
        region: state.region,
        zip: state.zip,
        street: state.street,
        country: state.country,
        city: state.city,
        info: state.info,
        burned: burnedBalance,
      });
      console.log("Document written with ID: ", address);
      toast.success("Information received !", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setSubmitButton(true);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
  const initialState = {
    name: "",
    email: "",
    region: "",
    zip: "",
    street: "",
    country: "",
    city: "",
    info: "",
  };

  function reducer(state, action) {
    switch (action.type) {
      case "update_input":
        return {
          ...state,
          [action.key]: action.value,
        };
    }
  }
  const [state, dispatch] = React.useReducer(reducer, initialState);

  useEffect(() => {
    doubleBalance();
  }, [isConnected]);

  const handleMint = () => {
    mintFunction(1);
  };

  return (
    <>
      <Navbar></Navbar>

      <div className={styles.burnContainer}>
        <Head>
          <title>Burn - BeRies</title>
          <meta property="og:title" content="Burn - BeRies" />
        </Head>

        {isConnected ? (
          <div className={styles.div}>
            <section id="Title" className={styles.burnContainer1}>
              <h1 className={styles.burnText}>HoodLife Club x BeRies</h1>
              <span className={styles.paragraph}>
                Burn your NFT to receive the BeRies pack you choose.
              </span>
            </section>
            <div className={styles.whiteContainer}>
              <div className={styles.ContainerRight}>
                <img className={styles.tee} src="/assets/tee.png" />
              </div>
              <div className={styles.ContainerLeft}>
                <img className={styles.hlclogo} src="/assets/HLClogo.png" />
                <p className={styles.bluetext}>1 Hoodlife Club NFT + 1 Tee</p>
                <p className={styles.bluetext}> {minted} / 111</p>
                <button className={styles.mintButton} onClick={handleMint}>
                  Mint
                </button>
                <span className={styles.paragraph}>
                  Mint your NFT to order your HoodLife x BeRies tee
                </span>
                <span className={styles.paragraph}>
                  The funds raised will be used to mint NFTs Hoodies for the
                  BeRies treasury.
                </span>
              </div>
            </div>
            <div className={styles.blueContainer}>
              <div className={styles.ContainerRight}>
                <h1>Burn your NFTs to access form</h1>
                <button className={styles.burnButton} onClick={handleBurn}>
                  Burn
                </button>
                <p>If you already did, form is down below</p>
              </div>
              <div className={styles.ContainerLeftImg}>
                <img
                  className={styles.hlcCharacter}
                  src="/assets/beries2.png"
                />
              </div>
            </div>
            <form
              id="burn for shipping"
              onSubmit={handleSubmit}
              className={styles.form}
            >
              <div className={styles.burnImageContainer}>
                <div className={styles.row}>
                  <div className={styles.inputContainer}>
                    <h1 className={styles.inputTitle}>Email</h1>
                    <input
                      required
                      placeholder="anon@beries.com"
                      className={styles.input}
                      value={state.email}
                      onChange={(e) =>
                        dispatch({
                          type: "update_input",
                          key: "email",
                          value: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                  <div className={styles.inputContainer}>
                    <h1 className={styles.inputTitle}>State/Prov/Region</h1>
                    <input
                      required
                      placeholder="Ile-de-France"
                      className={styles.input}
                      value={state.region}
                      onChange={(e) =>
                        dispatch({
                          type: "update_input",
                          key: "region",
                          value: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.inputContainer}>
                    <h1 className={styles.inputTitle}>Name</h1>
                    <input
                      required
                      placeholder="Onze Gmi"
                      className={styles.input}
                      value={state.name}
                      onChange={(e) =>
                        dispatch({
                          type: "update_input",
                          key: "name",
                          value: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                  <div className={styles.inputContainer}>
                    <h1 className={styles.inputTitle}>Postal/Zip</h1>
                    <input
                      required
                      placeholder="75007"
                      className={styles.input}
                      value={state.zip}
                      onChange={(e) =>
                        dispatch({
                          type: "update_input",
                          key: "zip",
                          value: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.inputContainer}>
                    <h1 className={styles.inputTitle}>Street</h1>
                    <input
                      required
                      placeholder="5 av. Anatole France"
                      className={styles.input}
                      value={state.street}
                      onChange={(e) =>
                        dispatch({
                          type: "update_input",
                          key: "street",
                          value: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                  <div className={styles.inputContainer}>
                    <h1 className={styles.inputTitle}>Country</h1>
                    <input
                      required
                      placeholder="France"
                      className={styles.input}
                      value={state.country}
                      onChange={(e) =>
                        dispatch({
                          type: "update_input",
                          key: "country",
                          value: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.inputContainer}>
                    <h1 className={styles.inputTitle}>City</h1>
                    <input
                      required
                      placeholder="Paris"
                      className={styles.input}
                      value={state.city}
                      onChange={(e) =>
                        dispatch({
                          type: "update_input",
                          key: "city",
                          value: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                  <div className={styles.inputContainer}>
                    <h1 className={styles.inputTitle}>Size (S to XL)</h1>
                    <input
                      placeholder="M"
                      required
                      className={styles.input}
                      value={state.info}
                      onChange={(e) =>
                        dispatch({
                          type: "update_input",
                          key: "info",
                          value: e.target.value,
                        })
                      }
                    ></input>
                  </div>
                </div>
                <div className={styles.row}>
                  <button
                    className={styles.submitButton}
                    type="submit"
                    disabled={submitButton}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className={styles.container}>
            <img src="/assets/plug.webp" className={styles.plug} />
            <div className={styles.connectContainer}>
              <span className={styles.text1}>Connect your wallet</span>
              <span className={styles.text2}>If you want go on this page.</span>
            </div>
          </div>
        )}
        <Footer rootClassName="footer-root-class-name4"></Footer>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          limit={1}
        />
      </div>
    </>
  );
};

export default Home;
