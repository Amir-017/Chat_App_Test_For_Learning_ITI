import { useTranslation } from "react-i18next";

export const GroupMessageInput = ({
  inputRef,
  imageInputRef,
  message,
  setMessage,
  onSubmit,
  editingMessage,
  onCancelEdit,
  onSendImage,
  selectedGroup,
  isRemovedFromSelectedGroup,
}) => {
  const { t } = useTranslation();
  const isChatDisabled = !selectedGroup || isRemovedFromSelectedGroup;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onSendImage(file);
    e.target.value = "";
  };

  return (
    <form onSubmit={onSubmit} className="bg-slate-950/90 px-4 py-3 border-t border-white/10 flex items-center gap-3">
      {editingMessage && (
        <button type="button" onClick={onCancelEdit} className="text-xs font-semibold text-rose-400 hover:text-rose-300">
          {t("chat.input.cancelEdit")}
        </button>
      )}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      <button
        type="button"
        disabled={isChatDisabled}
        onClick={() => imageInputRef.current?.click()}
        className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
        title={t("chat.input.sendImage")}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      </button>
      <input
        ref={inputRef}
        type="text"
        value={message}
        disabled={isChatDisabled}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          editingMessage
            ? t("chat.input.placeholderEdit")
            : isRemovedFromSelectedGroup
            ? t("groups.chatHeader.removedFromGroup")
            : t("chat.input.placeholderGroup")
        }
        className="flex-1 bg-white/5 text-slate-100 placeholder:text-slate-500 rounded-full px-5 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
      />
      <button
        type="submit"
        className="bg-gradient-to-br from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 w-11 h-11 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
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