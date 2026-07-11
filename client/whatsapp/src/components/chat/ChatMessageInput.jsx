export const ChatMessageInput = ({
    inputRef,
    message,
    setMessage,
    onSubmit,
    editingMessage,
    onCancelEdit,
    selectedUser,
    selectedGroup,
    isRemovedFromSelectedGroup,
}) => {
    return (
        <form onSubmit={onSubmit} className="bg-slate-950/80 px-4 py-3 flex items-center gap-3 border-t border-white/10 backdrop-blur-xl">
            {editingMessage && (
                <button
                    type="button"
                    onClick={onCancelEdit}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                >
                    Cancel edit
                </button>
            )}
            <input
                ref={inputRef}
                type="text"
                value={message}
                disabled={!(selectedUser || selectedGroup) || !!(selectedGroup && isRemovedFromSelectedGroup)}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                    selectedGroup && isRemovedFromSelectedGroup
                        ? "تم إزالتك من هذا الجروب، مينفعش تبعت رسايل"
                        : editingMessage
                            ? "عدّل الرسالة..."
                            : selectedGroup
                                ? "اكتب في الجروب..."
                                : "اكتب رسالة..."
                } className="flex-1 bg-white/5 text-slate-100 placeholder:text-slate-500 rounded-full px-5 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
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
    );
};
