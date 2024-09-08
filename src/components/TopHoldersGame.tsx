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
          <li key={index} className="mb-2">
            {holder.address}: {holder.amount} CHZ
          </li>
        ))}
      </ul>
    </div>
  );
}