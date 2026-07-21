import { useTranslation } from "react-i18next";

export const CreateGroupModal = ({
    isOpen,
    onClose,
    groupName,
    setGroupName,
    users,
    groupMembers,
    onToggleMember,
    onSubmit,
    isSubmitting,
}) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-[28px] bg-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">{t("modal.createGroupTitle")}</h3>
                        <p className="text-xs text-slate-400">{t("modal.createGroupSubtitle")}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t("modal.groupNameLabel")}</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder={t("modal.groupNamePlaceholder")}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-300">{t("modal.membersLabel")}</label>
                            <span className="text-xs text-slate-500">{t("common.selected", { count: groupMembers.length })}</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
                            {users.map((user) => (
                                <label
                                    key={user._id}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/10 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        onChange={() => onToggleMember(user._id)}
                                        className="h-4 w-4 accent-emerald-400"
                                    />
                                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                                        {user.name?.[0]?.toUpperCase()}
                                    </span>
                                    <span className="text-sm font-medium text-slate-100">{user.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-2xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5"
                        >
                            {t("common.cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-sm font-semibold hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t("common.create")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
