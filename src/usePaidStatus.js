import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

export default function usePaidStatus() {
  const { user } = useUser();
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
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
        setLoading(false);
      });
  }, [user]);

  return { isPaid, loading };
}