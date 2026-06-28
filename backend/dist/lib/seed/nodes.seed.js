import { prisma } from "../prisma";
import { node_type } from "../../generated/prisma/enums";
export async function seedNodes() {
    const root = await prisma.nodes.create({
        data: { name: "ROOT_GLOBAL", type: node_type.ROOT },
    });
    const [tipoInstrumentos, tipoEletronicos, tipoEletrodomesticos] = await Promise.all([
        prisma.nodes.create({
            data: {
                name: "Instrumentos Musicais",
                type: node_type.TIPO,
                parent_id: root.id,
            },
        }),
        prisma.nodes.create({
            data: {
                name: "Eletrônicos",
                type: node_type.TIPO,
                parent_id: root.id,
            },
        }),
        prisma.nodes.create({
            data: {
                name: "Eletrodomésticos",
                type: node_type.TIPO,
                parent_id: root.id,
            },
        }),
    ]);
    const [catGuitarras, catBaixos, catMonitores, catNotebooks] = await Promise.all([
        prisma.nodes.create({
            data: {
                name: "Guitarras",
                type: node_type.CATEGORIA,
                parent_id: tipoInstrumentos.id,
            },
        }),
        prisma.nodes.create({
            data: {
                name: "Baixos",
                type: node_type.CATEGORIA,
                parent_id: tipoInstrumentos.id,
            },
        }),
        prisma.nodes.create({
            data: {
                name: "Monitores",
                type: node_type.CATEGORIA,
                parent_id: tipoEletronicos.id,
            },
        }),
        prisma.nodes.create({
            data: {
                name: "Notebooks",
                type: node_type.CATEGORIA,
                parent_id: tipoEletronicos.id,
            },
        }),
    ]);
    const [marcaIbanez, marcaFender, marcaDell, marcaLg] = await Promise.all([
        prisma.nodes.create({
            data: { name: "Ibanez", type: node_type.MARCA, parent_id: root.id },
        }),
        prisma.nodes.create({
            data: { name: "Fender", type: node_type.MARCA, parent_id: root.id },
        }),
        prisma.nodes.create({
            data: { name: "Dell", type: node_type.MARCA, parent_id: root.id },
        }),
        prisma.nodes.create({
            data: { name: "LG", type: node_type.MARCA, parent_id: root.id },
        }),
    ]);
    const [tecFloyd, tecHumbucker, tecIps, tec144hz] = await Promise.all([
        prisma.nodes.create({
            data: {
                name: "Floyd Rose",
                type: node_type.TECNOLOGIA,
                parent_id: root.id,
            },
        }),
        prisma.nodes.create({
            data: {
                name: "Humbucker",
                type: node_type.TECNOLOGIA,
                parent_id: root.id,
            },
        }),
        prisma.nodes.create({
            data: {
                name: "Painel IPS",
                type: node_type.TECNOLOGIA,
                parent_id: root.id,
            },
        }),
        prisma.nodes.create({
            data: { name: "144Hz", type: node_type.TECNOLOGIA, parent_id: root.id },
        }),
    ]);
    const [compMogno, compMaple, compAluminio] = await Promise.all([
        prisma.nodes.create({
            data: { name: "Mogno", type: node_type.COMPOSICAO, parent_id: root.id },
        }),
        prisma.nodes.create({
            data: { name: "Maple", type: node_type.COMPOSICAO, parent_id: root.id },
        }),
        prisma.nodes.create({
            data: {
                name: "Alumínio",
                type: node_type.COMPOSICAO,
                parent_id: root.id,
            },
        }),
    ]);
    const [att6Cordas, att7Cordas, att27, att156] = await Promise.all([
        prisma.nodes.create({
            data: { name: "6 Cordas", type: node_type.ATRIBUTO, parent_id: root.id },
        }),
        prisma.nodes.create({
            data: { name: "7 Cordas", type: node_type.ATRIBUTO, parent_id: root.id },
        }),
        prisma.nodes.create({
            data: { name: '27"', type: node_type.ATRIBUTO, parent_id: root.id },
        }),
        prisma.nodes.create({
            data: { name: '15.6"', type: node_type.ATRIBUTO, parent_id: root.id },
        }),
    ]);
    return {
        root,
        tipos: {
            instrumentos: tipoInstrumentos,
            eletronicos: tipoEletronicos,
            eletrodomesticos: tipoEletrodomesticos,
        },
        categorias: {
            guitarras: catGuitarras,
            baixos: catBaixos,
            monitores: catMonitores,
            notebooks: catNotebooks,
        },
        marcas: {
            ibanez: marcaIbanez,
            fender: marcaFender,
            dell: marcaDell,
            lg: marcaLg,
        },
        tecnologias: {
            floydRose: tecFloyd,
            humbucker: tecHumbucker,
            painelIps: tecIps,
            hz144: tec144hz,
        },
        composicoes: {
            mogno: compMogno,
            maple: compMaple,
            aluminio: compAluminio,
        },
        atributos: {
            seisCordas: att6Cordas,
            seteCordas: att7Cordas,
            vinteSetePolegadas: att27,
            quinzePontoSeis: att156,
        },
    };
}
