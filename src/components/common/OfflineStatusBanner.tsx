import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, CheckCircle2 } from "lucide-react";

export const OfflineStatusBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [showReconnectedMsg, setShowReconnectedMsg] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnectedMsg(true);
      setTimeout(() => setShowReconnectedMsg(false), 4000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (showReconnectedMsg) {
    return (
      <div className="bg-emerald-600 px-4 py-2 text-center text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
        <Wifi className="h-4 w-4" />
        <span>Network Connection Restored — Offline results & attempts automatically synchronized!</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 px-4 py-2 text-center text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
      <WifiOff className="h-4 w-4" />
      <span>Offline Mode Active — Assigned tests, questions, & instant score calculations are fully functional offline!</span>
    </div>
  );
};
