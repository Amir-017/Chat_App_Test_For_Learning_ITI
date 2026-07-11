export const ChatHeader = ({ chatAvatar, chatTitle, selectedGroup }) => {
  return (
    <div className="bg-slate-950/80 px-6 py-4 flex items-center gap-3 shadow-md border-b border-white/10">
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-950 font-bold">
        {chatAvatar}
      </div>
      <div>
        <h2 className="text-white font-semibold text-lg">{chatTitle}</h2>
        {selectedGroup && <p className="text-emerald-300 text-xs">Group chat</p>}
      </div>
    </div>
  );
};
