import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Practice() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard"); }, []);
  return null;
}
