import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/react";

export const Header = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <div className="relative isolate z-50 w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl text-white py-3 px-6 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-visible">

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.42 0-2.75-.37-3.9-1.02l-.28-.16-2.9.78.78-2.9-.16-.28C4.99 15.25 4 13.72 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold tracking-wide">Chat App</h1>
        <div className="hidden sm:flex items-center gap-2 ml-4">
          <button
            onClick={() => navigate('/chat')}
            className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition"
          >
            Chat
          </button>
          <button
            onClick={() => navigate('/groups')}
            className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition"
          >
            Groups
          </button>
        </div>
      </div>

      {isLoaded && isSignedIn && (
        <div className="flex items-center gap-3">
          <span className="font-medium hidden sm:block">
            {user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress}
          </span>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      )}
    </div>
  );
};
