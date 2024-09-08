// @ts-nocheck
import React from "react";
import { formatEther, Wallet } from "ethers";
import { useAuth } from "../contexts/AuthContext";
import { GameDetails, useGame } from "../contexts/GameContext";
import { Activity } from "../interfaces/IActivity";
import ViemRpc from "../rpcs/viemRPC";
import { useParams } from "react-router-dom";

interface ActivityGameProps {
  activities: Activity[];
}

export function ActivityGame(props: ActivityGameProps) {
  const { gameDetails, getPlayerBets } = useGame();
  const { provider } = useAuth();
  const { contractAddress } = useParams();
  const [address, setAddress] = React.useState<string>("");
  const [activity, setActivity] = React.useState<{
    optionName: string;
    amount: string;
  }>([]);
  const singleGame = gameDetails.find(
    (game: GameDetails) =>
      game.contractAddress.toLowerCase() === contractAddress?.toLowerCase()
  );

  React.useEffect(() => {
    async function fetchData() {
      const viemRPC = new ViemRpc(provider as any);
      const signer = new Wallet((await viemRPC.getPrivateKey()) as string);
      const address = await signer.getAddress();
      setAddress(address);
      getPlayerBets(singleGame?.contractAddress as string, address).then(
        ([betSide, betAmount]) => {
          setActivity({
            optionName: betSide,
            amount: formatEther(betAmount),
          });
        }
      );
    }
    fetchData();
  }, [getPlayerBets]);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Activity</h3>
      <ul>
        <li className="mb-2 font-normal text-md">
          <span className="font-bold text-chiliz">{activity.optionName}</span>{" "}
          {activity.optionName === "Yes" ? "picked" : "against"}{" "}
          <span className="font-bold text-chiliz">{activity.amount} CHZ</span>{" "}
        </li>
      </ul>
    </div>
  );
}
