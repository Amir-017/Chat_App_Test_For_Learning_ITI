import MessageOptions from "../../shared/MessageOption";

export const ChatMessageList = ({
    messages,
    currentUserId,
    getUserName,
    socket,
    setAllMessages,
    selectedUser,
    onEdit,
}) => {
    return (
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_20%)]">
            {messages.map((msg, index) => {
                const isSender = String(msg.sender) === currentUserId;
                const isGroupMessage = msg.conversationType === "group";

                return (
                    <div
                        key={msg._id}
                        className={`w-full flex items-center gap-2 group ${isSender ? "justify-end" : "justify-start"}`}
                    >
                        <MessageOptions
                            openUpward={index > 2}
                            message={msg}
                            setCheckDelete={() => { }}
                            setAllMessages={setAllMessages}
                            socket={socket}
                            selectedUser={selectedUser}
                            onEdit={onEdit}
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
                                    {msg.image?.url && (
                                        <img
                                            src={msg.image.url}
                                            alt="attachment"
                                            loading="lazy"
                                            className="max-w-full max-h-72 rounded-xl mb-1 object-cover"
                                        />
                                    )}
                                    {msg.message && (
                                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">
                                            {msg.message}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-gray-200 mt-1 text-right">
                                        {msg.createdAt &&
                                            new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
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
                                    {msg.image?.url && (
                                        <img
                                            src={msg.image.url}
                                            alt="attachment"
                                            loading="lazy"
                                            className="max-w-full max-h-72 rounded-xl mb-1 object-cover"
                                        />
                                    )}
                                    {msg.message && (
                                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">
                                            {msg.message}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-gray-200 mt-1 text-right">
                                        {msg.createdAt &&
                                            new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
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
                                    {msg.image?.url && (
                                        <img
                                            src={msg.image.url}
                                            alt="attachment"
                                            loading="lazy"
                                            className="max-w-full max-h-72 rounded-xl mb-1 object-cover"
                                        />
                                    )}
                                    {msg.message && (
                                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">
                                            {msg.message}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-gray-200 mt-1 text-right">
                                        {msg.createdAt &&
                                            new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
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
    );
};
