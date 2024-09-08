import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ViemRpc from '../rpcs/viemRPC';

const useBalance = (refreshInterval = 30000) => {
  const { provider } = useAuth();
  const [balance, setBalance] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchBalance = async () => {
      if (!provider) {
        setError('Provider not initialized');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const rpc = new ViemRpc(provider);
        const userBalance = await rpc.getBalance();
        setBalance(userBalance);
        setError(null);
      } catch (err) {
        setError('Failed to fetch balance');
        console.error('Error fetching balance:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    intervalId = setInterval(fetchBalance, refreshInterval);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [provider, refreshInterval]);

  return { balance, isLoading, error };
};

export default useBalance;
