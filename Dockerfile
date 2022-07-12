FROM node:16.13 as base

WORKDIR /home/michael/node/Dogbot

# if running on oracle server
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true 
    
COPY package*.json ./
COPY tsconfig.json ./

RUN npm i

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build