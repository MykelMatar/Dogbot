FROM node:16.13 as base

WORKDIR /home/michael/node/Dogbot
    
COPY package*.json ./
COPY tsconfig.json ./

RUN npm i

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build