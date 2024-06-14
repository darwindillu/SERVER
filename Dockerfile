FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY Controllers /app/Controllers
COPY middleware /app/middleware
COPY Model /app/Model
COPY Public /app/Public
COPY Routes /app/Routes
COPY utils /app/utils
COPY index.js /app/index.js
COPY server.js /app/server.js

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "index.js"]
