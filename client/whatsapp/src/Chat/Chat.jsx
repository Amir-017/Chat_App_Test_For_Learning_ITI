import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../Api/axios";
import { ChatHeader } from "../components/chat/ChatHeader";
import { ChatMessageList } from "../components/chat/ChatMessageList";
import { ChatMessageInput } from "../components/chat/ChatMessageInput";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { CreateGroupModal } from "../components/chat/CreateGroupModal";
import { useAuthedSocket } from "../hooks/useAuthedSocket";
import { confirmDialog } from "../shared/confirmDialog";

export const Chat = () => {
    const { t } = useTranslation();
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);
    const [allusers, setAllUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupMembers, setGroupMembers] = useState([]);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const inputRef = useRef(null);
    const imageInputRef = useRef(null);
    const { socket, currentUserId, isReady } = useAuthedSocket();
    const isRemovedFromSelectedGroup = selectedGroup && selectedGroup.removedMembers.some((member) => String(member) === currentUserId);
    const getUserName = (userId) => {
        return allusers.find((user) => String(user._id) === String(userId))?.name || "Unknown";
    };

    // Joins the socket room for every group in the list, used on load and whenever the group list changes
    const joinAllGroups = (groupList) => {
        groupList.forEach((group) => {
            socket.emit("join-group", group._id);
        });
    };

    // Sets up all socket listeners (new messages, edits, deletes, group changes) and cleans them up on unmount
    useEffect(() => {
        if (!socket) return;

        // A new direct message was sent to us - add it to our messages list
        socket.on("receive-message", (messageData) => {
            setAllMessages((prev) => [...prev, messageData]);
        });

        // A new message was sent in a group we're part of - add it to our messages list
        socket.on("group-message", (messageData) => {
            setAllMessages((prev) => [...prev, messageData]);
        });

        // Someone edited a message - update its text and mark it as edited in our local list
        socket.on("message-edited", ({ messageId, newMessage }) => {
            setAllMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, message: newMessage, isEdited: true, editedAt: new Date().toISOString() }
                        : msg
                )
            );
        });

        // Someone deleted a message - mark it as deleted locally (soft delete, not removed)
        socket.on("message-deleted", ({ messageId }) => {
            setAllMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? { ...msg, isDeleted: true } : msg))
            );
        });

        // A new group was created and we're a member - add it to our groups list and join its room
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

        // A group's members changed - sync our local copy, or drop it and leave the room if we got removed
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

        // We cleared a chat (direct or group) - drop every message of that conversation from our local list.
        // This only ever runs for the user who requested the clear, so it's safe to just filter locally.
        socket.on("chat-cleared", ({ conversationType, targetId }) => {
            setAllMessages((prev) =>
                prev.filter((msg) => {
                    if (conversationType === "group") {
                        return !(msg.conversationType === "group" && String(msg.group) === String(targetId));
                    }

                    const isDirectMessage = !msg.conversationType || msg.conversationType === "direct";
                    const isBetweenUsers =
                        (String(msg.sender) === currentUserId && String(msg.receiver) === String(targetId)) ||
                        (String(msg.sender) === String(targetId) && String(msg.receiver) === currentUserId);

                    return !(isDirectMessage && isBetweenUsers);
                })
            );
        });

        socket.on("clear-chat-error", ({ error }) => {
            console.error(error);
        });

        // Someone came online or went offline - sync their status in the users list and the open chat header.
        // lastSeen is only sent when going offline, so merge it in only when present (going online must not
        // wipe out the last known lastSeen with undefined).
        socket.on("user-status-changed", ({ userId, isOnline, lastSeen }) => {
            const patch = lastSeen !== undefined ? { isOnline, lastSeen } : { isOnline };

            setAllUsers((prev) =>
                prev.map((user) => (String(user._id) === String(userId) ? { ...user, ...patch } : user))
            );
            setSelectedUser((prev) =>
                prev && String(prev._id) === String(userId) ? { ...prev, ...patch } : prev
            );
        });

        // Cleanup: remove all these listeners when the component unmounts or this effect re-runs
        return () => {
            socket.off("receive-message");
            socket.off("group-message");
            socket.off("message-edited");
            socket.off("message-deleted");
            socket.off("group-created");
            socket.off("group-updated");
            socket.off("message-delete-error");
            socket.off("message-edit-error");
            socket.off("user-status-changed");
            socket.off("chat-cleared");
            socket.off("clear-chat-error");
        };
    }, [socket, currentUserId]);

    // Runs once the socket/user are ready to fetch users, groups, and messages
    useEffect(() => {
        if (!isReady) return;
        getAllUsers();
        getAllGroups();
        getAllMessages();
    }, [isReady]);

    // Joins the socket room for every group whenever the group list changes
    useEffect(() => {
        if (socket && groups.length > 0) {
            joinAllGroups(groups);
        }
    }, [socket, groups]);

    // Clears the input and any in-progress edit once no chat is selected
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

    // Switches to a direct chat with this user and resets the input/edit state
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSelectedGroup(null);
        setEditingMessage(null);
        setMessage("");
    }

    // Switches to this group chat and resets the input/edit state
    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        setSelectedUser(null);
        setEditingMessage(null);
        setMessage("");
    };

    // Sends a new message to the selected user or group, or saves changes if a message is being edited
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
            });
        } else {
            socket.emit("send-message", {
                message: message.trim(),
                receiver: selectedUser._id,
            });
        }

        setMessage("");
    };

    // Uploads an image to the selected user or group; the server saves it and broadcasts it over the socket
    const handleSendImage = async (file) => {
        if (!file || (!selectedUser && !selectedGroup) || (selectedGroup && isRemovedFromSelectedGroup)) return;

        const formData = new FormData();
        formData.append("image", file);
        if (selectedGroup) {
            formData.append("groupId", selectedGroup._id);
        } else {
            formData.append("receiver", selectedUser._id);
        }

        await api.post("api/messages/upload-image", formData);
    };

    // Puts a message into "edit mode" and focuses the input box
    const handleEditMessage = (msg) => {
        setEditingMessage(msg);
        setMessage(msg.message);
        window.requestAnimationFrame(() => inputRef.current?.focus());
    };

    // Adds or removes a user from the "create group" member selection
    const handleGroupMemberToggle = (userId) => {
        setGroupMembers((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId);
            }

            return [...prev, userId];
        });
    };

    // Creates a new group with the chosen name and members, then opens it
    const handleCreateGroup = async (e) => {
        e.preventDefault();

        if (!groupName.trim() || groupMembers.length === 0 || isCreatingGroup) return;

        setIsCreatingGroup(true);
        try {
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
        } finally {
            setIsCreatingGroup(false);
        }
    };

    // Clears every message of the current conversation, for this user only, after confirmation
    const handleClearChat = async () => {
        if (!selectedUser && !selectedGroup) return;

        const confirmed = await confirmDialog({
            title: t("chat.header.clearChat"),
            text: t("chat.header.confirmClearChat"),
            confirmText: t("chat.header.clearChat"),
            cancelText: t("common.cancel"),
        });
        if (!confirmed) return;

        if (selectedGroup) {
            socket.emit("clear-chat", { conversationType: "group", targetId: selectedGroup._id });
        } else {
            socket.emit("clear-chat", { conversationType: "direct", targetId: selectedUser._id });
        }
    };

    // Cancels edit mode and clears the input box
    const cancelEdit = () => {
        setEditingMessage(null);
        setMessage("");
    };

    // Filters all messages down to only the ones for the currently selected user or group
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
            : t("chat.chooseChat");

    const chatAvatar = selectedGroup
        ? selectedGroup.name?.[0]?.toUpperCase() || "#"
        :selectedUser?.imageUrl ? (
            <img
                src={selectedUser.imageUrl}
                alt={selectedUser.name}
                className="w-10 h-10 rounded-full object-cover"
            />
        ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-slate-950 font-bold">
                {selectedUser?.name?.[0]?.toUpperCase() || "?"}
            </div>
        );

    if (!isReady) {
        return (
            <div className="flex h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#02040d_0%,#070b18_100%)] text-slate-100">
                {t("common.loading")}
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#02040d_0%,#070b18_100%)] text-slate-100">
            <div className="w-4/5 flex flex-col bg-slate-950/65 border-e border-white/10 backdrop-blur-xl">
                <ChatHeader
                    chatAvatar={chatAvatar}
                    chatTitle={chatTitle}
                    selectedGroup={selectedGroup}
                    selectedUser={selectedUser}
                    onClearChat={handleClearChat}
                />

                <ChatMessageList
                    messages={activeMessages}
                    currentUserId={currentUserId}
                    getUserName={getUserName}
                    socket={socket}
                    setAllMessages={setAllMessages}
                    selectedUser={selectedUser}
                    onEdit={handleEditMessage}
                />

                <ChatMessageInput
                    inputRef={inputRef}
                    imageInputRef={imageInputRef}
                    message={message}
                    setMessage={setMessage}
                    onSubmit={handleSendMessage}
                    editingMessage={editingMessage}
                    onCancelEdit={cancelEdit}
                    onSendImage={handleSendImage}
                    selectedUser={selectedUser}
                    selectedGroup={selectedGroup}
                    isRemovedFromSelectedGroup={isRemovedFromSelectedGroup}
                />
            </div>

            <ChatSidebar
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={handleSelectGroup}
                users={allusers}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
                onOpenCreateGroup={() => setIsGroupModalOpen(true)}
            />

            <CreateGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                groupName={groupName}
                setGroupName={setGroupName}
                users={allusers.filter((user) => String(user._id) !== currentUserId)}
                groupMembers={groupMembers}
                onToggleMember={handleGroupMemberToggle}
                onSubmit={handleCreateGroup}
                isSubmitting={isCreatingGroup}
            />
        </div>
    );
};
