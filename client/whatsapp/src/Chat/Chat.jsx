import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import MessageOptions from "./MessageOption";
import api from "../Api/axios";

export const Chat = () => {
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);
    const [allusers, setAllUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupMembers, setGroupMembers] = useState([]);
    const [editingMessage, setEditingMessage] = useState(null);
    const inputRef = useRef(null);
    const socket = useMemo(() => io("http://localhost:3000"), []);
    const currentUserId = String(JSON.parse(localStorage.getItem("user")));

    const getUserName = (userId) => {
        return allusers.find((user) => String(user._id) === String(userId))?.name || "Unknown";
    };

    const joinAllGroups = (groupList) => {
        groupList.forEach((group) => {
            socket.emit("join-group", group._id);
        });
    };

    useEffect(() => {
        socket.on("connect", () => {
            socket.emit("join-room", currentUserId);
        });

        socket.on("receive-message", (messageData) => {
            setAllMessages((prev) => [...prev, messageData]);
        });

        socket.on("group-message", (messageData) => {
            setAllMessages((prev) => [...prev, messageData]);
        });

        socket.on("message-edited", ({ messageId, newMessage }) => {
            setAllMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, message: newMessage, isEdited: true, editedAt: new Date().toISOString() }
                        : msg
                )
            );
        });

        socket.on("message-deleted", ({ messageId }) => {
            setAllMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? { ...msg, isDeleted: true } : msg))
            );
        });

        socket.on("group-created", (group) => {
            const groupMemberIds = (group.members || []).map((member) => String(member._id || member));

            if (!groupMemberIds.includes(currentUserId)) {
                return;
            }

            setGroups((prev) => {
                const exists = prev.some((existingGroup) => existingGroup._id === group._id);
                return exists ? prev : [group, ...prev];
            });

            socket.emit("join-group", group._id);
        });

        socket.on("group-updated", (group) => {
            const groupMemberIds = (group.members || []).map((member) => String(member._id || member));

            if (!groupMemberIds.includes(currentUserId)) {
                setGroups((prev) => prev.filter((existing) => existing._id !== group._id));
                socket.emit("leave-group", group._id);
                return;
            }

            setGroups((prev) => {
                const exists = prev.some((existingGroup) => existingGroup._id === group._id);
                return exists
                    ? prev.map((existingGroup) => (existingGroup._id === group._id ? group : existingGroup))
                    : [group, ...prev];
            });

            socket.emit("join-group", group._id);
        });

        socket.on("message-delete-error", ({ error }) => {
            console.error(error);
        });

        socket.on("message-edit-error", ({ error }) => {
            console.error(error);
        });

        return () => {
            socket.off("receive-message");
            socket.off("group-message");
            socket.off("message-edited");
            socket.off("message-deleted");
            socket.off("group-created");
            socket.off("group-updated");
            socket.off("message-delete-error");
            socket.off("message-edit-error");
        };
    }, [socket, currentUserId]);

    useEffect(() => {
        getAllUsers();
        getAllGroups();
        getAllMessages();
    }, []);

    useEffect(() => {
        if (groups.length > 0) {
            joinAllGroups(groups);
        }
    }, [groups]);

    useEffect(() => {
        if (!selectedUser && !selectedGroup) {
            setEditingMessage(null);
            setMessage("");
        }
    }, [selectedUser, selectedGroup]);

    const getAllUsers = async () => {
        const { data } = await api.get("api/users");
        setAllUsers(data.users);
    };

    const getAllGroups = async () => {
        const { data } = await api.get("api/groups");
        setGroups(data.groups || []);
    };

    const getAllMessages = async () => {
        const { data } = await api.get("api/messages");
        setAllMessages(data);
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSelectedGroup(null);
        setEditingMessage(null);
        setMessage("");
}
    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        setSelectedUser(null);
        setEditingMessage(null);
        setMessage("");
    };

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (message.trim() === "" || (!selectedUser && !selectedGroup)) return;

        if (editingMessage) {
            socket.emit("edit-message", {
                messageId: editingMessage._id,
                newMessage: message.trim(),
            });
            setEditingMessage(null);
            setMessage("");
            return;
        }

        if (selectedGroup) {
            socket.emit("send-group-message", {
                message: message.trim(),
                groupId: selectedGroup._id,
                sender: currentUserId,
            });
        } else {
            socket.emit("send-message", {
                message: message.trim(),
                receiver: selectedUser._id,
                sender: currentUserId,
            });
        }

        setMessage("");
    };

    const handleEditMessage = (msg) => {
        setEditingMessage(msg);
        setMessage(msg.message);
        window.requestAnimationFrame(() => inputRef.current?.focus());
    };

    const handleGroupMemberToggle = (userId) => {
        setGroupMembers((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId);
            }

            return [...prev, userId];
        });
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();

        if (!groupName.trim() || groupMembers.length === 0) return;

        const { data } = await api.post("api/groups", {
            name: groupName.trim(),
            members: groupMembers,
        });

        const createdGroup = data.group;
        setGroups((prev) => [createdGroup, ...prev.filter((group) => group._id !== createdGroup._id)]);
        socket.emit("join-group", createdGroup._id);
        setSelectedGroup(createdGroup);
        setSelectedUser(null);
        setGroupName("");
        setGroupMembers([]);
        setIsGroupModalOpen(false);
    };

    const cancelEdit = () => {
        setEditingMessage(null);
        setMessage("");
    };

    const activeMessages = selectedGroup
        ? allMessages.filter(
            (msg) =>
                msg.conversationType === "group" &&
                String(msg.group) === String(selectedGroup._id)
        )
        : selectedUser
            ? allMessages.filter(
                (msg) =>
                    (!msg.conversationType || msg.conversationType === "direct") &&
                    ((String(msg.sender) === currentUserId && String(msg.receiver) === String(selectedUser._id)) ||
                        (String(msg.sender) === String(selectedUser._id) && String(msg.receiver) === currentUserId))
            )
            : [];

    const chatTitle = selectedGroup
        ? selectedGroup.name
        : selectedUser
            ? selectedUser.name
            : "اختار شخص عشان تبدأ الشات";

    const chatAvatar = selectedGroup
        ? selectedGroup.name?.[0]?.toUpperCase() || "#"
        : selectedUser?.name?.[0]?.toUpperCase() || "?";

        console.log("selectedGroup:", selectedGroup);
        console.log("selectedUser:", selectedUser);
    return (
        <div className="flex h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#02040d_0%,#070b18_100%)] text-slate-100">
            <div className="w-4/5 flex flex-col bg-slate-950/65 border-r border-white/10 backdrop-blur-xl">
                <div className="bg-slate-950/80 px-6 py-4 flex items-center gap-3 shadow-md border-b border-white/10">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-950 font-bold">
                        {chatAvatar}
                    </div>
                    <div>
                        <h2 className="text-white font-semibold text-lg">{chatTitle}</h2>
                        {selectedGroup && <p className="text-emerald-300 text-xs">Group chat</p>}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_20%)]">
                    {activeMessages.map((msg, index) => {
                        const isSender = String(msg.sender) === currentUserId;
                        const isGroupMessage = msg.conversationType === "group";

                        return (
                            <div
                                key={msg._id || index}
                                className={`w-full flex items-center gap-2 group ${isSender ? "justify-end" : "justify-start"}`}
                            >
                                <MessageOptions
                                    openUpward={index > 2}
                                    message={msg}
                                    setCheckDelete={() => { }}
                                    setAllMessages={setAllMessages}
                                    socket={socket}
                                    selectedUser={selectedUser}
                                    onEdit={handleEditMessage}
                                />

                                {msg.isDeleted ? (
                                    <p className="px-4 py-2 max-w-xs italic text-sm text-slate-400 bg-white/5 rounded-2xl border border-white/10">
                                        تم حذف هذه الرسالة
                                    </p>
                                ) : isGroupMessage ? (
                                    <div className={`flex flex-col max-w-[75%] ${isSender ? "" : "items-start"}`}>
                                        {!isSender && (
                                            <div className="px-2 pb-1 text-[11px] font-semibold text-emerald-300/80">
                                                {getUserName(msg.sender)}
                                            </div>
                                        )}
                                        <div className={`min-w-0 rounded-2xl px-4 py-2 shadow-sm ${isSender ? "bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-tr-none text-slate-950" : "bg-slate-900/80 border border-white/10 rounded-tl-none text-slate-100"}`}>
                                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">
                                                {msg.message}
                                            </p>
                                            {msg.isEdited && (
                                                <div className={`mt-1 text-[10px] italic ${isSender ? "text-slate-900/60" : "text-slate-400"} text-right`}>
                                                    edited
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : isSender ? (
                                    <div className="flex justify-end ">
                                        <div className="min-w-0 rounded-2xl rounded-tr-none bg-gradient-to-br from-emerald-500 to-cyan-500 px-4 py-2 shadow-lg text-slate-950">
                                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">
                                                {msg.message}
                                            </p>
                                            {msg.isEdited && (
                                                <div className="mt-1 text-[10px] italic text-slate-900/60 text-right">
                                                    edited
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-start max-w-[75%]">
                                        <div className="min-w-0 rounded-2xl rounded-tl-none bg-slate-900/80 px-4 py-2 shadow-lg text-slate-100 border border-white/10">
                                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">
                                                {msg.message}
                                            </p>
                                            {msg.isEdited && (
                                                <div className="mt-1 text-[10px] italic text-slate-400 text-right">
                                                    edited
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={handleSendMessage} className="bg-slate-950/80 px-4 py-3 flex items-center gap-3 border-t border-white/10 backdrop-blur-xl">
                    {editingMessage && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                        >
                            Cancel edit
                        </button>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        disabled={!selectedUser && !selectedGroup}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={editingMessage ? "عدّل الرسالة..." : selectedGroup ? "اكتب في الجروب..." : "اكتب رسالة..."}
                        className="flex-1 bg-white/5 text-slate-100 placeholder:text-slate-500 rounded-full px-5 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-br from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 w-11 h-11 rounded-full flex items-center justify-center transition shadow-lg shadow-emerald-500/20"
                    >
                        {editingMessage ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 5v14m-7-7h14" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        )}
                    </button>
                </form>
            </div>

            <div className="w-1/5 bg-slate-950/85 border-l border-white/10 flex flex-col backdrop-blur-xl">
                <div className="bg-slate-950/90 px-4 py-4 flex items-center justify-between gap-3 border-b border-white/10">
                    <h2 className="text-white font-bold text-lg">المحادثات</h2>
                    <button
                        type="button"
                        onClick={() => setIsGroupModalOpen(true)}
                        className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
                    >
                        + Group
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Groups</h3>
                        <div className="space-y-2">
                            {groups.map((group) => (
                                <button
                                    type="button"
                                    key={group._id}
                                    onClick={() => handleSelectGroup(group)}
                                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl transition border ${selectedGroup?._id === group._id
                                        ? "bg-emerald-500/15 border-emerald-400/30"
                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                                        {group.name?.[0]?.toUpperCase() || "#"}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-slate-100 truncate">{group.name}</div>
                                        <div className="text-[11px] text-slate-400">
                                            {group.members?.length || 0} members
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {groups.length === 0 && (
                                <div className="text-xs text-slate-400 px-1">No groups yet</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 px-4 py-4 border-t border-white/10">
                        <h2 className="text-white font-bold text-lg">Direct Chats</h2>
                    </div>

                    {allusers.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => handleSelectUser(user)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-white/10 hover:bg-white/5 transition ${selectedUser?._id === user._id ? "bg-emerald-500/15" : ""
                                }`}
                        >
                            <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-slate-950 font-bold shrink-0">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-slate-100 font-medium truncate">{user.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {isGroupModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-[28px] bg-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10">
                        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">Create Group</h3>
                                <p className="text-xs text-slate-400">Choose a name and members</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsGroupModalOpen(false)}
                                className="text-slate-400 hover:text-white text-2xl leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleCreateGroup} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Group name</label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="e.g. Project Team"
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-300">Members</label>
                                    <span className="text-xs text-slate-500">{groupMembers.length} selected</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
                                    {allusers
                                        .filter((user) => String(user._id) !== currentUserId)
                                        .map((user) => (
                                            <label
                                                key={user._id}
                                                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/10 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={groupMembers.includes(user._id)}
                                                    onChange={() => handleGroupMemberToggle(user._id)}
                                                    className="h-4 w-4 accent-emerald-400"
                                                />
                                                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                                                    {user.name?.[0]?.toUpperCase()}
                                                </span>
                                                <span className="text-sm font-medium text-slate-100">{user.name}</span>
                                            </label>
                                        ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGroupModalOpen(false)}
                                    className="px-4 py-2 rounded-2xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-sm font-semibold hover:from-emerald-400 hover:to-cyan-400"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};