// Turns a lastSeen timestamp into a WhatsApp-style "last seen ..." string
const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return null;

  const diffMs = Date.now() - new Date(lastSeen).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "last seen just now";
  if (diffMins < 60) return `last seen ${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `last seen ${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "last seen yesterday";

  return `last seen ${new Date(lastSeen).toLocaleDateString()}`;
};

export const ChatHeader = ({ chatAvatar, chatTitle, selectedGroup, selectedUser }) => {
  const statusText = !selectedGroup && selectedUser
    ? selectedUser.isOnline
      ? "Online"
      : formatLastSeen(selectedUser.lastSeen)
    : null;

  return (
    <div className="bg-slate-950/80 px-6 py-4 flex items-center gap-3 shadow-md border-b border-white/10">
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-950 font-bold">
        {chatAvatar}
      </div>
      <div>
        <h2 className="text-white font-semibold text-lg">{chatTitle}</h2>
        {selectedGroup && <p className="text-emerald-300 text-xs">Group chat</p>}
        {statusText && (
          <p className={`text-xs ${selectedUser.isOnline ? "text-emerald-400" : "text-slate-400"}`}>
            {statusText}
          </p>
        )}
      </div>
    </div>
  );
};
