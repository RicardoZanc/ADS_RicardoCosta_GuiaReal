Comandos que você deve executar
Na pasta backend/:

npx prisma migrate dev --name add_opinion_reactions
npx prisma generate
npx prisma db execute --file prisma/sql/add_opinion_reactions_