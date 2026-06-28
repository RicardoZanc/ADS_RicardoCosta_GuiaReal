import { prisma } from "../../lib/prisma";
import { ensureProductExists } from "../../modules/products/products.domainRules";

const listProductNodes = async (productId: string) => {
  await ensureProductExists(productId);

  const product = await prisma.products.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      product_nodes: {
        select: {
          nodes: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      },
    },
  });

  return {
    product_id: product!.id,
    product_name: product!.name,
    nodes: product!.product_nodes.map((item) => ({
      id: item.nodes.id,
      name: item.nodes.name,
      type: item.nodes.type,
    })),
  };
};

export const productsToolService = {
  listProductNodes,
};
