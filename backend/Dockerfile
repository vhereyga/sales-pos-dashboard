FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb* ./
COPY prisma ./prisma/

RUN bun install

COPY . .

RUN bunx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "bun run prisma db push && bun start"]
