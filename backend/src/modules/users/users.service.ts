import { prisma } from "../../lib/prisma";

type TransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

const applyReputationDelta = async (
  userId: string,
  delta: number,
  tx: TransactionClient
): Promise<void> => {
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
