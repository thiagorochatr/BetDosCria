import { useState, useEffect } from "react";
import {
  CHAIN_NAMESPACES,
  IProvider,
  WALLET_ADAPTERS,
  UX_MODE,
  WEB3AUTH_NETWORK,
  // ADAPTER_EVENTS,
  // IWeb3Auth,
} from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { IW3AUser } from "../interfaces/IW3AUser";
import ViemRpc from "../rpcs/viemRPC";
import { Client } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";

// const verifier = import.meta.env.VITE_WEB3AUTH_VERIFIER;

const CHILIZ_SPICY_TESTNET_CONFIG = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x15b32", // Hexadecimal string for 88882
  rpcTarget: "https://spicy-rpc.chiliz.com/",
  displayName: "Chiliz Spicy Testnet",
  blockExplorerUrl: "https://testnet.chiliscan.com/",
  ticker: "CHZ",
  tickerName: "Chiliz",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    /*
      pass the chain config that you want to connect with.
      all chainConfig fields are required.
      */
    chainConfig: CHILIZ_SPICY_TESTNET_CONFIG,
  },
});

const Web3AuthComponent = () => {
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [user, setUser] = useState<IW3AUser | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(false);
  const [clientId, setClientId] = useState<string>("");

  console.log(user);

  useEffect(() => {
    const getClientId = () => {
      const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID;
      setClientId(clientId);
    };

    getClientId();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        if (!clientId) {
          throw new Error("WEB3AUTH CLIENT ID is not set");
        }

        const web3auth = new Web3AuthNoModal({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, //@remind
          privateKeyProvider,
        });

        // const openloginAdapter = new OpenloginAdapter();
        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            clientId,
            network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, //@remind
            uxMode: UX_MODE.REDIRECT,
          },
          privateKeyProvider,
        });

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
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: "google",
      }
    );

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
    setUser(user);
    uiConsole(user);
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    setUser(null);
    uiConsole("logged out");
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new ViemRpc(provider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new ViemRpc(provider);
    const address = await rpc.getAccounts();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new ViemRpc(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new ViemRpc(provider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new ViemRpc(provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new ViemRpc(provider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
  };

  const getXMTP = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new ViemRpc(provider);
    // const xmtp = await rpc.getXMTP();
    const signer = await rpc.getPrivateKey();
    // ethersjs wallet
    const walletSigner = new Wallet(signer);
    // Create the client with your wallet. This will connect to the XMTP development network by default
    const xmtp = await Client.create(walletSigner, { env: "dev" });
    // Start a conversation with XMTP
    const conversation = await xmtp.conversations.newConversation(
      "0x3F11b27F323b62B159D2642964fa27C46C841897"
    );
    // Load all messages in the conversation
    const messages = await conversation.messages();

    console.log(messages);
    // Send a message
    await conversation.send("gm");
    // Listen for new messages in the conversation
    for await (const message of await conversation.streamMessages()) {
      console.log(`[${message.senderAddress}]: ${message.content}`);
    }
  };

  const loggedInView = (
    <>
      <div className="">
        <div>
          <button onClick={getUserInfo} className="">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="">
            Get ID Token
          </button>
        </div>
        <div>
          <button onClick={getChainId} className="">
            Get Chain ID
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={getPrivateKey} className="">
            Get Private Key
          </button>
        </div>
        <div>
          <button onClick={getXMTP} className="">
            Get XMTP
          </button>
        </div>
        <div>
          <button onClick={logout} className="">
            Log Out
          </button>
        </div>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="">
      Login
    </button>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  return (
    <div>
      <div className="">{loggedIn ? loggedInView : unloggedInView}</div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </div>
  );
};

export default Web3AuthComponent;
