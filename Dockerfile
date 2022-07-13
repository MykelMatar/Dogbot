FROM --platform=linux/arm64 node:16.13.0 as base

WORKDIR /home/michael/node/Dogbot

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true 

RUN apt-get update \
&& apt-get install -y chromium \
&& apt-get install -y ca-certificates \
fonts-liberation \
libappindicator3-1 \
libasound2 \
libatk-bridge2.0-0 \
libatk1.0-0 \
libc6 \
libcairo2 \
libcups2 \
libdbus-1-3 \
libexpat1 \
libfontconfig1 \
libgbm1 \
libgcc1 \
libglib2.0-0 \
libgtk-3-0 \
libnspr4 \
libnss3 \
libpango-1.0-0 \
libpangocairo-1.0-0 \
libstdc++6 \
libx11-6 \
libx11-xcb1 \
libxcb1 \
libxcomposite1 \
libxcursor1 \
libxdamage1 \
libxext6 \
libxfixes3 \
libxi6 \
libxrandr2 \
libxrender1 \
libxss1 \
libxtst6 \
lsb-release \
wget \
xdg-utils

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium
    
COPY package*.json ./
COPY tsconfig.json ./

RUN npm i
RUN npm uninstall puppeteer
RUN npm install puppeteer@10.0.0

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build