import { useEffect, useState } from "react";

/**
 * useSessionGuard
 *
 * Watches sessionStorage for a valid empName.
 * Returns { sessionExpired } — true when the session has been cleared
 * while the user was on a protected page.
 *
 * @param {number} intervalMs  How often to poll (default: 30 seconds)
 */
const useSessionGuard = (intervalMs = 180_000) => {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const check = () => {
      const empName = sessionStorage.getItem("empName");
      if (!empName) {
        setSessionExpired(true);
      }
    };

    // Check immediately on mount
    check();

    // Poll on an interval so background tabs are caught too
    const timer = setInterval(check, intervalMs);

    // Also react instantly when another tab clears sessionStorage
    // (storage event only fires for localStorage, but catches explicit clears)
    const handleStorageChange = (e) => {
      if (e.key === null || e.key === "empName") {
        check();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Catch tab becoming visible again (e.g. user switches back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs]);

  return { sessionExpired };
};

export default useSessionGuard;