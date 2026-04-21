import { useUser } from "@clerk/clerk-react";
import { useAuthModal } from "./auth/AuthProvider";

export default function useUpgrade() {
  const { user } = useUser();
  const { openSignIn } = useAuthModal();

  return async function handleUpgrade() {
    if (!user?.id) {
      openSignIn();
      return;
    }
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, email: user.primaryEmailAddress?.emailAddress }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };
}
