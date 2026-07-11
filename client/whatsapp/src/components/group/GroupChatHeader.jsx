export const GroupChatHeader = ({ selectedGroup, isRemovedFromSelectedGroup }) => {
  return (
    <div className="bg-slate-950/80 text-white px-6 py-4 shadow-md border-b border-white/10 backdrop-blur-xl">
      <h1 className="font-bold text-xl">{selectedGroup?.name || "Select a group"}</h1>
      <p className="text-xs text-emerald-50">
        {selectedGroup
          ? isRemovedFromSelectedGroup
            ? "You were removed from this group"
            : "Group chat and member management"
          : "Choose a group from the list"}
      </p>
    </div>
  );
};