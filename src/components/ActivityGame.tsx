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
          <li key={index} className="mb-2">
            {activity.address} {activity.action} {activity.amount} CHZ at{" "}
            {activity.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}