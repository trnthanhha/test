FROM node:14-alpine3.16

WORKDIR /usr/src/app

COPY package.json package.json

RUN npm install

COPY ./ ./

RUN npm run build

LABEL org.opencontainers.image.source="https://github.com/namnhagiletech/locamos"

CMD ["node", "dist/main"]