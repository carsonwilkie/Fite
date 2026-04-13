import { useEffect } from "react";
import { useRouter } from "next/router";

function ScrollToTop() {
  const { pathname } = useRouter();

  // Disable browser scroll restoration once so popstate can't override us.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Reset scroll on every route change using requestAnimationFrame so we run
  // on the next paint frame — after any browser-triggered restoration fires.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const opts = { top: 0, left: 0, behavior: "instant" };
      window.scrollTo(opts);
      document.documentElement.scrollTo(opts);
      document.body.scrollTo(opts);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
