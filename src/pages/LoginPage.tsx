import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { WALLET_ADAPTERS } from "@web3auth/base";
import { FaGoogle } from "react-icons/fa";
import Web3AuthBrand from "../assets/web3auth.svg";
import betinho from "../assets/betinho-logo.png"


const LoginPage = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();
  const { web3auth, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && web3auth?.connected) {
      setLoggedIn(true);
      navigate("/home");
    }
  }, [isInitialized, web3auth, navigate]);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: "google",
      }
    );

    if (web3authProvider) {
      setLoggedIn(true);
      navigate("/home");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-pattern bg-no-repeat bg-center">
      <div className="p-6 bg-slate-50 rounded-xl shadow-xl flex items-center justify-center flex-col">
        <div>
          <img src={betinho} alt="betinho" className="h-72" />
          <h1 className="mb-4 text-3xl font-bold text-center text-black">BETINHO</h1>
        </div>
        {!loggedIn && (
          <button
            onClick={login}
            className="flex items-center justify-center gap-4 w-full px-4 py-2 text-white bg-red-500 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <FaGoogle color="white" size={18} />
            LOGIN WITH GOOGLE
          </button>
        )}
        <img src={Web3AuthBrand} alt="self custody via web3auth" className="mt-4 h-10 flex items-center justify-center" />
      </div>
    </div>
  );
};

export default LoginPage;
