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

export const ChatHeader = ({ chatAvatar, chatTitle, selectedGroup, selectedUser, onClearChat, isGroupAdmin, onDeleteGroup }) => {
  const { t } = useTranslation();

  const statusText = !selectedGroup && selectedUser
    ? selectedUser.isOnline
      ? t("chat.header.online")
      : formatLastSeen(selectedUser.lastSeen, t)
    : null;

  return (
    <div className="bg-slate-950/80 px-6 py-4 flex items-center justify-between gap-3 shadow-md border-b border-white/10">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-950 font-bold">
          {chatAvatar}
        </div>
        <div className="min-w-0">
          <h2 className="text-white font-semibold text-lg truncate">{chatTitle}</h2>
          {selectedGroup && <p className="text-emerald-300 text-xs">{t("chat.header.groupChat")}</p>}
          {statusText && (
            <p className={`text-xs ${selectedUser.isOnline ? "text-emerald-400" : "text-slate-400"}`}>
              {statusText}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {(selectedGroup || selectedUser) && (
          <button
            type="button"
            onClick={onClearChat}
            title={t("chat.header.clearChat")}
            className="text-xs font-semibold text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-400/40 rounded-full px-3 py-2 transition"
          >
            {t("chat.header.clearChat")}
          </button>
        )}

        {selectedGroup && isGroupAdmin && (
          <button
            type="button"
            onClick={onDeleteGroup}
            title={t("groups.deleteGroupButton")}
            className="text-xs font-semibold text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 rounded-full px-3 py-2 transition"
          >
            {t("groups.deleteGroupButton")}
          </button>
        )}
      </div>
    </div>
  );
};
