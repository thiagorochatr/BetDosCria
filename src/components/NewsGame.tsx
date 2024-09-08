import { useCallback, useEffect, useState } from "react";
import xmtpLogo from "../assets/logomark.svg";
import xmtpIcon from "../assets/x-mark-white.svg";
import { useAuth } from '../contexts/AuthContext';
import ViemRpc from "../rpcs/viemRPC";
import { createConsentMessage, createConsentProofPayload} from "@xmtp/consent-proof-signature"

export function NewsGame() {
  const { provider, web3auth, isInitialized, xmtpClient } = useAuth();
  const [address, setAddress] = useState<string>("");
  const [subscriptionStatus, setSubscriptionStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isInitialized && web3auth?.connected) {
      fetchUserData();
    }
  }, [isInitialized, web3auth]);

  const fetchUserData = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new ViemRpc(provider);
    const userAddress = await rpc.getAccounts();
    setAddress(userAddress);
  };

  const handleSubscribe = useCallback(async () => {
    try {
      setLoading(true);
      // Get the subscriber
      if (!address) {
        throw new Error("Error getting user address");
      }
      const lookupResponse = await fetch(`https://chiliz-faucet.vercel.app/lookup`, { // our backend url for support this project.
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            broadcastAddress: xmtpClient,
          })
        });
      const data = await lookupResponse.json();
      if (!data.onNetwork) {
        throw new Error("Error");
      }
      const timestamp = Date.now();
      const message = createConsentMessage(address, timestamp)
      const signature = await new ViemRpc(provider!).signMessage1(address, message)
      const payloadBytes = createConsentProofPayload(signature as string, timestamp)
      const base64Payload = Buffer.from(payloadBytes).toString('base64')

      const subscribeResponse = await fetch(`https://chiliz-faucet.vercel.app/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            broadcastAddress: xmtpClient,
            consentProof: base64Payload
          })
        });
      await subscribeResponse.json();
      setSubscriptionStatus(true)
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [address]); 

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Subscribe</h3>
        <img src={xmtpLogo} alt="xmtp" className="bg-slate-400 h-6 px-2 py-1 rounded-xl" />
      </div>
      <div className="p-4 mb-4 max-h-[320px]">
        <p className="mb-2">Subscribe to receive news about this game!</p>
        <p className="text-sm text-slate-400">By subscribing, you agree to receive messages from this broadcast channel using XMTP.</p>
      </div>
      <div className="flex flex-1 items-center justify-center gap-1">
        <button
          onClick={handleSubscribe}
          className="flex items-center justify-center gap-1 bg-chiliz h-10 text-slate-50 px-3 text-lg rounded hover:bg-chiliz/90"
        >
          {subscriptionStatus ? "Subscribed" : loading ? "Loading... " : 'Subscribe'}
          <img src={xmtpIcon} alt="xmtp" className="h-4" />
        </button>
      </div>

    </div>
  );
}