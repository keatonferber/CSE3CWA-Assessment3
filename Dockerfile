# Assessment 3: the application and database run as separate Docker Compose services.
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ENV DATABASE_URL="postgresql://cse3cwa:cse3cwa@db:5432/phoneme_builder?schema=public"
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health >/dev/null || exit 1

CMD ["npm", "start"]
