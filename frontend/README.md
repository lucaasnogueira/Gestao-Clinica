# 🏥 ClinicaOS — Frontend (Next.js 14)

Interface web do Sistema de Gerenciamento de Clínicas, consumindo a API NestJS (`clinic-api`).

**Stack:** Next.js 14 · Tailwind CSS · TanStack Query · Zustand · React Hook Form + Zod · Radix UI

---

## 📋 Pré-requisitos

| Ferramenta | Versão Mínima |
|------------|---------------|
| Node.js    | 20+           |
| npm        | 10+           |
| Docker     | 20+ (opcional)|

A API backend (`clinic-api`) deve estar rodando em `localhost:3001` antes de iniciar o frontend.

---

## 🚀 Início Rápido (Desenvolvimento)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local se a API não estiver em localhost:3001

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

### Credenciais de demonstração

| Usuário | Senha | Role |
|---------|-------|------|
| `admin@clinica.com` | `Admin@123` | Administrador |
| `dr.silva@clinica.com` | `Doctor@123` | Médico |
| `recepcao@clinica.com` | `Recepcao@123` | Recepcionista |

---

## 🐳 Docker

### Apenas o frontend (API rodando no host)

```bash
# Build e subir
docker compose up -d --build

# Ver logs
docker compose logs -f web

# Parar
docker compose down
```

O container roda na porta **3000**.

> ⚠️ Lembre-se de ajustar `NEXT_PUBLIC_API_URL` no `.env.docker` apontando para o endereço correto da API.

### Com Nginx em produção

```bash
docker compose --profile production up -d --build
```

O Nginx fica na porta **80** e faz proxy para o Next.js na porta 3000.

### Integrando com o docker-compose do backend

Para rodar frontend e backend juntos, adicione este serviço ao `docker-compose.yml` do `clinic-api`:

```yaml
web:
  build:
    context: ./clinic-web
    dockerfile: Dockerfile
    args:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
  container_name: clinic_web
  restart: unless-stopped
  ports:
    - '3000:3000'
  environment:
    API_URL: http://api:3001/api          # rede interna Docker
    NEXT_PUBLIC_API_URL: http://localhost:3001/api  # cliente
  depends_on:
    - api
  networks:
    - clinic_network
```

---

## 🗂️ Estrutura do Projeto

```
clinic-web/
│
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Grupo sem layout do dashboard
│   │   ├── layout.tsx           # Layout dark glass
│   │   └── login/page.tsx       # Página de login
│   │
│   ├── (dashboard)/             # Grupo protegido com sidebar
│   │   ├── layout.tsx           # Layout com Sidebar + AuthGuard
│   │   ├── page.tsx             # Dashboard principal
│   │   ├── patients/
│   │   │   ├── page.tsx         # Lista paginada de pacientes
│   │   │   ├── new/page.tsx     # Cadastro de paciente
│   │   │   └── [id]/page.tsx    # Detalhe do paciente
│   │   ├── appointments/
│   │   │   ├── page.tsx         # Lista com filtros e ações de status
│   │   │   └── new/page.tsx     # (em construção)
│   │   ├── doctors/page.tsx     # Cards de médicos
│   │   ├── medical-records/     # (em construção)
│   │   ├── billing/             # (em construção)
│   │   ├── insurance/           # (em construção)
│   │   ├── reports/             # (em construção)
│   │   └── settings/            # (em construção)
│   │
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Redirect → /dashboard
│   └── globals.css              # Variáveis CSS, Tailwind, fontes
│
├── components/
│   ├── layout/
│   │   └── sidebar.tsx          # Sidebar com navegação e logout
│   ├── shared/
│   │   ├── providers.tsx        # React Query QueryClientProvider
│   │   ├── auth-guard.tsx       # Proteção de rotas autenticadas
│   │   └── page-header.tsx      # Componente de cabeçalho de página
│   └── ui/
│       └── badge.tsx            # Badge de status reutilizável
│
├── lib/
│   ├── api.ts                   # Axios com refresh token automático
│   ├── services.ts              # Funções de API por módulo
│   └── utils.ts                 # Formatadores, helpers, labels
│
├── store/
│   └── auth.store.ts            # Estado de autenticação (Zustand)
│
├── types/
│   └── index.ts                 # Todos os tipos TypeScript
│
├── nginx/
│   └── nginx.conf               # Configuração Nginx (produção)
│
├── Dockerfile                   # Build multi-stage
├── docker-compose.yml           # Orquestração Docker
├── .env.local.example           # Template de variáveis (dev)
├── .env.docker                  # Template de variáveis (Docker)
├── next.config.js               # Configuração Next.js (output: standalone)
├── tailwind.config.ts           # Design tokens
└── tsconfig.json                # TypeScript strict
```

---

## 🔧 Variáveis de Ambiente

### `.env.local` (desenvolvimento)

```bash
# URL pública da API (acessada pelo browser)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# URL interna da API (SSR no servidor Next.js)
API_URL=http://localhost:3001/api
```

### `.env.docker` (Docker)

```bash
# URL pública (precisa ser acessível pelo browser do usuário final)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# URL interna (comunicação container → container)
API_URL=http://api:3001/api

NODE_ENV=production
```

> **Atenção:** `NEXT_PUBLIC_*` é embutida no bundle JavaScript em **build-time**. Para trocar a URL em produção sem rebuildar, passe como `ARG` no Dockerfile.

---

## 📦 Comandos

```bash
npm run dev        # Desenvolvimento com hot-reload
npm run build      # Build de produção
npm run start      # Servidor de produção (após build)
npm run lint       # ESLint
npm run type-check # Verificação TypeScript
```

---

## 🔑 Funcionalidades Implementadas

| Módulo | Status | Descrição |
|--------|--------|-----------|
| Login / Logout | ✅ Completo | JWT com refresh automático |
| AuthGuard | ✅ Completo | Proteção de todas as rotas do dashboard |
| Dashboard | ✅ Completo | Stats do dia + agenda em tempo real (30s) |
| Pacientes — Lista | ✅ Completo | Paginação, busca por nome/CPF/tel |
| Pacientes — Cadastro | ✅ Completo | Formulário completo com validação Zod |
| Pacientes — Detalhe | ✅ Completo | Histórico, alertas, ações rápidas |
| Agendamentos | ✅ Completo | Filtros por data/status, fluxo de status |
| Médicos | ✅ Completo | Cards com especialidades e grade |
| Prontuários | 🚧 Stub | Em construção |
| Faturamento | 🚧 Stub | Em construção |
| Convênios | 🚧 Stub | Em construção |
| Relatórios | 🚧 Stub | Em construção |
| Configurações | 🚧 Stub | Em construção |

---

## 🏗️ Arquitetura e Decisões Técnicas

### Autenticação
- **Zustand** com `persist` armazena `user`, `accessToken` e `refreshToken` no `localStorage`
- **Axios interceptors** fazem refresh silencioso quando a API retorna 401
- `AuthGuard` verifica o estado antes de renderizar o conteúdo protegido

### Estado do servidor
- **TanStack Query** gerencia cache, loading states e refetch
- `staleTime: 1min` evita requisições duplicadas; `refetchInterval: 30s` para a agenda do dashboard
- Mutações invalidam queries relacionadas para manter consistência

### Formulários
- **React Hook Form** com resolvers **Zod** para validação type-safe
- Erros exibidos inline sem submit; dados enviados diretamente à API via `useMutation`

### Design System
- Fontes: **DM Sans** (texto) + **DM Mono** (código/dados)
- CSS variables para temas (sidebar dark, conteúdo light)
- Classes utilitárias para status (`statusColor()`, `paymentStatusColor()`)

---

## 🔄 Fluxo de uma Requisição

```
[Browser]
   │
   ▼
[Next.js Client Component]
   │  useQuery / useMutation (TanStack Query)
   ▼
[lib/services.ts]  → função específica por módulo
   │
   ▼
[lib/api.ts]  → axios instance
   │  interceptor → adiciona Bearer token
   │  interceptor → refresh automático no 401
   ▼
[NestJS API :3001]
   │
   ▼
[Resposta tipada] → atualiza cache do React Query
```

---

## 🛡️ Checklist de Produção

- [ ] Ajustar `NEXT_PUBLIC_API_URL` para o domínio real da API
- [ ] Configurar HTTPS no Nginx (Let's Encrypt)
- [ ] Definir `NEXTAUTH_SECRET` seguro (se usar next-auth)
- [ ] Revisar `Content-Security-Policy` no nginx.conf
- [ ] Testar build: `npm run build && npm run start`
- [ ] Testar container: `docker compose up --build`
- [ ] Verificar que o refresh token está funcionando
- [ ] Testar em diferentes resoluções (mobile, tablet, desktop)

---

ClinicaOS Frontend v1.0 — Next.js 14 + Tailwind CSS + TanStack Query
