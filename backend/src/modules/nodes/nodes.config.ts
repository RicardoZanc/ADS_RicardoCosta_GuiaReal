import { logger } from "../../utils/logger";

const DEFAULT_FUZZINESS = 0.3;

export function getNodesSearchFuzziness(): number {
  const raw = process.env.NODES_SEARCH_FUZZINESS?.trim();

  if (!raw) {
    return DEFAULT_FUZZINESS;
  }

  const parsed = Number.parseFloat(raw);

  if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
    logger.warn(
      "NODES_SEARCH_FUZZINESS inválido; usando valor padrão",
      { raw, defaultFuzziness: DEFAULT_FUZZINESS }
    );
    return DEFAULT_FUZZINESS;
  }

  return parsed;
}
