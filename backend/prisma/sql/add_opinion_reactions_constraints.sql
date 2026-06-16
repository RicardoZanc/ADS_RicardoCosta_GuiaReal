-- Constraints complementares para votos em opiniões e threads.
-- Executar após: npx prisma migrate dev --name add_opinion_reactions

ALTER TABLE reaction_votes
  ADD CONSTRAINT reaction_votes_target_check
  CHECK (
    (interaction_id IS NOT NULL AND opinion_id IS NULL) OR
    (interaction_id IS NULL AND opinion_id IS NOT NULL)
  );

DROP INDEX IF EXISTS reaction_votes_user_id_interaction_id_key;

CREATE UNIQUE INDEX reaction_votes_user_interaction_unique
  ON reaction_votes (user_id, interaction_id)
  WHERE interaction_id IS NOT NULL;

CREATE UNIQUE INDEX reaction_votes_user_opinion_unique
  ON reaction_votes (user_id, opinion_id)
  WHERE opinion_id IS NOT NULL;
