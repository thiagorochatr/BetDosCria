import { Activity } from "../interfaces/IActivity";

interface ActivityGameProps {
  activities: Activity[];
}

export function ActivityGame(props: ActivityGameProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Activity</h3>
      <ul>
        {props.activities.map((activity, index) => (
          <li key={index} className="mb-2 font-normal text-md">
            <span className="font-bold text-chiliz">
              {activity.address}
            </span>
            {" "}
            {activity.action}
            {" "}
            <span className="font-bold text-chiliz">
              {activity.amount} CHZ
            </span>
            {" "}
            at
            {" "}
            {activity.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}