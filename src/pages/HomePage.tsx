// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ViemRpc from "../rpcs/viemRPC";
import useBalance from "../hooks/useBalance";
import { Profile } from "../components/Profile";
import { TbBeta } from "react-icons/tb";
import { GiBasketballBasket, GiGolfFlag, GiSoccerBall } from "react-icons/gi";
import {
  FaArrowRight,
  FaExternalLinkAlt,
  FaFootballBall,
  FaRegStar,
  FaStar,
} from "react-icons/fa";
import { BsPersonWheelchair } from "react-icons/bs";
import { formatWalletAddress } from "../tools/formatWalletAddress";
import { GameDetails, useGame } from "../contexts/GameContext";
import { ethers } from "ethers";
import chilizImg1 from "../assets/chiliz-logo-2023.svg"
import chilizImg2 from "../assets/chiliz-logo-v3.png"
import betinho from "../assets/betinho-logo.png"

interface Game {
  id: number;
  name: string;
  contractAddress: string;
  starred: boolean;
}

interface FaucetResponse {
  message: string;
  txHash: string;
}

const HomePage: React.FC = () => {
  const { web3auth, provider, isInitialized, logout } = useAuth();
  const { gameFactory, games, loadGame, getGameInfo, getLatestGames, gameDetails } =
    useGame(); // Use the gameContext

  const [address, setAddress] = useState<string>("");
  //   const [balance, setBalance] = useState<string>("");
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [participatingGames, setParticipatingGames] = useState<Game[]>([]);
  const [isFaucetLoading, setIsFaucetLoading] = useState<boolean>(false);
  const [faucetResponse, setFaucetResponse] = useState<FaucetResponse | null>(
    null
  );
  const navigate = useNavigate();
  const {
    balance,
    // isLoading,
    // error
  } = useBalance();
  const [userName, setUserName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    if (isInitialized && web3auth?.connected) {
      fetchUserData();
      fetchGames();
    }
  }, [isInitialized, web3auth]);

  const fetchUserData = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new ViemRpc(provider);
    const userAddress = await rpc.getAccounts();
    // const userBalance = await rpc.getBalance();

    const user = await web3auth?.getUserInfo();

    setAddress(userAddress);
    // setBalance(userBalance);

    setUserName(user?.name ?? ""); // Use empty string as fallback
    setAvatarUrl(user?.profileImage ?? ""); // Use empty string as fallback

    // Mock data for games - replace with actual contract calls
    // League A
    // Group A2
    // France
    // France
    // Belgium
    // Belgium
    // 15:45
    // View details
    // contract: 0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141
    setAvailableGames([
      {
        id: 1,
        name: "France vs Belgium",
        contractAddress: "0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141",
        starred: false,
      },
      // { id: 1, name: "Game 1", contractAddress: "0x123...", starred: false },
      // { id: 4, name: "Game 5", contractAddress: "0x456...", starred: false },
      // { id: 5, name: "Game 6", contractAddress: "0x567...", starred: false },
      // { id: 6, name: "Game 2", contractAddress: "0x678...", starred: false },
    ]);
    // setParticipatingGames([
    //   { id: 2, name: "Game 3", contractAddress: "0x234...", starred: false },
    //   { id: 3, name: "Game 4", contractAddress: "0x345...", starred: false },
    // ]);
  };

  const fetchGames = async () => {
    try {
      const latestGames = await getLatestGames(10); // Fetch the 10 most recent games
      const fetchedGames: Game[] = [];

      for (const gameEvent of latestGames) {
        await loadGame(gameEvent.gameAddress);
        const gameInfo = await getGameInfo(gameEvent.gameAddress);

        fetchedGames.push({
          id: gameEvent.blockNumber,
          name: `Game ${gameEvent.blockNumber}`,
          contractAddress: gameEvent.gameAddress,
          starred: false,
          totalPool: ethers.formatEther(gameInfo.totalPool),
          endTime: gameInfo.status.expectedEnd.toNumber(),
        });
      }

    //   setAvailableGames(fetchedGames);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const requestFaucet = async (): Promise<void> => {
    setIsFaucetLoading(true);
    try {
      const response = await fetch(
        `https://chiliz-faucet.vercel.app?address=${address}`
      );
      const data: FaucetResponse = await response.json();
      setFaucetResponse(data);
      // Refresh balance after successful faucet request
      fetchUserData();
    } catch (error) {
      console.error("Error requesting faucet:", error);
      setFaucetResponse({ message: "Faucet request failed", txHash: "" });
    } finally {
      setIsFaucetLoading(false);
    }
  };

  const viewGameDetails = (contractAddress: string): void => {
    navigate(`/game-page/${contractAddress}`);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { icon: <TbBeta size={26} />, label: "All" },
    { icon: <GiSoccerBall size={26} />, label: "UEFA" },
    { icon: <FaFootballBall size={26} />, label: "NFL" },
    { icon: <GiBasketballBasket size={26} />, label: "NBA" },
    { icon: <BsPersonWheelchair size={26} />, label: "Paralympics" },
    { icon: <GiGolfFlag size={26} />, label: "GOLF" },
  ];

  const toggleStarred = (gameId: number) => {
    setAvailableGames((games) =>
      games.map((game) =>
        game.id === gameId ? { ...game, starred: !game.starred } : game
      )
    );
    setParticipatingGames((games) =>
      games.map((game) =>
        game.id === gameId ? { ...game, starred: !game.starred } : game
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-pattern bg-no-repeat bg-center">
      <div className="flex justify-between items-center mb-8">
        <img src={betinho} alt="betinho" className="h-24" />
        <Profile handleLogout={handleLogout} address={address ? address : '000000000'} name={userName} avatarUrl={avatarUrl} /> {/*@remind */}
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-md">Balance:</p>
          <span className="font-bold flex items-center justify-center gap-1">
            {balance}
            <span className="text-chiliz flex items-center justify-center">
              CHZ
              <img src={chilizImg2} alt="chiliz" className="h-5" />
            </span>
          </span>
        </div>
        <button
          onClick={requestFaucet}
          disabled={isFaucetLoading}
          className={`bg-chiliz flex items-end justify-center gap-1 text-slate-50 px-4 py-2 rounded hover:bg-chiliz/80 ${isFaucetLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {isFaucetLoading ? "Requesting " : "Request "}
          <img src={chilizImg1} alt="chiliz" className="h-6" />
          {"CHZ"}
        </button>
      </div>

      {faucetResponse && (
        <div>
          <div
            className={`flex items-start justify-center flex-col gap-0.5 mb-4 p-2 text-xs rounded ${
              faucetResponse.message.includes("successful")
                ? "bg-green-300/80 text-slate-900"
                : "bg-red-300/80 text-slate-900"
            }`}
          >
            <p>{faucetResponse.message}!</p>
            {faucetResponse.txHash && (
              <p className="flex items-start justify-center gap-1">
                Transaction Hash:
                <a
                  href={`https://testnet.chiliscan.com/tx/${faucetResponse.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500/90 hover:text-blue-600/90 flex items-center gap-1"
                >
                  {formatWalletAddress(faucetResponse.txHash, 10)}{" "}
                  {<FaExternalLinkAlt />}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-2 flex-1">
          {/* <MapPin className="size-5 text-zinc-400" /> */}
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-lg text-center shadow-2xl placeholder-slate-400 outline-none flex-1 border border-slate-600 rounded-xl"
            // onChange={}
          />
        </div>
      </div>

      {address && (
        <div className="mb-8">
          <div
            className="w-full overflow-x-auto shadow-md scrollbar-hide"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div
              className="flex items-center p-1 gap-4"
              style={{ minWidth: "max-content" }}
            >
              {navItems.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="shadow-sm shadow-chiliz w-auto min-w-16 px-2 h-16 bg-slate-200 rounded-xl flex flex-col items-center justify-center gap-0.5">
                    <div className="text-black">{item.icon}</div>
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Available Games</h2>
        <div className="grid grid-cols-1 gap-4">
          {gameDetails.map((game : GameDetails) => (
            <div
              key={game.id}
              className="border p-4 rounded-xl border-slate-600"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-xl">{game.title}</h3>
                <div className="flex flex-col items-end justify-center gap-0">
                  <span className="font-thin text-sm text-slate-400">
                    #{game.id}
                  </span>
                  <span className="font-thin text-sm text-slate-400">
                    509.9k Bet
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <button
                  onClick={() => viewGameDetails(game.contractAddress)}
                  className="flex items-center justify-center gap-1 mt-2 bg-chiliz text-white px-3 py-1 rounded text-sm hover:bg-chiliz/80"
                >
                  View Details
                  <FaArrowRight />
                </button>
                <span>
                  <button onClick={() => toggleStarred(game.id)}>
                    {game.starred ? (
                      <FaStar className="text-yellow-500" />
                    ) : (
                      <FaRegStar className="text-slate-400" />
                    )}
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Participating Games</h2>
        <div className="grid grid-cols-1 gap-4">
          {participatingGames.map((game) => (
            <div
              key={game.id}
              className="border p-4 rounded-xl border-slate-600"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-xl">{game.name}</h3>
                <div className="flex flex-col items-end justify-center gap-0">
                  <span className="font-thin text-sm text-slate-400">
                    #{game.id}
                  </span>
                  <span className="font-thin text-sm text-slate-400">
                    509.9k Bet
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <button
                  onClick={() => viewGameDetails(game.contractAddress)}
                  className="flex items-center justify-center gap-1 mt-2 bg-chiliz text-white px-3 py-1 rounded text-sm hover:bg-chiliz/80"
                >
                  View Details
                  <FaArrowRight />
                </button>
                <span>
                  <button onClick={() => toggleStarred(game.id)}>
                    {game.starred ? (
                      <FaStar className="text-yellow-500" />
                    ) : (
                      <FaRegStar className="text-slate-400" />
                    )}
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
