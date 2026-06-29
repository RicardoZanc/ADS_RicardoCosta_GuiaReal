import { logger } from "../../utils/logger";

const DEFAULT_FUZZINESS = 0.3;

export function getProductsSearchFuzziness(): number {
  const raw =
    process.env.PRODUCTS_SEARCH_FUZZINESS?.trim() ??
    process.env.NODES_SEARCH_FUZZINESS?.trim();

  if (!raw) {
    return DEFAULT_FUZZINESS;
  }

  const parsed = Number.parseFloat(raw);

  if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
    logger.warn(
      "PRODUCTS_SEARCH_FUZZINESS inválido; usando valor padrão",
      { raw, defaultFuzziness: DEFAULT_FUZZINESS }
    );
    return DEFAULT_FUZZINESS;
  }

  return parsed;
}
