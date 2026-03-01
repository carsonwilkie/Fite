import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

export default function usePaidStatus() {
  const { user } = useUser();
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/checkPaid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((res) => res.json())
      .then((data) => setIsPaid(data.isPaid));
  }, [user]);

  return isPaid;
}