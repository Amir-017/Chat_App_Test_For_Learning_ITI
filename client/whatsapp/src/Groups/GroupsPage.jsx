import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../Api/axios";
import { CreateGroupModal } from "../components/group/CreateGroupModel";
import { GroupsSidebar } from "../components/group/GroupsSidebar";
import { GroupMembersPanel } from "../components/group/GroupMembersPanel";
import { GroupChatHeader } from "../components/group/GroupChatHeader";
import { GroupMessageList } from "../components/group/GroupMessageList";
import { GroupMessageInput } from "../components/group/GroupMessageInput";
import { useAuthedSocket } from "../hooks/useAuthedSocket";

export const GroupsPage = () => {
    const { t } = useTranslation();
    const { socket, currentUserId, isReady } = useAuthedSocket();
    const inputRef = useRef(null);
    const imageInputRef = useRef(null);
    const [allUsers, setAllUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [allMessages, setAllMessages] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [message, setMessage] = useState("");
    const [editingMessage, setEditingMessage] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [createMembers, setCreateMembers] = useState([]);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
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

    // Fetches users, groups, and messages when the page first loads, then selects the first group and joins its room
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

    // Sets up all socket listeners (new messages, edits, deletes, group changes) and cleans them up on unmount
    useEffect(() => {
        if (!socket) return;

        // A new message was sent in a group we're part of - add it to our messages list
        socket.on("group-message", (msg) => {
            setAllMessages((prev) => [...prev, msg]);
        });

        // Someone edited a message - update its text and mark it as edited in our local list
        socket.on("message-edited", ({ messageId, newMessage }) => {
            setAllMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId ? { ...msg, message: newMessage, isEdited: true } : msg
                )
            );
        });

        // Someone deleted a message - mark it as deleted locally (soft delete, not removed)
        socket.on("message-deleted", ({ messageId }) => {
            setAllMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? { ...msg, isDeleted: true } : msg))
            );
        });

        // A new group was created and we're a member - add it to our groups list
        socket.on("group-created", (group) => {
            setGroups((prev) => {
                if (prev.some((existing) => existing._id === group._id)) {
                    return prev;
                }
                return [group, ...prev];
            });
        });

        // A group's members changed (someone added or removed) - sync our local copy of it
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
                // If we just got removed from the group we're currently viewing, leave its socket room
                if (prev && prev._id === group._id && !groupMemberIds.includes(currentUserId) && removedMemberIds.includes(currentUserId)) {
                    socket.emit("leave-group", group._id);
                }

                return prev && prev._id === group._id ? group : prev;
            });
        });

        // Cleanup: remove all these listeners when the component unmounts or this effect re-runs
        return () => {
            socket.off("group-message");
            socket.off("message-edited");
            socket.off("message-deleted");
            socket.off("group-created");
            socket.off("group-updated");
        };
    }, [socket, currentUserId]);

    // Runs once the socket/user are ready to fetch the initial data
    useEffect(() => {
        if (!isReady) return;
        fetchInitialData();
    }, [isReady]);

    // Joins the socket room for the selected group whenever it changes
    useEffect(() => {
        if (socket && selectedGroup?._id) {
            socket.emit("join-group", selectedGroup._id);
        }
    }, [selectedGroup, socket]);

    // Sends a new message, or saves changes if a message is being edited
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
        });
        setMessage("");
    };

    // Creates a new group with the chosen name and members, then opens it
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName.trim() || isCreatingGroup) return;

        setIsCreatingGroup(true);
        try {
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
        } finally {
            setIsCreatingGroup(false);
        }
    };

    // Adds the selected users to the currently open group
    const handleAddMembers = async () => {
        if (!selectedGroup || !addMembers.length) return;

        const { data } = await api.post(`api/groups/${selectedGroup._id}/members`, {
            members: addMembers,
        });

        setAddMembers([]);
        setGroups((prev) => prev.map((group) => (group._id === data.group._id ? data.group : group)));
        setSelectedGroup(data.group);
    };

    // Removes a single member from the currently open group
    const handleRemoveMember = async (memberId) => {
        if (!selectedGroup) return;

        const { data } = await api.delete(`api/groups/${selectedGroup._id}/members/${memberId}`);
        setGroups((prev) => prev.map((group) => (group._id === data.group._id ? data.group : group)));
        setSelectedGroup(data.group);
    };

    // Uploads an image to the currently open group; the server saves it and broadcasts it over the socket
    const handleSendImage = async (file) => {
        if (!file || !selectedGroup || isRemovedFromSelectedGroup) return;

        const formData = new FormData();
        formData.append("image", file);
        formData.append("groupId", selectedGroup._id);

        await api.post("api/messages/upload-image", formData);
    };

    // Puts a message into "edit mode" and focuses the input box
    const handleEditMessage = (msg) => {
        setEditingMessage(msg);
        setMessage(msg.message);
        inputRef.current?.focus();
    };

    // Adds or removes a user from the "create group" member selection
    const toggleCreateMember = (memberId) => {
        setCreateMembers((prev) =>
            prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
        );
    };

    // Adds or removes a user from the "add member" selection
    const toggleAddMember = (memberId) => {
        setAddMembers((prev) =>
            prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
        );
    };

    // Cancels edit mode and clears the input box
    const cancelEdit = () => {
        setEditingMessage(null);
        setMessage("");
    };

    if (!isReady) {
        return (
            <div className="flex h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#02040d_0%,#070b18_100%)] text-slate-100">
                {t("common.loading")}
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#02040d_0%,#070b18_100%)] text-slate-100">

            {/* sidebar */}
            <GroupsSidebar
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
                onOpenCreate={() => setIsCreateOpen(true)}
                currentUserId={currentUserId}
            />
            <div className="flex-1 flex flex-col">
                <GroupChatHeader selectedGroup={selectedGroup} isRemovedFromSelectedGroup={isRemovedFromSelectedGroup} />

                <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-4 p-4 overflow-hidden">
                    <div className="bg-slate-950/65 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.35)] border border-white/10 flex flex-col overflow-hidden backdrop-blur-xl">
                        {isRemovedFromSelectedGroup && (
                            <div className="mx-5 mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                                {t("groups.removedNotice")}
                            </div>
                        )}
                        <GroupMessageList
                            messages={selectedGroupMessages}
                            currentUserId={currentUserId}
                            allUsers={allUsers}
                            selectedGroup={selectedGroup}
                            socket={socket}
                            setAllMessages={setAllMessages}
                            onEdit={handleEditMessage}
                        />

                        <GroupMessageInput
                            inputRef={inputRef}
                            imageInputRef={imageInputRef}
                            message={message}
                            setMessage={setMessage}
                            onSubmit={handleSendMessage}
                            editingMessage={editingMessage}
                            onCancelEdit={cancelEdit}
                            onSendImage={handleSendImage}
                            selectedGroup={selectedGroup}
                            isRemovedFromSelectedGroup={isRemovedFromSelectedGroup}
                        />
                    </div>
                    {/* group members panel */}
                    <GroupMembersPanel
                        selectedGroup={selectedGroup}
                        isAdmin={isAdmin}
                        onRemoveMember={handleRemoveMember}
                        availableUsersToAdd={availableUsersToAdd}
                        addMembers={addMembers}
                        toggleAddMember={toggleAddMember}
                        onAddMembers={handleAddMembers}
                    />
                </div>
            </div>


            <CreateGroupModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                groupName={groupName}
                setGroupName={setGroupName}
                availableUsersToCreate={availableUsersToCreate}
                createMembers={createMembers}
                toggleCreateMember={toggleCreateMember}
                onSubmit={handleCreateGroup}
                isSubmitting={isCreatingGroup}
            />
        </div>
    );
};
