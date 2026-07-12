export const GroupMembersPanel = ({
  selectedGroup,
  isAdmin,
  onRemoveMember,
  availableUsersToAdd,
  addMembers,
  toggleAddMember,
  onAddMembers,
}) => {
  console.log("selectedGroup:", selectedGroup);
  return (
    <div className="bg-slate-950/70 rounded-3xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.35)] overflow-y-auto p-5 space-y-5 backdrop-blur-xl">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-100">Group members</h3>
          {isAdmin && (
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
              Admin
            </span>
          )}
        </div>
        <div className="space-y-2">
          {(selectedGroup?.members || []).map((member) => (
            <div key={member._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                  {member.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-slate-100 truncate">{selectedGroup?.admin._id === member._id ? member.name +  " (Admin)" : member.name}</div>
                  <div className="text-xs text-slate-400 truncate">{member.email}</div>
                </div>
              </div>
              {isAdmin && String(member._id) !== String(selectedGroup?.admin?._id || selectedGroup?.admin) && (
                <button onClick={() => onRemoveMember(member._id)} className="text-xs font-semibold text-rose-400 hover:text-rose-300">
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div>
          <h3 className="font-bold text-slate-100 mb-3">Add members</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {availableUsersToAdd.map((user) => (
              <label key={user._id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 cursor-pointer hover:bg-white/10">
                <input
                  type="checkbox"
                  className="accent-emerald-400"
                  checked={addMembers.includes(user._id)}
                  onChange={() => toggleAddMember(user._id)}
                />
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-100 truncate">{user.name}</div>
                  <div className="text-xs text-slate-400 truncate">{user.email}</div>
                </div>
              </label>
            ))}
            {availableUsersToAdd.length === 0 && (
              <div className="text-xs text-slate-400">No users available to add</div>
            )}
          </div>
          <button
            onClick={onAddMembers}
            className="mt-3 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 py-3 text-sm font-semibold"
          >
            Add selected users
          </button>
        </div>
      )}
    </div>
  );
};