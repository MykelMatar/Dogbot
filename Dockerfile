FROM node:16.13.0 as base

WORKDIR /home/michael/node/Dogbot

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true 

RUN apt update &&  apt install -y chromium
    
COPY package*.json ./
COPY tsconfig.json ./

RUN npm i

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build