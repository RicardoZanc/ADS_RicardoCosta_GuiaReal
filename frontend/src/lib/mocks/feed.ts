import type { FeedProduct, FeedResponse } from "@/lib/types/feed";

const MOCK_PAGE_LIMIT = 2;

const ALL_MOCK_PRODUCTS: FeedProduct[] = [
  {
    id: "mock-product-ibanez-rg450dx",
    name: "Ibanez RG450DX",
    brand_name: "Ibanez",
    image_url: null,
    created_at: "2026-06-01T10:00:00.000Z",
    nodes: [
      {
        id: "mock-node-guitarras",
        name: "Guitarras",
        type: "CATEGORIA",
      },
      {
        id: "mock-node-ibanez",
        name: "Ibanez",
        type: "MARCA",
      },
      {
        id: "mock-node-floyd",
        name: "Floyd Rose",
        type: "TECNOLOGIA",
      },
    ],
    discussionPreviews: [
      {
        id: "mock-thread-1a",
        content: "Eu gostei desse produto",
        created_at: "2026-06-03T14:20:00.000Z",
        author: { id: "mock-user-ana", username: "ana_guitar" },
      },
      {
        id: "mock-thread-1b",
        content: "Eu discordo de voce",
        created_at: "2026-06-03T15:05:00.000Z",
        author: { id: "mock-user-bruno", username: "bruno_riffs" },
      },
      {
        id: "mock-thread-1c",
        content: "Produto problematico",
        created_at: "2026-06-03T16:40:00.000Z",
        author: { id: "mock-user-carlos", username: "carlos_setup" },
      },
    ],
  },
  {
    id: "mock-product-fender-strat",
    name: "Fender Player Stratocaster",
    brand_name: "Fender",
    image_url: null,
    created_at: "2026-06-02T09:30:00.000Z",
    nodes: [
      {
        id: "mock-node-guitarras-2",
        name: "Guitarras",
        type: "CATEGORIA",
      },
      {
        id: "mock-node-fender",
        name: "Fender",
        type: "MARCA",
      },
    ],
    discussionPreviews: [
      {
        id: "mock-thread-2a",
        content: "Eu gostei desse produto",
        created_at: "2026-06-04T08:10:00.000Z",
        author: { id: "mock-user-diana", username: "diana_blues" },
      },
      {
        id: "mock-thread-2b",
        content: "Eu discordo de voce",
        created_at: "2026-06-04T09:22:00.000Z",
        author: { id: "mock-user-edu", username: "edu_pickups" },
      },
      {
        id: "mock-thread-2c",
        content: "Produto problematico",
        created_at: "2026-06-04T11:00:00.000Z",
        author: { id: "mock-user-fabio", username: "fabio_tone" },
      },
    ],
  },
  {
    id: "mock-product-yamaha-pacifica",
    name: "Yamaha Pacifica 112V",
    brand_name: "Yamaha",
    image_url: null,
    created_at: "2026-06-04T12:00:00.000Z",
    nodes: [
      {
        id: "mock-node-guitarras-3",
        name: "Guitarras",
        type: "CATEGORIA",
      },
      {
        id: "mock-node-yamaha",
        name: "Yamaha",
        type: "MARCA",
      },
    ],
    discussionPreviews: [
      {
        id: "mock-thread-3a",
        content: "Ótimo custo-benefício para quem está começando",
        created_at: "2026-06-04T13:00:00.000Z",
        author: { id: "mock-user-gabi", username: "gabi_iniciante" },
      },
      {
        id: "mock-thread-3b",
        content: "O braço poderia ser mais confortável nas regiões altas",
        created_at: "2026-06-04T14:15:00.000Z",
        author: { id: "mock-user-henrique", username: "henrique_shred" },
      },
      {
        id: "mock-thread-3c",
        content: "Troquei as cordas de fábrica e melhorou bastante o som",
        created_at: "2026-06-04T15:30:00.000Z",
        author: { id: "mock-user-iris", username: "iris_luthier" },
      },
    ],
  },
];

const TOTAL = ALL_MOCK_PRODUCTS.length;
const TOTAL_PAGES = Math.ceil(TOTAL / MOCK_PAGE_LIMIT);

export function getMockFeedPage(page: number): FeedResponse {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * MOCK_PAGE_LIMIT;
  const data = ALL_MOCK_PRODUCTS.slice(start, start + MOCK_PAGE_LIMIT);

  return {
    data,
    pagination: {
      page: safePage,
      limit: MOCK_PAGE_LIMIT,
      total: TOTAL,
      totalPages: TOTAL_PAGES,
    },
  };
}
