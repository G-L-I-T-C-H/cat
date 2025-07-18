import { useState, useEffect } from "react";

function CountdownTimer({ taskData }) {
  const [minutesLeft, setMinutesLeft] = useState(taskData.projected_minutes);

  useEffect(() => {
    setMinutesLeft(taskData.projected_minutes);
  }, [taskData]);

  useEffect(() => {
    if (minutesLeft <= 0) return;

    const interval = setInterval(() => {
      setMinutesLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [minutesLeft]);

  return (
    <h2 className="text-xl font-semibold text-white">
      {minutesLeft}
    </h2>
  );
}