import React, { createContext, useState, useEffect, useContext } from 'react';
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { CHAIN_NAMESPACES, IProvider, UX_MODE, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Client } from "@xmtp/xmtp-js";
import { Wallet } from "ethers";
import ViemRpc from "../rpcs/viemRPC";

interface AuthContextType {
  web3auth: Web3AuthNoModal | null;
  provider: IProvider | null;
  xmtpClient: Client | null;
  isInitialized: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const CHILIZ_SPICY_TESTNET_CONFIG = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x15b32",
  rpcTarget: "https://spicy-rpc.chiliz.com/",
  displayName: "Chiliz Spicy Testnet",
  blockExplorerUrl: "https://testnet.chiliscan.com/",
  ticker: "CHZ",
  tickerName: "Chiliz",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID;
        
        const web3auth = new Web3AuthNoModal({
          clientId,
          web3AuthNetwork: "sapphire_devnet",
          chainConfig: CHILIZ_SPICY_TESTNET_CONFIG,
        });

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig: CHILIZ_SPICY_TESTNET_CONFIG },
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            clientId,
            network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
            uxMode: UX_MODE.REDIRECT,
          },
          privateKeyProvider,
        });

        web3auth.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth);

        await web3auth.init();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          await initializeXMTP(web3auth.provider);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  const initializeXMTP = async (provider: IProvider | null) => {
    try {
      if (!provider) {
        console.error("Provider is null");
        return;
      }
      const rpc = new ViemRpc(provider);
      const signer = await rpc.getPrivateKey();
      const wallet = new Wallet(signer);

      const xmtp = await Client.create(wallet, { env: "dev" });
      setXmtpClient(xmtp);
    } catch (error) {
      console.error("Error initializing XMTP:", error);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setXmtpClient(null);
  };

  return (
    <AuthContext.Provider value={{ web3auth, provider, xmtpClient, isInitialized, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};