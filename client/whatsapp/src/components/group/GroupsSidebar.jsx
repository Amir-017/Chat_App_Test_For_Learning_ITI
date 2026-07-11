export const GroupsSidebar = ({ groups, selectedGroup, onSelectGroup, onOpenCreate, currentUserId }) => {
  return (
    <div className="w-80 bg-slate-950/85 border-r border-white/10 flex flex-col backdrop-blur-xl">
      <div className="px-4 py-4 bg-slate-950/90 text-white flex items-center justify-between border-b border-white/10">
        <div>
          <h2 className="font-bold text-lg">Groups</h2>
          <p className="text-xs text-emerald-50">Manage rooms and members</p>
        </div>
        <button
          onClick={onOpenCreate}
          className="bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold px-3 py-2 rounded-full"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {groups.map((group) => (
          <button
            key={group._id}
            onClick={() => onSelectGroup(group)}
            className={`w-full text-left p-3 rounded-2xl border transition ${
              selectedGroup?._id === group._id
                ? "bg-emerald-500/15 border-emerald-400/30"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold">
                {group.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-100 truncate">{group.name}</div>
                <div className="text-xs text-slate-400">{group.members?.length || 0} members</div>
                {(group.removedMembers || []).some((member) => String(member._id || member) === currentUserId) && (
                  <div className="mt-1 inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                    removed
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};