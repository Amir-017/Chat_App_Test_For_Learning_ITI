import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/react";
import { useTranslation } from "react-i18next";
import api from "../Api/axios";

export const Header = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const { t, i18n } = useTranslation();
  const lastSyncedRef = useRef(null);

  // Clerk's own UserButton/UserProfile modal edits the account directly, so this app's local
  // User copy (name/imageUrl) only finds out once we push it here. Whenever Clerk's reactive
  // user object changes, push it to the backend, which then broadcasts it over socket.io so
  // every other open client's chat header/sidebar updates without a page refresh.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const signature = `${user.fullName || ""}|${user.username || ""}|${user.imageUrl || ""}`;
    if (lastSyncedRef.current === signature) return;
    lastSyncedRef.current = signature;

    api.post("api/users/sync-profile").catch((error) => {
      console.error("Error syncing profile:", error.message);
    });
  }, [isLoaded, isSignedIn, user, user?.fullName, user?.username, user?.imageUrl]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  };

  return (
    <div className="relative isolate z-50 w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl text-white py-3 px-6 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-visible">

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.42 0-2.75-.37-3.9-1.02l-.28-.16-2.9.78.78-2.9-.16-.28C4.99 15.25 4 13.72 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold tracking-wide">{t("header.appTitle")}</h1>
        <div className="hidden sm:flex items-center gap-2 ms-4">
          <button
            onClick={() => navigate('/chat')}
            className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition"
          >
            {t("header.navChat")}
          </button>
          <button
            onClick={() => navigate('/groups')}
            className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition"
          >
            {t("header.navGroups")}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition"
        >
          {t("header.switchLanguage")}
        </button>

        {isLoaded && isSignedIn && (
          <>
            <span className="font-medium hidden sm:block">
              {user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress}
            </span>
            <UserButton afterSignOutUrl="/sign-in" />
          </>
        )}
      </div>
    </div>
  );
};
