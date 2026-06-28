export type SeedNodes = {
  root: { id: string };
  tipos: {
    instrumentos: { id: string };
    eletronicos: { id: string };
    eletrodomesticos: { id: string };
  };
  categorias: {
    guitarras: { id: string };
    baixos: { id: string };
    monitores: { id: string };
    notebooks: { id: string };
  };
  marcas: {
    ibanez: { id: string };
    fender: { id: string };
    dell: { id: string };
    lg: { id: string };
  };
  tecnologias: {
    floydRose: { id: string };
    humbucker: { id: string };
    painelIps: { id: string };
    hz144: { id: string };
  };
  composicoes: {
    mogno: { id: string };
    maple: { id: string };
    aluminio: { id: string };
  };
  atributos: {
    seisCordas: { id: string };
    seteCordas: { id: string };
    vinteSetePolegadas: { id: string };
    quinzePontoSeis: { id: string };
  };
};

export type SeedUsers = {
  admin: { id: string };
  mod: { id: string };
  user: { id: string };
  banned: { id: string };
};

export type SeedProducts = {
  rg350dxz: { id: string };
  playerStrat: { id: string };
  ultraSharp: { id: string };
  xps15: { id: string };
};

export type SeedCommunity = {
  opinions: {
    rgOpinion: { id: string };
    stratOpinion: { id: string };
    monitorOpinion: { id: string };
    floydNodeOpinion: { id: string };
    ipsNodeOpinion: { id: string };
    xpsOpinion: { id: string };
  };
  threads: {
    rgThread: { id: string };
    rgReply: { id: string };
    rgNestedReply: { id: string };
    stratThread: { id: string };
    floydThread: { id: string };
    monitorThread: { id: string };
    processedThread: { id: string };
  };
};

export type SeedTechnicalFacts = {
  floydVerified: { id: string };
  ipsHypothesis: { id: string };
  humbuckerDisputed: { id: string };
};

export type SeedContext = {
  nodes: SeedNodes;
  users: SeedUsers;
  products: SeedProducts;
  community: SeedCommunity;
  // technicalFacts: SeedTechnicalFacts;
};
