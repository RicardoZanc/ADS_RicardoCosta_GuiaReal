import { prisma } from "../prisma";
export async function clearDatabase() {
    await prisma.fact_evidence.deleteMany();
    await prisma.reaction_votes.deleteMany();
    await prisma.reports.deleteMany();
    // Threads com parent devem ser removidas antes das raízes
    await prisma.discussion_threads.deleteMany({
        where: { parent_interaction_id: { not: null } },
    });
    await prisma.discussion_threads.deleteMany();
    await prisma.opinions.deleteMany();
    await prisma.product_nodes.deleteMany();
    await prisma.technical_facts.deleteMany();
    await prisma.products.deleteMany();
    // Nós folha antes dos pais (hierarquia)
    let deleted = 0;
    do {
        const leafNodes = await prisma.nodes.findMany({
            where: {
                type: { not: "ROOT" },
                other_nodes: { none: {} },
            },
            select: { id: true },
        });
        if (leafNodes.length === 0)
            break;
        deleted = await prisma.nodes.deleteMany({
            where: { id: { in: leafNodes.map((n) => n.id) } },
        }).then((r) => r.count);
    } while (deleted > 0);
    await prisma.nodes.deleteMany();
    await prisma.users.deleteMany();
}
