import { useTranslation } from "react-i18next";

export const GroupChatHeader = ({ selectedGroup, isRemovedFromSelectedGroup, onClearChat }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-950/80 text-white px-6 py-4 shadow-md border-b border-white/10 backdrop-blur-xl flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-bold text-xl truncate">{selectedGroup?.name || t("groups.chatHeader.selectGroup")}</h1>
        <p className="text-xs text-emerald-50">
          {selectedGroup
            ? isRemovedFromSelectedGroup
              ? t("groups.chatHeader.removedFromGroup")
              : t("groups.chatHeader.subtitle")
            : t("groups.chatHeader.chooseFromList")}
        </p>
      </div>

      {selectedGroup && (
        <button
          type="button"
          onClick={onClearChat}
          title={t("chat.header.clearChat")}
          className="shrink-0 text-xs font-semibold text-slate-200 hover:text-red-400 border border-white/10 hover:border-red-400/40 rounded-full px-3 py-2 transition"
        >
          {t("chat.header.clearChat")}
        </button>
      )}
    </div>
  );
};
