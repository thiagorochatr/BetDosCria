// imports
import { useState, useEffect } from 'react';
import {
  CHAIN_NAMESPACES,
  IProvider,
  WALLET_ADAPTERS,
  // UX_MODE,
  WEB3AUTH_NETWORK,
  // ADAPTER_EVENTS,
  IWeb3Auth,
} from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

// Blockchain Calls - RPC

// const verifier = import.meta.env.VITE_WEB3AUTH_VERIFIER;

console.log("1: ", import.meta.env.VITE_TESTE);
console.log("2? ", import.meta.env.DEV );
console.log("3? ", import.meta.env.PROD );

console.log("4: ", );
console.log("5? ",  );
console.log("6? ", import.meta.env.REACT_APP_WEB3AUTH_CLIENT_ID );

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    /*
      pass the chain config that you want to connect with.
      all chainConfig fields are required.
      */
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0xaa36a7", // Please use 0x1 for Mainnet
      rpcTarget: "https://rpc.ankr.com/eth_sepolia",
      displayName: "Ethereum Sepolia Testnet",
      blockExplorerUrl: "https://sepolia.etherscan.io",
      ticker: "ETH",
      tickerName: "Ethereum",
      logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    },
  },
});

const Web3AuthComponent = () => {
  const [web3auth, setWeb3auth] = useState<IWeb3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  // const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [clientId, setClientId] = useState<string>("");

  console.log(provider);

  useEffect(() => {
    const getClientId = () => {
      const clientId = import.meta.env.DEV 
        ? import.meta.env.VITE_WEB3AUTH_CLIENT_ID 
        : import.meta.env.WEB3AUTH_CLIENT_ID;


      // const id = import.meta.env.WEB3AUTH_CLIENT_ID || import.meta.env.VITE_WEB3AUTH_CLIENT_ID || import.meta.env.REACT_APP_WEB3AUTH_CLIENT_ID || "";
      console.log("ClientId:", clientId);
      setClientId(clientId);




    };

    getClientId();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        if(!clientId) {
          throw new Error("WEB3AUTH_CLIENT_ID is not set");
        }

        const web3auth = new Web3AuthNoModal({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        });

        const openloginAdapter = new OpenloginAdapter();
        // const openloginAdapter = new OpenloginAdapter({
        //   adapterSettings: {
        //     clientId,
        //     network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        //     uxMode: "popup",
        //   },
        //   privateKeyProvider,
        // });
        
        web3auth.configureAdapter(openloginAdapter);

        setWeb3auth(web3auth);

        await web3auth.init();
        
        setProvider(web3auth.provider);
        
        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    init();
  }, [clientId]);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider: "google",
    });

    setProvider(web3authProvider);

    if (web3auth.connected) {
      setLoggedIn(true);
    }
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    // setUser(user);
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    // setUser(null);
    uiConsole("logged out");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        {/* <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div> */}
        {/* <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div> */}
        {/* <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div> */}
        {/* <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div> */}
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );


  return (
    <div>
      {/* {!user ? (
        <button onClick={login}>Log In with Google</button>
      ) : (
        <div>
          <p>Welcome, {user.name}</p>
          <button onClick={logout}>Log Out</button>
        </div>
      )} */}

      <div className="">{loggedIn ? loggedInView : unloggedInView}</div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>

    </div>
  );
};

export default Web3AuthComponent;