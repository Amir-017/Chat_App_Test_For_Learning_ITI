import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../Api/axios";

export const GroupsPage = () => {
  const socket = useMemo(() => io("http://localhost:3000"), []);
  const inputRef = useRef(null);

  const currentUserId = String(JSON.parse(localStorage.getItem("user")));

  const [allUsers, setAllUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [createMembers, setCreateMembers] = useState([]);
  const [addMembers, setAddMembers] = useState([]);

  const isAdmin = selectedGroup && String(selectedGroup.admin?._id || selectedGroup.admin) === currentUserId;
  const isRemovedFromSelectedGroup = selectedGroup && (selectedGroup.removedMembers || []).some((member) => String(member._id || member) === currentUserId);

  const selectedGroupMessages = selectedGroup
    ? allMessages.filter(
        (msg) => msg.conversationType === "group" && String(msg.group) === String(selectedGroup._id)
      )
    : [];

  const availableUsersToCreate = allUsers.filter((user) => String(user._id) !== currentUserId);
  const availableUsersToAdd = allUsers.filter((user) => {
    if (!selectedGroup) return false;
    const memberIds = (selectedGroup.members || []).map((member) => String(member._id || member));
    return String(user._id) !== currentUserId && !memberIds.includes(String(user._id));
  });

  const fetchInitialData = async () => {
    const [usersRes, groupsRes, messagesRes] = await Promise.all([
      api.get("api/users"),
      api.get("api/groups"),
      api.get("api/messages"),
    ]);

    setAllUsers(usersRes.data.users || []);
    setGroups(groupsRes.data.groups || []);
    setAllMessages(messagesRes.data || []);

    const firstGroup = groupsRes.data.groups?.[0];
    if (firstGroup) {
      setSelectedGroup(firstGroup);
      socket.emit("join-group", firstGroup._id);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("join-room", currentUserId);
    });

    socket.on("group-message", (msg) => {
      setAllMessages((prev) => [...prev, msg]);
    });

    socket.on("message-edited", ({ messageId, newMessage }) => {
      setAllMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, message: newMessage, isEdited: true } : msg
        )
      );
    });

    socket.on("message-deleted", ({ messageId }) => {
      setAllMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, isDeleted: true } : msg))
      );
    });

    socket.on("group-created", (group) => {
      setGroups((prev) => {
        if (prev.some((existing) => existing._id === group._id)) {
          return prev;
        }
        return [group, ...prev];
      });
    });

    socket.on("group-updated", (group) => {
      setGroups((prev) => {
        const exists = prev.some((existing) => existing._id === group._id);
        if (!exists) {
          return [group, ...prev];
        }
        return prev.map((existing) => (existing._id === group._id ? group : existing));
      });

      const groupMemberIds = (group.members || []).map((member) => String(member._id || member));
      const removedMemberIds = (group.removedMembers || []).map((member) => String(member._id || member));

      setSelectedGroup((prev) => {
        if (prev && prev._id === group._id && !groupMemberIds.includes(currentUserId) && removedMemberIds.includes(currentUserId)) {
          socket.emit("leave-group", group._id);
        }

        return prev && prev._id === group._id ? group : prev;
      });
    });

    return () => {
      socket.off("group-message");
      socket.off("message-edited");
      socket.off("message-deleted");
      socket.off("group-created");
      socket.off("group-updated");
    };
  }, [socket, currentUserId]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroup?._id) {
      socket.emit("join-group", selectedGroup._id);
    }
  }, [selectedGroup, socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedGroup || !message.trim() || isRemovedFromSelectedGroup) return;

    if (editingMessage) {
      socket.emit("edit-message", {
        messageId: editingMessage._id,
        newMessage: message.trim(),
      });
      setEditingMessage(null);
      setMessage("");
      return;
    }

    socket.emit("send-group-message", {
      message: message.trim(),
      groupId: selectedGroup._id,
      sender: currentUserId,
    });
    setMessage("");
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const { data } = await api.post("api/groups", {
      name: groupName.trim(),
      members: createMembers,
    });

    setIsCreateOpen(false);
    setGroupName("");
    setCreateMembers([]);
    setGroups((prev) => [data.group, ...prev.filter((group) => group._id !== data.group._id)]);
    setSelectedGroup(data.group);
    socket.emit("join-group", data.group._id);
  };

  const handleAddMembers = async () => {
    if (!selectedGroup || !addMembers.length) return;

    const { data } = await api.post(`api/groups/${selectedGroup._id}/members`, {
      members: addMembers,
    });

    setAddMembers([]);
    setGroups((prev) => prev.map((group) => (group._id === data.group._id ? data.group : group)));
    setSelectedGroup(data.group);
  };

  const handleRemoveMember = async (memberId) => {
    if (!selectedGroup) return;

    const { data } = await api.delete(`api/groups/${selectedGroup._id}/members/${memberId}`);
    setGroups((prev) => prev.map((group) => (group._id === data.group._id ? data.group : group)));
    setSelectedGroup(data.group);
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setMessage(msg.message);
    inputRef.current?.focus();
  };

  const toggleCreateMember = (memberId) => {
    setCreateMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const toggleAddMember = (memberId) => {
    setAddMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setMessage("");
  };

    return (
    <div className="flex h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#02040d_0%,#070b18_100%)] text-slate-100">
      <div className="w-80 bg-slate-950/85 border-r border-white/10 flex flex-col backdrop-blur-xl">
        <div className="px-4 py-4 bg-slate-950/90 text-white flex items-center justify-between border-b border-white/10">
          <div>
            <h2 className="font-bold text-lg">Groups</h2>
            <p className="text-xs text-emerald-50">Manage rooms and members</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold px-3 py-2 rounded-full"
          >
            + New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {groups.map((group) => (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full text-left p-3 rounded-2xl border transition ${selectedGroup?._id === group._id
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

      <div className="flex-1 flex flex-col">
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

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-4 p-4 overflow-hidden">
          <div className="bg-slate-950/65 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.35)] border border-white/10 flex flex-col overflow-hidden backdrop-blur-xl">
            {isRemovedFromSelectedGroup && (
              <div className="mx-5 mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                انت اتحذفت من الجروب ده ومش هتقدر تبعت رسائل تاني.
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {selectedGroupMessages.map((msg) => {
                const isSender = String(msg.sender) === currentUserId;
                return (
                  <div key={msg._id} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isSender ? "bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-tr-none text-slate-950" : "bg-slate-900/80 border border-white/10 rounded-tl-none text-slate-100"}`}>
                      {!isSender && selectedGroup && (
                        <div className="text-[11px] font-semibold text-emerald-300/80 mb-1">
                          {allUsers.find((user) => String(user._id) === String(msg.sender))?.name || "Unknown"}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words text-inherit">{msg.message}</p>
                      {msg.isEdited && <div className="mt-1 text-[10px] italic text-slate-400 text-right">edited</div>}
                      {msg.isDeleted && <div className="mt-1 text-[10px] italic text-slate-400 text-right">deleted</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="bg-slate-950/90 px-4 py-3 border-t border-white/10 flex items-center gap-3">
              {editingMessage && (
                <button type="button" onClick={cancelEdit} className="text-xs font-semibold text-rose-400 hover:text-rose-300">
                  Cancel edit
                </button>
              )}
              <input
                ref={inputRef}
                type="text"
                value={message}
                disabled={!selectedGroup || isRemovedFromSelectedGroup}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={editingMessage ? "Edit message..." : isRemovedFromSelectedGroup ? "You were removed from this group" : "Write in this group..."}
                className="flex-1 bg-white/5 text-slate-100 placeholder:text-slate-500 rounded-full px-5 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
              />
              <button type="submit" className="bg-gradient-to-br from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 w-11 h-11 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                {editingMessage ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" /></svg>
                ) : (
                  <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                )}
              </button>
            </form>
          </div>

          <div className="bg-slate-950/70 rounded-3xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.35)] overflow-y-auto p-5 space-y-5 backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-100">Group members</h3>
                {isAdmin && <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">Admin</span>}
              </div>
              <div className="space-y-2">
                {(selectedGroup?.members || []).map((member) => (
                  <div key={member._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                        {member.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-100 truncate">{member.name}</div>
                        <div className="text-xs text-slate-400 truncate">{member.email}</div>
                      </div>
                    </div>
                    {isAdmin && String(member._id) !== String(selectedGroup?.admin?._id || selectedGroup?.admin) && (
                      <button onClick={() => handleRemoveMember(member._id)} className="text-xs font-semibold text-rose-400 hover:text-rose-300">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isAdmin && (
              <>
                <div>
                  <h3 className="font-bold text-slate-100 mb-3">Add members</h3>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {availableUsersToAdd.map((user) => (
                      <label key={user._id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 cursor-pointer hover:bg-white/10">
                        <input type="checkbox" className="accent-emerald-400" checked={addMembers.includes(user._id)} onChange={() => toggleAddMember(user._id)} />
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold">{user.name?.[0]?.toUpperCase()}</div>
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
                  <button onClick={handleAddMembers} className="mt-3 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 py-3 text-sm font-semibold">
                    Add selected users
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-[28px] bg-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Create Group</h3>
                <p className="text-xs text-slate-400">Pick a name and initial members</p>
              </div>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-2xl leading-none text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Group name</label>
                <input value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70" placeholder="e.g. Project Team" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">Initial members</label>
                  <span className="text-xs text-slate-500">{createMembers.length} selected</span>
                </div>
                <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
                  {availableUsersToCreate.map((user) => (
                    <label key={user._id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/10 cursor-pointer">
                      <input type="checkbox" className="accent-emerald-400" checked={createMembers.includes(user._id)} onChange={() => toggleCreateMember(user._id)} />
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold">{user.name?.[0]?.toUpperCase()}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-100 truncate">{user.name}</div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-2xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-sm font-semibold hover:from-emerald-400 hover:to-cyan-400">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};