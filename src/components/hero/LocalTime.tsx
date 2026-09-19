"use client";

import { useEffect, useState } from "react";

interface LocalTimeProps {
  timeZone: string;
  label: string;
}

/** The current time where Gangadhara is, so a recruiter abroad can plan a call. */
export function LocalTime({ timeZone, label }: LocalTimeProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return (
    <span className="tabular-nums">
      {time ?? "--:--"} {label}
    </span>
  );
}
