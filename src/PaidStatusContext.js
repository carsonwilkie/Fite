import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

const PaidStatusContext = createContext({ isPaid: false, loading: true });

export function PaidStatusProvider({ children }) {
  const { user, isLoaded } = useUser();
  const [isPaid, setIsPaid] = useState(() => localStorage.getItem("isPaid") === "true");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setIsPaid(false);
      localStorage.setItem("isPaid", "false");
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
        localStorage.setItem("isPaid", data.isPaid);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, isLoaded]);

  return (
    <PaidStatusContext.Provider value={{ isPaid, loading }}>
      {children}
    </PaidStatusContext.Provider>
  );
}

export function usePaidStatusContext() {
  return useContext(PaidStatusContext);
}
