import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { WALLET_ADAPTERS } from "@web3auth/base";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">Welcome</h1>
        {!loggedIn && (
          <button
            onClick={login}
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Login with Web3Auth
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
