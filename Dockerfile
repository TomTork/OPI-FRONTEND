FROM node:20

ENV CI=true

WORKDIR /usr/src/nuxt-app

COPY package.json pnpm-lock.yaml ./

COPY . .

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm run build

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]