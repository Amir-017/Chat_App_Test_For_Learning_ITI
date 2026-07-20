import { useTranslation } from "react-i18next";

export const GroupChatHeader = ({ selectedGroup, isRemovedFromSelectedGroup, onClearChat, onBack, onToggleMembers }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-950/80 text-white px-3 sm:px-6 py-4 shadow-md border-b border-white/10 backdrop-blur-xl flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="md:hidden shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-slate-200 hover:bg-white/10 transition"
          aria-label={t("common.back")}
        >
          <svg className="w-5 h-5 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="font-bold text-lg sm:text-xl truncate">{selectedGroup?.name || t("groups.chatHeader.selectGroup")}</h1>
          <p className="text-xs text-emerald-50 truncate">
            {selectedGroup
              ? isRemovedFromSelectedGroup
                ? t("groups.chatHeader.removedFromGroup")
                : t("groups.chatHeader.subtitle")
              : t("groups.chatHeader.chooseFromList")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {selectedGroup && (
          <button
            type="button"
            onClick={onToggleMembers}
            title={t("groups.membersPanel.groupMembers")}
            className="xl:hidden whitespace-nowrap shrink-0 text-[11px] sm:text-xs font-semibold text-slate-200 hover:text-emerald-300 border border-white/10 hover:border-emerald-400/40 rounded-full px-2.5 sm:px-3 py-1.5 sm:py-2 transition"
          >
            {t("groups.membersPanel.groupMembers")}
          </button>
        )}

        {selectedGroup && (
          <button
            type="button"
            onClick={onClearChat}
            title={t("chat.header.clearChat")}
            className="whitespace-nowrap shrink-0 text-[11px] sm:text-xs font-semibold text-slate-200 hover:text-red-400 border border-white/10 hover:border-red-400/40 rounded-full px-2.5 sm:px-3 py-1.5 sm:py-2 transition"
          >
            {t("chat.header.clearChat")}
          </button>
        )}
      </div>
    </div>
  );
};
