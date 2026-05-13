# Gestão Clínica 🩺

[![Full Stack](https://img.shields.io/badge/Full%20Stack-Next.js%20%2B%20NestJS-blue)](https://github.com/lucaasnogueira/Gest-o-Clinica)
[![License](https://img.shields.io/badge/license-UNLICENSED-red)](#)

Uma plataforma premium de gestão clínica desenvolvida com foco em excelência visual (UI/UX) e robustez técnica. O projeto implementa o padrão **Aurora Portal**, garantindo interfaces fluidas, dashboards dinâmicos e fluxos de trabalho otimizados para profissionais da saúde.

---

## 🚀 Funcionalidades Principais

### 📊 Dashboard & Analytics
- Visualização em tempo real de KPIs clínicos.
- Gráficos dinâmicos de faturamento e volume de pacientes usando **Recharts**.
- Monitoramento de metas mensais e tendências de crescimento.

### 👥 Gestão de Pacientes & Médicos
- Cadastro completo com formulários inteligentes e multi-etapa.
- Padronização **Aurora CRUD** para consistência de interface.
- Filtros avançados e paginação otimizada.

### 📅 Agendamentos & Prontuários
- Fluxo de agendamento simplificado.
- **Prontuário Eletrônico**: Evolução clínica integrada diretamente ao atendimento.
- Histórico completo de consultas por paciente.

### 💰 Faturamento Automatizado
- Geração automática de faturas ao criar agendamentos.
- Controle de status de pagamento (Pendente, Pago, Cancelado).
- Integração de serviços financeiros no backend.

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) & Radix UI
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) & [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Charts**: [Recharts](https://recharts.org/)
- **Tests**: [Vitest](https://vitest.dev/) & React Testing Library

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL & Redis (Cache/Queue)
- **Documentation**: Swagger UI
- **Tests**: [Jest](https://jestjs.io/)
- **Architecture**: Domain-Driven Design (DDD) principles

---

## 📦 Estrutura do Projeto

```text
├── backend/          # API NestJS (Porta 3001)
├── frontend/         # Aplicação Next.js (Porta 3000)
├── docs/             # Documentação de padrões (Aurora Standard)
└── docker-compose.yml # PostgreSQL & Redis
```

---

## 🔧 Como Executar

### 1. Pré-requisitos
- Node.js (v18+)
- Docker Desktop

### 2. Infraestrutura
Na raiz do projeto:
```bash
docker-compose up -d
```

### 3. Backend
```bash
cd backend
npm install
npx prisma generate
npm run dev
```
- API: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api/docs`

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web: `http://localhost:3000`

---

## 🧪 Suíte de Testes

O projeto preza pela confiabilidade através de testes automatizados:

- **Backend**: Execute `npm run test` na pasta `backend` (Jest).
- **Frontend**: Execute `npm run test` na pasta `frontend` (Vitest).

---

## 🎨 Design Principles (Aurora Portal)

Este projeto segue o guia de estilo **Aurora Portal**, que prioriza:
- **Aesthetics**: Dark mode nativo, gradientes suaves e micro-animações.
- **Usability**: Feedback imediato (sonner toasts), estados de loading esqueletizados e acessibilidade.
- **Scalability**: Componentes altamente reutilizáveis e lógica desacoplada.

---

Desenvolvido por [Lucas Nogueira](https://github.com/lucaasnogueira).
