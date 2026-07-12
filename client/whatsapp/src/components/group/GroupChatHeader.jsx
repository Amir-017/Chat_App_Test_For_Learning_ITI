import { useTranslation } from "react-i18next";

export const GroupChatHeader = ({ selectedGroup, isRemovedFromSelectedGroup }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-950/80 text-white px-6 py-4 shadow-md border-b border-white/10 backdrop-blur-xl">
      <h1 className="font-bold text-xl">{selectedGroup?.name || t("groups.chatHeader.selectGroup")}</h1>
      <p className="text-xs text-emerald-50">
        {selectedGroup
          ? isRemovedFromSelectedGroup
            ? t("groups.chatHeader.removedFromGroup")
            : t("groups.chatHeader.subtitle")
          : t("groups.chatHeader.chooseFromList")}
      </p>
    </div>
  );
};
