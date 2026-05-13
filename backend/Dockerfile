# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências necessárias para o build
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copiar o código e gerar o client do Prisma
COPY . .
RUN npx prisma generate
RUN npm run build

# ---
# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiar apenas o necessário para rodar
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expor a porta padrão do backend
EXPOSE 3001

# Comando para rodar migrações e iniciar a aplicação
# Nota: No Railway, a variável DATABASE_URL deve estar configurada
CMD npx prisma migrate deploy && node dist/main
