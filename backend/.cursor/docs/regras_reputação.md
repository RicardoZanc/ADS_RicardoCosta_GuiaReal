
| **Ação do Usuário**                   | **Impacto na Reputação** | **Onde disparar**                           |
| ------------------------------------- | ------------------------ | ------------------------------------------- |
| Receber um Upvote em um Comentário    | **+2 pontos**            | `opinions.reactions.service.ts`             |
| Receber um Downvote em um Comentário  | **-1 ponto**             | `opinions.reactions.service.ts`             |
| Ter um comentário denunciado e aceito | **-10 pontos**           | Moderação / Endpoint de Report              |

## Regras estáticas

| **Regra** | **Comportamento** | **Onde aplicar** |
| --------- | ----------------- | ---------------- |
| Auto-voto | Bloquear qualquer alteração de reputação se o `user_id` do voto for igual ao `user_id` do autor do conteúdo (opinião ou thread) | `users.domainRules.ts` → `shouldApplyReputationFromVote` |
