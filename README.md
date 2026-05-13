# Gestão Clínica — Full Stack Project

Este projeto foi reorganizado para facilitar o desenvolvimento local, mantendo a infraestrutura no Docker e as aplicações rodando diretamente no terminal.

## Estrutura do Projeto

- `backend/`: API NestJS (Porta 3001)
- `frontend/`: Aplicação Next.js (Porta 3000)
- `docs/`: Documentação de padrões e arquitetura
- `docker-compose.yml`: Infraestrutura (PostgreSQL e Redis)

## Como Executar

### 1. Requisitos
- Node.js (v18+)
- Docker Desktop
- npm ou yarn

### 2. Infraestrutura (Banco de Dados e Redis)
Na raiz do projeto, execute:
```bash
docker-compose up -d
```

### 3. Backend
Entre na pasta `backend`, instale as dependências e inicie o servidor:
```bash
cd backend
npm install
npx prisma generate
npm run dev
```
O backend estará disponível em `http://localhost:3001/api/v1`.
Swagger: `http://localhost:3001/api/docs`.

### 4. Frontend
Entre na pasta `frontend`, instale as dependências e inicie o servidor:
```bash
cd frontend
npm install
npm run dev
```
O frontend estará disponível em `http://localhost:3000`.

## Limpeza e Organização
- Containers da aplicação (API/Web) foram removidos do Docker.
- Arquivos de log e debug foram deletados.
- Scripts duplicados e configurações antigas foram removidas.
- Padronização dos scripts `npm run dev` em ambos os projetos.
