FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8011

CMD ["node", "koa-api.js"]
