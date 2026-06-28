const applyReputationDelta = async (userId, delta, tx) => {
    if (delta === 0) {
        return;
    }
    await tx.users.update({
        where: { id: userId },
        data: { reputation_score: { increment: delta } },
    });
};
export const usersService = {
    applyReputationDelta,
};
