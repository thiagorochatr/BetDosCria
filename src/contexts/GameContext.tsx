import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { useAuth } from "./AuthContext";
import ViemRpc from "../rpcs/viemRPC";
import GameFactoryABI from "../abis/GameFactory.json";
import GameABI from "../abis/Game.json";
import OrderBookABI from "../abis/OrderBook.json";

interface GameEvent {
  gameAddress: string;
  blockNumber: number;
}

interface GameContextType {
  gameFactory: ethers.Contract | null;
  orderBook: ethers.Contract | null;
  createGame: (
    resolver: string,
    expectedEnd: number,
    optionNames: string[]
  ) => Promise<string>;
  getGameAddress: (salt: string) => Promise<string>;
  games: { [address: string]: ethers.Contract };
  loadGame: (address: string) => Promise<void>;
  pickOption: (
    gameAddress: string,
    optionName: string,
    amount: string
  ) => Promise<void>;
  resolveGame: (gameAddress: string, winningOption: string) => Promise<void>;
  claimReward: (gameAddress: string) => Promise<void>;
  getGameInfo: (gameAddress: string) => Promise<any>;
  getLatestGames: (count: number) => Promise<GameEvent[]>;
  gameDetails: GameDetails[];
  getPlayerBets: (gameAddress: string, playerAddress: string) => Promise<[string, ethers.BigNumberish]>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}
export interface GameDetails {
  id: number;
  image: string;
  sideA: string;
  sideB: string;
  title: string;
  contractAddress: string;
  starred: boolean;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const { provider } = useAuth();
  const [viemRpc, setViemRpc] = useState<ViemRpc | null>(null);
  const [gameFactory, setGameFactory] = useState<ethers.Contract | null>(null);
  const [orderBook, setOrderBook] = useState<ethers.Contract | null>(null);
  const [games, setGames] = useState<{ [address: string]: ethers.Contract }>(
    {}
  );
  const [latestGames, setLatestGames] = useState([]);
  const [gameDetails, setGameDetails] = useState<GameDetails[]>([
    {
      id: 1,
      image: "https://i.ytimg.com/vi/qP6cWQbXUMQ/maxresdefault.jpg",
      sideA: "France",
      sideB: "Belgium",
      title: "France vs Belgium",
      contractAddress: "0xb4e1D3bA3AD24747Bab5ef419E02A2830E588202",
      starred: false,
    },
  ]);
  const GAME_FACTORY_ADDRESS = "0x85E433c027F2438375ce9eBA1C42A8CFFDC2CA5c";
  const ORDER_BOOK_ADDRESS = "0x1447eA3E2564A0cD360D0A8877Df5250FA31889A";

  useEffect(() => {
    if (provider) {
      const rpc = new ViemRpc(provider);
      setViemRpc(rpc);
    }
  }, [provider]);

  useEffect(() => {
    const initializeContracts = async () => {
      if (viemRpc && provider) {
        const signer = await viemRpc.getPrivateKey();
        const factory = new ethers.Contract(
          GAME_FACTORY_ADDRESS,
          GameFactoryABI.abi,
          signer
        );
        const book = new ethers.Contract(
          ORDER_BOOK_ADDRESS,
          OrderBookABI.abi,
          signer
        );
        setGameFactory(factory);
        setOrderBook(book);
      }
    };
    initializeContracts();
  }, [viemRpc, provider]);

  const createGame = async (
    resolver: string,
    expectedEnd: number,
    optionNames: string[]
  ) => {
    if (!gameFactory) throw new Error("Game factory not initialized");
    const salt = ethers.randomBytes(32);
    const tx = await gameFactory.createGame(salt);
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === "GameCreated");
    return event?.args?.gameAddress;
  };

  const getGameAddress = async (salt: string) => {
    if (!gameFactory) throw new Error("Game factory not initialized");
    return await gameFactory.getGameAddress(salt);
  };

  const loadGame = async (address: string) => {
    // if (!viemRpc || !provider)
    //   throw new Error("ViemRpc or provider not initialized");
    const privateKey = await viemRpc!.getPrivateKey();
    const signer = new ethers.Wallet(privateKey);

    const provider = new ethers.JsonRpcProvider(
      "https://spicy-rpc.chiliz.com/"
    );

    const game = new ethers.Contract(
      address,
      GameABI.abi,
      signer.connect(provider)
    );
    return game;
    // {
    //     id: 1,
    //     name: "France vs Belgium",
    //     contractAddress: "0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141",
    //     starred: false,
    //   },
    // setGames({
    //   ["0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141"]: {
    //     id: 1,
    //     name: "France vs Belgium",
    //     contractAddress: "0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141",
    //     starred: false,
    //   },
    // });
    // setGames((prev) => ({ ...prev, [address]: game }));
  };

  const pickOption = async (
    gameAddress: string,
    optionName: string,
    amount: string
  ) => {
    let game = await loadGame(gameAddress);

    try {
      const tx = await game.pickOption(optionName, {
        value: ethers.parseEther(amount),
      });
      console.log("tx", tx);
      await tx.wait(2);
      //   return the transaction hash
      return tx.hash;
      // Verify the bet was placed correctly
      //   const address = await viemRpc?.getAddresses();
      //   const [betOptionName, betAmount] = await game.playerBets(address?.[0] ?? "");
      //   console.log("betOptionName", betOptionName);
      //   console.log("betAmount", betAmount);
      //   if (betOptionName !== optionName || betAmount !== ethers.parseEther(amount)) {
      //     throw new Error("Bet was not placed correctly");
      //   }
    } catch (error) {
      console.error("Error picking option:", error);
      throw new Error(
        "Failed to pick option. Please check your inputs and try again."
      );
    }
  };

  const resolveGame = async (gameAddress: string, winningOption: string) => {
    const game = games[gameAddress];
    if (!game) throw new Error("Game not loaded");
    const tx = await game.resolveGame(winningOption);
    await tx.wait();
  };

  const claimReward = async (gameAddress: string) => {
    const game = games[gameAddress];
    if (!game) throw new Error("Game not loaded");
    const tx = await game.claimReward();
    await tx.wait();
  };

  const getGameInfo = async (gameAddress: string) => {
    const game = games[gameAddress];
    if (!game) throw new Error("Game not loaded");
    const status = await game.status();
    const options = await game.getOptionNames();
    const totalPool = await game.getTotalPool();
    return { status, options, totalPool };
  };

  const getLatestGames = async (count: number): Promise<GameEvent[]> => {
    if (!gameFactory || !provider)
      throw new Error("Game factory or provider not initialized");

    const filter = gameFactory.filters.GameCreated();
    const fromBlock = 17401495;
    const toBlock = "latest";

    // Create a JSON-RPC provider for the Chiliz Spicy Testnet
    const jsonRpcProvider = new ethers.JsonRpcProvider(
      "https://spicy-rpc.chiliz.com/"
    );

    try {
      const events = await jsonRpcProvider.getLogs({
        ...filter,
        fromBlock,
        toBlock,
        address: GAME_FACTORY_ADDRESS,
      });

      console.log("events", events);

      return events
        .map((event) => ({
          gameAddress: ethers.getAddress(ethers.dataSlice(event.topics[1], 12)),
          blockNumber: event.blockNumber,
        }))
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, count);
    } catch (error) {
      console.error("Error fetching game events:", error);
      throw error;
    }
  };

  const getPlayerBets = async (gameAddress: string, playerAddress: string): Promise<[string, ethers.BigNumberish]> => {
    const game = await loadGame(gameAddress);
    return await game.playerBets(playerAddress);
  };

  const value = {
    gameFactory,
    orderBook,
    createGame,
    getGameAddress,
    games,
    loadGame,
    pickOption,
    resolveGame,
    claimReward,
    getGameInfo,
    getLatestGames,
    gameDetails,
    getPlayerBets,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
