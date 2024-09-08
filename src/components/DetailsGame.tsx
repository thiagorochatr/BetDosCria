import { useState } from "react";
import { GameInfo } from "../interfaces/IGameInfo";
import { IoIosPeople, IoMdTrophy } from "react-icons/io";
import { useGame } from "../contexts/GameContext";
import { FaSpinner } from "react-icons/fa";

interface DetailsGameProps {
  gameInfo: GameInfo | null;
}

export function DetailsGame({ gameInfo }: DetailsGameProps) {
  const [betAmount, setBetAmount] = useState<string>("");
  const { pickOption } = useGame();
  const [betSide, setBetSide] = useState<"Yes" | "No">("Yes");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  console.log(gameInfo);
  const handleBet = async () => {
    setIsLoading(true);
    setTransactionHash(null);
    try {
      console.log(`Betting ${betAmount} on ${betSide}`);
      const txHash = await pickOption(gameInfo?.contractAddress ?? '', betSide, betAmount);
      setTransactionHash(txHash);
    } catch (error) {
      console.error("Error placing bet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {gameInfo && (
        <div className="grid grid-cols-1 gap-8">
          <div className="flex itens-start justify-between gap-4">
            <div className="relative w-full h-0 pb-[56.25%] rounded-xl shadow-lg overflow-hidden">
              <img
                src={gameInfo.image}
                alt={gameInfo.name}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>
            <div className="flex items-end flex-col justify-center gap-2">
              <h2 className="text-2xl font-semibold">{gameInfo.name}</h2>
              <p className="font-thin text-xs text-slate-400">
                {gameInfo.startDate} {"<>"} {gameInfo.endDate}
              </p>
              <div className="flex items-end justify-center gap-1">
                <p className="-mb-0.5">{gameInfo.totalPlayers}</p>
                <IoIosPeople className="" size={22} />
              </div>
              <div className="flex items-end justify-center gap-1">
                <p className="-mb-1">{gameInfo.jackpot} CHZ</p>
                <IoMdTrophy className="" size={22} />
              </div>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-6">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="px-4 py-2 h-10 bg-transparent placeholder-slate-400 outline-none flex-grow rounded border border-slate-600"
                placeholder="Bet amount"
              />

              <div className="flex justify-between gap-4">
                <button
                  onClick={() => setBetSide("Yes")}
                  className={`w-1/2 h-12 px-4 py-2 text-lg rounded ${
                    betSide === "Yes"
                      ? "bg-chiliz text-slate-50"
                      : "bg-transparent text-chiliz border border-chiliz"
                  }`}
                >
                  {gameInfo.sideA} (Yes)
                </button>
                <button
                  onClick={() => setBetSide("No")}
                  className={`w-1/2 h-12 px-4 py-2 text-lg rounded ${
                    betSide === "No"
                      ? "bg-chiliz text-slate-50"
                      : "bg-transparent text-chiliz border border-chiliz"
                  }`}
                >
                  {gameInfo.sideB} (No)
                </button>
              </div>

              <button
                onClick={handleBet}
                disabled={isLoading}
                className="w-full h-12 bg-chiliz text-slate-50 px-4 py-2 text-lg rounded hover:bg-chiliz/90 disabled:bg-chiliz/50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    PLACING BET...
                  </>
                ) : (
                  "PLACE BET"
                )}
              </button>

              {transactionHash && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  <p className="font-semibold">Bet placed successfully!</p>
                  <p className="text-sm mt-2">
                    Transaction Hash:{" "}
                    <a
                      href={`https://testnet.chiliscan.com/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {transactionHash.slice(0, 10)}...{transactionHash.slice(-10)}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
