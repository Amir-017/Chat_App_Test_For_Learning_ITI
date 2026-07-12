import { useTranslation } from "react-i18next";
import  MessageOptions  from "../../shared/MessageOption";
export const GroupMessageList = ({
  messages,
  currentUserId,
  allUsers,
  selectedGroup,
  socket,
  setAllMessages,
  onEdit,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
      {messages.map((msg) => {
        const isSender = String(msg.sender) === currentUserId;
        const isDeleted = Boolean(msg.isDeleted);
        return (
          <div key={msg._id} className={`w-full flex items-center gap-2 group ${isSender ? "justify-end" : "justify-start"}`}>
            <MessageOptions
              openUpward={false}
              message={msg}
              setAllMessages={setAllMessages}
              socket={socket}
              selectedUser={null}
              currentUserId={currentUserId}
              onEdit={onEdit}
            />
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                isDeleted
                  ? "bg-white/5 border border-white/10 text-slate-400"
                  : isSender
                  ? "bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-tr-none text-slate-950"
                  : "bg-slate-900/80 border border-white/10 rounded-tl-none text-slate-100"
              }`}
            >
              {!isSender && selectedGroup && (
                <div className="text-[11px] font-semibold text-emerald-300/80 mb-1">
                  {allUsers.find((user) => String(user._id) === String(msg.sender))?.name || t("common.unknown")}
                </div>
              )}
              {isDeleted ? (
                <p className="text-sm italic whitespace-pre-wrap break-words text-slate-400">
                  {t("common.messageDeleted")}
                </p>
              ) : (
                <>
                  {msg.image?.url && (
                    <img
                      src={msg.image.url}
                      alt="attachment"
                      loading="lazy"
                      className="max-w-full max-h-72 rounded-xl mb-1 object-cover"
                    />
                  )}
                  {msg.message && <p className="text-sm whitespace-pre-wrap break-words text-inherit">{msg.message}</p>}
                  {msg.isEdited && <div className="mt-1 text-[10px] italic text-slate-400 text-end">{t("common.edited")}</div>}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};