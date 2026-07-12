import { useTranslation } from "react-i18next";

// Turns a lastSeen timestamp into a WhatsApp-style "last seen ..." string
const formatLastSeen = (lastSeen, t) => {
  if (!lastSeen) return null;

  const diffMs = Date.now() - new Date(lastSeen).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return t("chat.header.lastSeenJustNow");
  if (diffMins < 60) return t("chat.header.lastSeenMinAgo", { count: diffMins });

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return t("chat.header.lastSeenHrAgo", { count: diffHours });

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return t("chat.header.lastSeenYesterday");

  return t("chat.header.lastSeenDate", { date: new Date(lastSeen).toLocaleDateString() });
};

export const ChatHeader = ({ chatAvatar, chatTitle, selectedGroup, selectedUser }) => {
  const { t } = useTranslation();

  const statusText = !selectedGroup && selectedUser
    ? selectedUser.isOnline
      ? t("chat.header.online")
      : formatLastSeen(selectedUser.lastSeen, t)
    : null;

  return (
    <div className="bg-slate-950/80 px-6 py-4 flex items-center gap-3 shadow-md border-b border-white/10">
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-950 font-bold">
        {chatAvatar}
      </div>
      <div>
        <h2 className="text-white font-semibold text-lg">{chatTitle}</h2>
        {selectedGroup && <p className="text-emerald-300 text-xs">{t("chat.header.groupChat")}</p>}
        {statusText && (
          <p className={`text-xs ${selectedUser.isOnline ? "text-emerald-400" : "text-slate-400"}`}>
            {statusText}
          </p>
        )}
      </div>
    </div>
  );
};
