# 🏥 Clinic Management API

API backend do Sistema de Gerenciamento de Clínicas.

**Stack:** NestJS 10 · Prisma · PostgreSQL · Redis · JWT

---

## 🚀 Início Rápido

### 1. Subir infraestrutura com Docker
```bash
docker compose up -d
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Gerar Prisma Client
```bash
npx prisma generate
```

### 4. Executar migrations
```bash
npx prisma migrate dev --name init
```

### 5. Popular banco com dados iniciais
```bash
npx prisma db seed
```

### 6. Iniciar em desenvolvimento
```bash
npm run start:dev
```

---

## 📚 URLs

| Recurso     | URL                                    |
|-------------|----------------------------------------|
| API Base    | http://localhost:3001/api/v1            |
| Swagger     | http://localhost:3001/api/docs          |
| PostgreSQL  | localhost:5432 (clinic_user/clinic_pass)|
| Redis       | localhost:6379                          |

---

## 🔑 Credenciais Padrão (Seed)

| Perfil       | Email                      | Senha       |
|--------------|----------------------------|-------------|
| Admin        | admin@clinic.com           | Admin@123   |
| Médico       | dr.silva@clinic.com        | Doctor@123  |
| Recepção     | recepcao@clinic.com        | Recept@123  |

---

## 📁 Estrutura dos Módulos

```
src/
├── auth/              # JWT, login, refresh token
├── users/             # Usuários do sistema
├── patients/          # Gestão de pacientes
├── doctors/           # Gestão de médicos
├── appointments/      # Agendamentos + conflito checker
├── medical-records/   # Prontuários eletrônicos
├── specialties/       # Especialidades médicas
├── schedules/         # Horários de atendimento
├── insurance/         # Convênios
├── billing/           # Faturamento
├── notifications/     # Notificações + BullMQ
├── reports/           # Relatórios gerenciais
├── prisma/            # Database service
└── common/            # DTOs, decorators, filters
```

---

## 🛡️ Papéis e Permissões (RBAC)

| Role          | Permissões                                          |
|---------------|-----------------------------------------------------|
| ADMIN         | Acesso total                                        |
| DOCTOR        | Prontuários, prescrições, agenda própria             |
| NURSE         | Triagem, prontuários, exames                        |
| RECEPTIONIST  | Agendamentos, pacientes, faturamento básico          |
| PATIENT       | Portal do paciente (próprios dados)                 |

---

## 🔗 Endpoints Principais

### Auth
- `POST /api/v1/auth/login` — Login
- `POST /api/v1/auth/refresh` — Renovar token
- `GET  /api/v1/auth/me` — Perfil atual

### Pacientes
- `GET  /api/v1/patients` — Listar
- `POST /api/v1/patients` — Criar
- `GET  /api/v1/patients/search?q=nome` — Busca rápida
- `GET  /api/v1/patients/:id` — Detalhe

### Agendamentos
- `GET  /api/v1/appointments/today` — Agenda do dia
- `POST /api/v1/appointments` — Criar agendamento
- `PATCH /api/v1/appointments/:id/status` — Atualizar status

Veja a documentação completa em: **http://localhost:3001/api/docs**
