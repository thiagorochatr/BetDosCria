import { useState } from "react";
import { GameInfo } from "../interfaces/IGameInfo";
import { IoIosPeople, IoMdTrophy } from "react-icons/io";

interface DetailsGameProps {
  gameInfo: GameInfo | null;
}

export function DetailsGame({ gameInfo }: DetailsGameProps) {
  const [betAmount, setBetAmount] = useState<string>("");
  const [betSide, setBetSide] = useState<"A" | "B">("A");


  const handleBet = async () => {
    // Implement betting logic here
    console.log(`Betting ${betAmount} on side ${betSide}`);
  };

  return (
    <div>
      {gameInfo && (
        <div className="grid grid-cols-1 gap-8">


          <div className="flex itens-start justify-between gap-4">
            <img
              src={gameInfo.image}
              alt={gameInfo.name}
              className="w-lg rounded-xl shadow-lg"
            />
            <div className="flex items-end flex-col justify-center gap-2">
              <h2 className="text-2xl font-semibold">{gameInfo.name}</h2>
              <p className="font-thin text-xs text-slate-400">{gameInfo.startDate} {"<>"} {gameInfo.endDate}</p>
              <div className="flex items-end justify-center gap-1">
                <p className="-mb-0.5">{gameInfo.totalPlayers}</p>
                <IoIosPeople className="" size={22} />
              </div>
              <div className="flex items-end justify-center gap-1">
                <p className="-mb-1">{gameInfo.jackpot} CHZ</p>
                <IoMdTrophy className="" size={22}  />
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

              <select
                value={betSide}
                onChange={(e) => setBetSide(e.target.value as "A" | "B")}
                className="px-4 py-2 h-10 bg-transparent placeholder-slate-400 rounded border border-slate-600"
              >
                <option value="A">Side A</option>
                <option value="B">Side B</option>
              </select>

              <button
                onClick={handleBet}
                className="w-full h-12 bg-chiliz text-slate-50 px-4 py-2 text-lg rounded hover:bg-chiliz/90"
              >
                PLACE BET
              </button>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
