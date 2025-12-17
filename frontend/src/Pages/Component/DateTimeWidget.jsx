import { useEffect, useState } from "react";

export default function DateTimeWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const time = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const date = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="text-center mb-4">
      <p className="text-2xl font-semibold text-gray-800 tracking-wide">
        {time}
      </p>
      <p className="text-xs text-gray-500 capitalize">
        {date}
      </p>
    </div>
  );
}
