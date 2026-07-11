import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../Api/axios";
import { ChatHeader } from "../components/chat/ChatHeader";
import { ChatMessageList } from "../components/chat/ChatMessageList";
import { ChatMessageInput } from "../components/chat/ChatMessageInput";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { CreateGroupModal } from "../components/chat/CreateGroupModal";

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
        // Runs once the socket actually connects, joins our personal room so private events can reach us
        socket.on("connect", () => {
            socket.emit("join-room", currentUserId);
        });

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
        };
    }, [socket, currentUserId]);

    // Runs once on page load to fetch users, groups, and messages
    useEffect(() => {
        getAllUsers();
        getAllGroups();
        getAllMessages();
    }, []);

    // Joins the socket room for every group whenever the group list changes
    useEffect(() => {
        if (groups.length > 0) {
            joinAllGroups(groups);
        }
    }, [groups]);

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
            : "اختار شخص عشان تبدأ الشات";

    const chatAvatar = selectedGroup
        ? selectedGroup.name?.[0]?.toUpperCase() || "#"
        : selectedUser?.name?.[0]?.toUpperCase() || "?";

    return (
        <div className="flex h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#02040d_0%,#070b18_100%)] text-slate-100">
            <div className="w-4/5 flex flex-col bg-slate-950/65 border-r border-white/10 backdrop-blur-xl">
                <ChatHeader chatAvatar={chatAvatar} chatTitle={chatTitle} selectedGroup={selectedGroup} />

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
                    message={message}
                    setMessage={setMessage}
                    onSubmit={handleSendMessage}
                    editingMessage={editingMessage}
                    onCancelEdit={cancelEdit}
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
            />
        </div>
    );
};
