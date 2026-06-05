# Autenticação — implementação e próximos passos

Documentação do fluxo de tokens implementado no GuiaReal (backend Express + frontend Next.js).

## O que foi implementado

### Backend

| Item | Descrição |
|------|-----------|
| **Login** `POST /api/auth/login` | Retorna `{ accessToken, user }` no JSON. Define cookie HttpOnly `guiareal_refresh` (path `/api/auth`). |
| **Refresh** `POST /api/auth/refresh` | Lê refresh do cookie; retorna `{ accessToken, user }`. Sem body obrigatório. |
| **Logout** `POST /api/auth/logout` | Revoga hash no Redis, limpa cookie, responde `204`. |
| **CORS** | `credentials: true` + `origin` via `CORS_ORIGIN` (padrão `http://localhost:3001`). |
| **Cookies** | Helper [`backend/src/lib/authCookies.ts`](../backend/src/lib/authCookies.ts), `cookie-parser` no servidor. |
| **Redis** | `deleteRefreshToken` para logout. |

Variáveis novas em [`backend/example.env`](../backend/example.env): `CORS_ORIGIN`, `REFRESH_COOKIE_NAME`, `COOKIE_SECURE`, `COOKIE_SAME_SITE`.

### Frontend

| Item | Descrição |
|------|-----------|
| **`authStore`** | `accessToken`, `user` (com `id`), `isHydrated`, actions `setAuth` / `clearAuth` / `setHydrated`. |
| **`apiClient`** | `credentials: "include"`; em `401` tenta `refreshSession` e repete a requisição uma vez. |
| **`refreshSession`** | `POST /auth/refresh` com cookie; atualiza o store. |
| **`AuthBootstrap`** | Ao carregar o app, restaura sessão via cookie se não houver access em memória. |
| **`useRequireAuth`** | Hook para páginas privadas: espera hidratação e redireciona para `/login`. |
| **`logout()`** | [`frontend/src/lib/auth.ts`](../frontend/src/lib/auth.ts) — chama API e limpa store. |
| **Login** | Usa `response.accessToken`. |
| **Register** | Apenas cria conta; redireciona para `/login` com toast. |

Config de exemplo: [`frontend/.env.example`](../frontend/.env.example).

### Fluxo resumido

```
Login → accessToken (memória/Zustand) + refresh (cookie HttpOnly na API)
API protegida → Authorization: Bearer <accessToken>
401 → refresh automático → retry
F5 → AuthBootstrap → refresh via cookie → accessToken de volta
Logout → revoga Redis + limpa cookie + clearAuth
```

## Como rodar em desenvolvimento

1. **Backend** (porta 3000), com Redis e `.env` configurado:
   ```bash
   cd backend && npm run dev
   ```
   Defina `CORS_ORIGIN=http://localhost:3001` e `JWT_ACCESS_SECRET`.

2. **Frontend** (porta 3001 para evitar conflito):
   ```bash
   cd frontend && cp .env.example .env.local
   npm run dev -- -p 3001
   ```

3. Teste no navegador: login → cookie em DevTools (domínio `localhost:3000`, path `/api/auth`) → F5 mantém sessão via bootstrap.

## Arquivos principais

**Backend:** `server.ts`, `lib/authCookies.ts`, `modules/auth/auth.controller.ts`, `auth.routes.ts`, `auth.service.ts`, `refreshTokenRedis.store.ts`

**Frontend:** `lib/api.ts`, `store/authStore.ts`, `components/AuthBootstrap.tsx`, `hooks/useRequireAuth.ts`, `lib/auth.ts`, `lib/types/auth.ts`

## Próximo passo recomendado

A autenticação está pronta para consumir rotas protegidas (`/api/products`, `/api/nodes`). O próximo passo natural do app:

1. **Criar área autenticada no App Router** — ex.: `app/(app)/layout.tsx` usando `useRequireAuth()` e um estado de loading enquanto `isReady === false`.

2. **Primeira tela de produto/nó** — formulário ou listagem que chame `apiClient("/nodes", …)` / `apiClient("/products", …)`; o Bearer e o refresh em 401 já estão centralizados.

3. **UI de logout** — botão no header que chama `logout()` de `@/lib/auth` e `router.push("/login")`.

4. **(Opcional)** Redirect em `/login` se `selectIsAuthenticated` após hidratação; rotação de refresh token no backend para hardening.

### Exemplo mínimo de página protegida

```tsx
"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function MinhaPageProtegida() {
  const { isReady, isAuthenticated, user } = useRequireAuth();

  if (!isReady) return <p>Carregando…</p>;
  if (!isAuthenticated) return null;

  return <p>Olá, {user?.username}</p>;
}
```

### Limitação importante

O cookie de refresh pertence ao **host da API** (`localhost:3000`), não ao Next (`localhost:3001`). Proteção de rotas deve ser **no cliente** (`useRequireAuth` + `isHydrated`), não via `middleware.ts` lendo o refresh cookie.

---

*Gerado após implementação do plano de auth HttpOnly — junho/2026.*
