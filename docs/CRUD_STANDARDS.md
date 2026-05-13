# AURORA CRUD Standard — Padrão Oficial de Desenvolvimento

Este documento define o padrão arquitetural e visual para todos os módulos CRUD do sistema Gestão Clínica. O objetivo é garantir consistência, performance e uma experiência de usuário "premium".

## 1. Estrutura de Páginas

### 1.1. Página de Listagem (`page.tsx`)
- **Container**: `mx-auto` com espaçamento interno equilibrado (`pb-10`).
- **Header**: Título em negrito e subtítulo dinâmico com contador de itens.
- **Barra de Ações**: Busca à esquerda (ícone `Search`) e botão de criação destacado à direita.
- **Tabela**: 
  - Wrapper: `bg-card border border-border rounded-2xl overflow-hidden shadow-sm`.
  - Header: Fundo `muted/40`, texto `font-bold text-[10px] uppercase tracking-widest`.
  - Linhas: Hover effect `hover:bg-muted/30` e transições suaves.
  - Avatares: Iniciais ou ícones em containers `rounded-xl` com cores do módulo.

### 1.2. Página de Detalhes (`[id]/page.tsx`)
- **Layout**: Centralizado com `max-w-6xl mx-auto`.
- **Master Container**: Todo o conteúdo deve ser envolvido por um container `bg-card/50 border border-border p-8 rounded-[2.5rem] shadow-sm`.
- **Cabeçalho de Identificação**: Card superior isolado com Avatar grande, Nome em destaque e Badges de status.
- **Grid de Informação**: Uso de cards temáticos agrupados logicamente (2 colunas para dados, 1 coluna para ações/status laterais).

## 2. Componente de Formulário (`Inline[Model]Form.tsx`)

### 2.1. Navegação (Multi-Step)
- **Stepper**: Indicador visual de progresso numerado no topo.
- **Isolamento de Botões**: Os botões de navegação ("Próximo", "Voltar") devem estar **FORA** da tag `<form>`.
- **Botão Final**: Utiliza `type="button"` e dispara o `handleSubmit(onSubmit)()` manualmente. Isso evita que o navegador tente submeter o form ao pressionar "Enter" ou trocar de etapa.

### 2.2. Validação e Feedback
- **Zod + React Hook Form**: Esquema de validação rigoroso compartilhado entre etapas.
- **Máscaras**: Uso obrigatório do componente `MaskedInput` para CPF, CNPJ, Telefone e CEP.
- **Toasts**: Feedback instantâneo via `sonner` para sucessos e erros de API.

## 3. Arquitetura de Dados
- **Hooks (TanStack Query)**: Centralizar lógica em `hooks/use[Model].ts` (list, detail, create, update, delete).
- **Services**: Chamadas de API isoladas em `lib/services.ts`.
- **Backend (NestJS)**: 
  - Uso de DTOs (`Create[Model]Dto`) com `class-validator`.
  - Transações no Prisma quando houver criação de múltiplas entidades (ex: User + Doctor).
  - Resposta paginada seguindo a interface `PaginatedResponse<T>`.

---
*Referência Canônica: Módulo de Pacientes e Módulo de Médicos.*
