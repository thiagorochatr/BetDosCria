import { GiReceiveMoney } from "react-icons/gi";
import { TopHolder } from "../interfaces/ITopHolder";

interface TopHoldersGameProps {
  topHolders: TopHolder[];
}

export function TopHoldersGame(props: TopHoldersGameProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Top 5 Holders</h3>
      <ul>
        {props.topHolders.map((holder, index) => (
          <li key={index} className="mb-2 text-lg font-normal flex items-center justify-start gap-3">
            <span className="font-bold text-chiliz">
              {holder.address}
            </span>
            {<GiReceiveMoney />}
            {holder.amount} CHZ
          </li>
        ))}
      </ul>
    </div>
  );
}