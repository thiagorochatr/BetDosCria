import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ViemRpc from "../rpcs/viemRPC";

interface Game {
  id: number;
  name: string;
  contractAddress: string;
}

const HomePage: React.FC = () => {
  const { web3auth, provider, isInitialized, logout } = useAuth();
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [participatingGames, setParticipatingGames] = useState<Game[]>([]);
  const navigate = useNavigate();

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
    const userBalance = await rpc.getBalance();

    setAddress(userAddress);
    setBalance(userBalance);

    // Mock data for games - replace with actual contract calls
    setAvailableGames([
      { id: 1, name: "Game 1", contractAddress: "0x123..." },
      { id: 2, name: "Game 2", contractAddress: "0x456..." },
    ]);
    setParticipatingGames([
      { id: 3, name: "Game 3", contractAddress: "0x789..." },
    ]);
  };

  const requestFaucet = async (): Promise<void> => {
    // Implement faucet request logic
    console.log("Requesting from faucet");
  };

  const viewGameDetails = (contractAddress: string): void => {
    navigate(`/game-page/${contractAddress}`);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-sm text-gray-600">Account:</p>
          <p className="font-medium">{address}</p>
        </div>
        <div>
          <button
            onClick={requestFaucet}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            Request Faucet
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm text-gray-600">Balance:</p>
        <p className="font-medium">{balance} CHZ</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Available Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableGames.map((game) => (
            <div key={game.id} className="border p-4 rounded">
              <h3 className="font-bold">{game.name}</h3>
              <button
                onClick={() => viewGameDetails(game.contractAddress)}
                className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Participating Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participatingGames.map((game) => (
            <div key={game.id} className="border p-4 rounded">
              <h3 className="font-bold">{game.name}</h3>
              <button
                onClick={() => viewGameDetails(game.contractAddress)}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
