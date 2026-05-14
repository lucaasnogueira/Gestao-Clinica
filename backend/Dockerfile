# Build Stage
FROM node:20-alpine AS builder

# Instalar dependências do sistema necessárias para o Prisma e NestJS
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Instalar dependências globais necessárias
RUN npm install -g @nestjs/cli

# Copiar arquivos de configuração primeiro para aproveitar o cache
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma/

RUN npm install

# Copiar o restante do código
COPY . .

# Gerar Prisma Client e Build
RUN npx prisma generate
RUN npm run build

# ---
# Production Stage
FROM node:20-alpine AS runner

# Instalar dependências de runtime necessárias
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

# Copiar apenas o necessário
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# A porta será definida pelo Railway via variável de ambiente PORT
EXPOSE 3001

# Comando de inicialização robusto com logs extras e seed automático
CMD ["sh", "-c", "echo '🔄 Iniciando migrações do banco de dados...' && npx prisma migrate deploy && echo '✅ Migração concluída!' && echo '🌱 Iniciando seed do banco de dados...' && npx prisma db seed && echo '✅ Seed concluído!' && echo '🚀 Iniciando aplicação Node...' && node dist/main.js"]
