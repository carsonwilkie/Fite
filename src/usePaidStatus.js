import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

export default function usePaidStatus() {
  const { user } = useUser();
  const [isPaid, setIsPaid] = useState(() => {
    return localStorage.getItem("isPaid") === "true";
  });

  useEffect(() => {
    if (!user) {
      setIsPaid(false);
      localStorage.setItem("isPaid", "false");
      return;
    }
    fetch("/api/checkPaid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsPaid(data.isPaid);
        localStorage.setItem("isPaid", data.isPaid);
      });
  }, [user]);

  return { isPaid };
}