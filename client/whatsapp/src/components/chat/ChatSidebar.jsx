import { useTranslation } from "react-i18next";

export const ChatSidebar = ({
    groups,
    selectedGroup,
    onSelectGroup,
    users,
    selectedUser,
    onSelectUser,
    onOpenCreateGroup,
}) => {
    const { t } = useTranslation();
    return (
        <div className="w-1/5 bg-slate-950/85 border-s border-white/10 flex flex-col backdrop-blur-xl">
            <div className="bg-slate-950/90 px-4 py-4 flex items-center justify-between gap-3 border-b border-white/10">
                <h2 className="text-white font-bold text-lg">{t("chat.sidebar.title")}</h2>
                <button
                    type="button"
                    onClick={onOpenCreateGroup}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
                >
                    {t("chat.sidebar.newGroup")}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t("chat.sidebar.groupsLabel")}</h3>
                    <div className="space-y-2">
                        {groups.map((group) => (
                            <button
                                type="button"
                                key={group._id}
                                onClick={() => onSelectGroup(group)}
                                className={`w-full text-start flex items-center gap-3 px-3 py-2 rounded-xl transition border ${selectedGroup?._id === group._id
                                    ? "bg-emerald-500/15 border-emerald-400/30"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                                    {group.name?.[0]?.toUpperCase() || "#"}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-100 truncate">{group.name}</div>
                                    <div className="text-[11px] text-slate-400">
                                        {t("common.members", { count: group.members?.length || 0 })}
                                    </div>
                                </div>
                            </button>
                        ))}
                        {groups.length === 0 && (
                            <div className="text-xs text-slate-400 px-1">{t("chat.sidebar.noGroups")}</div>
                        )}
                    </div>
                </div>

                <div className="bg-white/5 px-4 py-4 border-t border-white/10">
                    <h2 className="text-white font-bold text-lg">{t("chat.sidebar.directChats")}</h2>
                </div>

                {users.map((userFromAllUsers) => (
                    <div
                        key={userFromAllUsers._id}
                        onClick={() => onSelectUser(userFromAllUsers)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-white/10 hover:bg-white/5 transition ${selectedUser?._id === userFromAllUsers._id ? "bg-emerald-500/15" : ""
                            }`}
                    >
                        <div className="relative shrink-0">
                            {userFromAllUsers?.imageUrl ? (
                                <img
                                    src={userFromAllUsers.imageUrl}
                                    alt={userFromAllUsers.name}
                                    className="w-11 h-11 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-slate-950 font-bold">
                                    {userFromAllUsers.name?.[0]?.toUpperCase()}
                                </div>
                            )}
                            {userFromAllUsers.isOnline && (
                                <span className="absolute bottom-0 end-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
                            )}
                        </div>
                        <span className="text-slate-100 font-medium truncate">{userFromAllUsers.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
