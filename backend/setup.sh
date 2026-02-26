#!/bin/bash
set -e

echo "╔══════════════════════════════════════════════════════╗"
echo "║   🏥  Clinic Management API - Setup Inicial           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

step() { echo -e "${BLUE}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# 1. Docker
step "Subindo PostgreSQL e Redis com Docker..."
docker compose up -d
echo "Aguardando PostgreSQL ficar pronto..."
until docker exec clinic_postgres pg_isready -U clinic_user -d clinic_db > /dev/null 2>&1; do
  printf '.'
  sleep 2
done
echo ""
ok "Banco de dados pronto!"

# 2. npm install
step "Instalando dependências npm..."
npm install
ok "Dependências instaladas!"

# 3. Prisma generate
step "Gerando Prisma Client..."
npx prisma generate
ok "Prisma Client gerado!"

# 4. Migrations
step "Executando migrations..."
npx prisma migrate dev --name init
ok "Migrations executadas!"

# 5. Seed
step "Populando banco com dados iniciais..."
npx prisma db seed
ok "Seed concluído!"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   🎉  Setup concluído! Inicie com:                    ║"
echo "║                                                       ║"
echo "║      npm run start:dev                                ║"
echo "║                                                       ║"
echo "║   📚 Swagger: http://localhost:3001/api/docs          ║"
echo "╚══════════════════════════════════════════════════════╝"
