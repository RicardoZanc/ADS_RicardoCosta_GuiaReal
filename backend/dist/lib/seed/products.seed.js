import { prisma } from "../prisma";
export async function seedProducts(nodes) {
    const [rg350dxz, playerStrat, ultraSharp, xps15] = await Promise.all([
        prisma.products.create({
            data: {
                name: "RG350DXZ",
                brand_name: "Ibanez",
                ean: "1234567890123",
                product_nodes: {
                    create: [
                        { node_id: nodes.categorias.guitarras.id },
                        { node_id: nodes.marcas.ibanez.id },
                        { node_id: nodes.tecnologias.floydRose.id },
                        { node_id: nodes.composicoes.mogno.id },
                        { node_id: nodes.atributos.seisCordas.id },
                    ],
                },
            },
        }),
        prisma.products.create({
            data: {
                name: "Player Strat",
                brand_name: "Fender",
                ean: "2345678901234",
                product_nodes: {
                    create: [
                        { node_id: nodes.categorias.guitarras.id },
                        { node_id: nodes.marcas.fender.id },
                        { node_id: nodes.tecnologias.humbucker.id },
                        { node_id: nodes.composicoes.maple.id },
                        { node_id: nodes.atributos.seisCordas.id },
                    ],
                },
            },
        }),
        prisma.products.create({
            data: {
                name: "UltraSharp U2720Q",
                brand_name: "Dell",
                ean: "3456789012345",
                product_nodes: {
                    create: [
                        { node_id: nodes.categorias.monitores.id },
                        { node_id: nodes.marcas.dell.id },
                        { node_id: nodes.tecnologias.painelIps.id },
                        { node_id: nodes.atributos.vinteSetePolegadas.id },
                    ],
                },
            },
        }),
        prisma.products.create({
            data: {
                name: "XPS 15",
                brand_name: "Dell",
                ean: "4567890123456",
                product_nodes: {
                    create: [
                        { node_id: nodes.categorias.notebooks.id },
                        { node_id: nodes.marcas.dell.id },
                        { node_id: nodes.composicoes.aluminio.id },
                        { node_id: nodes.atributos.quinzePontoSeis.id },
                    ],
                },
            },
        }),
    ]);
    return { rg350dxz, playerStrat, ultraSharp, xps15 };
}
