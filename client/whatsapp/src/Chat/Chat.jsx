import axios from "axios";
import { useEffect, useState, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import MessageOptions from "./MessageOption";
import api from "../Api/axios";

export const Chat = () => {
    // state variables
    const [message, setMessage] = useState('');
    const [allMessages, setAllMessages] = useState([]);
    const [allusers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [checkDelete, setCheckDelete] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const inputRef = useRef(null);
    const socket = useMemo(() => io('http://localhost:3000'), []);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // useEffect to handle socket events
    useEffect(() => {
        socket.on('connect', () => {
            socket.emit('join-room', currentUser);
        });
        socket.on('receive-message', (messageData) => {
            setAllMessages((prev) => [...prev, messageData]);
        });
        socket.on('message-edited', ({ messageId, newMessage }) => {
            setAllMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, message: newMessage, isEdited: true, editedAt: new Date().toISOString() }
                        : msg
                )
            );
        });
        socket.on('message-delete-error', ({ error }) => {
            console.error(error);
        });
        socket.on('message-edit-error', ({ error }) => {
            console.error(error);
        });
        return () => {
            socket.off('receive-message');
            socket.off('message-edited');
            socket.off('message-delete-error');
            socket.off('message-edit-error');
        };
    }, [socket]);

    useEffect(() => {
        getAllUsers();
        getAllMessages();
    }, []);


    useEffect(() => {
        socket.on('message-deleted', ({ messageId }) => {
            setAllMessages((prev) =>
                prev.map((m) => (m._id === messageId ? { ...m, isDeleted: true } : m))
            );
        });

        return () => socket.off('message-deleted');
    }, [socket]);


    // function to get all users and messages from the server
    const getAllUsers = async () => {
        const token = localStorage.getItem('token');
        const { data } = await api.get('api/users', {
            headers: {
                'Authorization': token,
            },
        });
        setAllUsers(data.users);
    }
    // function to get all messages from the server
    const getAllMessages = async () => {
        const token = localStorage.getItem('token');
        const { data } = await api.get('api/messages', {
            headers: {
                'Authorization': token,
            },
        });
        setAllMessages(data);
        console.log('data', data);
    }

    // function to handle sending messages
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() === '' || !selectedUser) return;

        if (editingMessage) {
            socket.emit('edit-message', {
                messageId: editingMessage._id,
                newMessage: message.trim(),
            });
            setEditingMessage(null);
            setMessage('');
            return;
        }

        socket.emit('send-message', {
            message: message.trim(),
            receiver: selectedUser._id,
            sender: currentUser,
        });
        setMessage('');
    };

    const handleEditMessage = (msg) => {
        setEditingMessage(msg);
        setMessage(msg.message);
        window.requestAnimationFrame(() => inputRef.current?.focus());
    };

    useEffect(() => {
        if (!selectedUser) {
            setEditingMessage(null);
            setMessage('');
        }
    }, [selectedUser]);

    const cancelEdit = () => {
        setEditingMessage(null);
        setMessage('');
    }
    return (
        <div className="flex h-screen bg-gray-100">


            <div className="w-4/5 flex flex-col bg-[#efeae2]">


                <div className="bg-emerald-600 px-6 py-4 flex items-center gap-3 shadow-md">
                    <div className="w-10 h-10 bg-emerald-300 rounded-full flex items-center justify-center text-emerald-800 font-bold">
                        {selectedUser?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h2 className="text-white font-semibold text-lg">
                        {selectedUser ? selectedUser.name : 'اختار شخص عشان تبدأ الشات'}
                    </h2>
                </div>


                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                    {allMessages
                        ?.filter(
                            (msg) =>
                                (msg.sender === currentUser && msg.receiver === selectedUser?._id) ||
                                (msg.sender === selectedUser?._id && msg.receiver === currentUser)
                        )
                        .map((msg, index) => (
                            <div
                                key={index}
                                className={`w-full flex items-center gap-2 group ${msg.sender === currentUser ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                {/* التلات نقط - تظهر بس لصاحب الرسالة وعند الـ hover */}
                                <MessageOptions
                                    openUpward={index > 2} // أول 3 رسايل يفتح المينيو تحت، والباقي فوق
                                    message={msg}
                                    setCheckDelete={setCheckDelete}
                                    setAllMessages={setAllMessages}
                                    socket={socket}
                                    selectedUser={selectedUser}
                                    onEdit={handleEditMessage}
                                />
                                {msg.isDeleted ? (
                                    <p className="px-4 py-2 max-w-xs italic text-sm text-gray-400 bg-gray-100 rounded-2xl border border-gray-200">
                                        تم حذف هذه الرسالة
                                    </p>
                                ) : msg.sender === currentUser ? (
                                    <div className="flex justify-end max-w-[75%]">
                                        <div className="min-w-0 rounded-2xl rounded-tr-none bg-[#d9fdd3] px-4 py-2 shadow-sm text-gray-900">
                                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                                {msg.message}
                                            </p>
                                            {msg.isEdited && (
                                                <div className="mt-1 text-[10px] italic text-emerald-900/60 text-right">
                                                    edited
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-start max-w-[75%]">
                                        <div className="min-w-0 rounded-2xl rounded-tl-none bg-white px-4 py-2 shadow-sm text-gray-900 border border-gray-100">
                                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                                {msg.message}
                                            </p>
                                            {msg.isEdited && (
                                                <div className="mt-1 text-[10px] italic text-gray-500 text-right">
                                                    edited
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>
                        ))}
                </div>


                <form onSubmit={handleSendMessage} className="bg-white px-4 py-3 flex items-center gap-3 border-t border-gray-200">
                    {editingMessage && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-xs font-semibold text-red-500 hover:text-red-600"
                        >
                            Cancel edit
                        </button>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        disabled={!selectedUser}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={editingMessage ? 'عدّل الرسالة...' : 'اكتب رسالة...'}
                        className="flex-1 bg-gray-100 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white w-11 h-11 rounded-full flex items-center justify-center transition"
                    >
                            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                       
                    </button>
                </form>
            </div>


            <div className="w-1/5 bg-white border-l border-gray-200 flex flex-col">
                <div className="bg-emerald-600 px-4 py-4">
                    <h2 className="text-white font-bold text-lg">المحادثات</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {allusers.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition ${selectedUser?._id === user._id ? 'bg-emerald-50' : ''
                                }`}
                        >
                            <div className="w-11 h-11 bg-emerald-500 rounded-full flex items-center justify-center text-black font-bold shrink-0">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-gray-700 font-medium truncate">
                                {user.name}
                            </span>
                        </div>

                    ))}
                </div>
            </div>
        </div>
    );
}