import { useTranslation } from "react-i18next";

export const CreateGroupModal = ({
  isOpen,
  onClose,
  groupName,
  setGroupName,
  availableUsersToCreate,
  createMembers,
  toggleCreateMember,
  onSubmit,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{t("modal.createGroupTitle")}</h3>
            <p className="text-xs text-slate-400">{t("modal.initialMembersLabel")}</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-white">
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t("modal.groupNameLabel")}</label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
              placeholder={t("modal.groupNamePlaceholder")}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">{t("modal.initialMembersLabel")}</label>
              <span className="text-xs text-slate-500">{t("common.selected", { count: createMembers.length })}</span>
            </div>
            <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
              {availableUsersToCreate.map((user) => (
                <label key={user._id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-emerald-400"
                    checked={createMembers.includes(user._id)}
                    onChange={() => toggleCreateMember(user._id)}
                  />
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-100 truncate">{user.name}</div>
                    <div className="text-xs text-slate-400 truncate">{user.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-2xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5">
              {t("common.cancel")}
            </button>
            <button type="submit" className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-sm font-semibold hover:from-emerald-400 hover:to-cyan-400">
              {t("common.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
