FROM node:16.13.0 as base

WORKDIR /home/michael/node/Dogbot

RUN apt-get update && \
    apt-get install -y \
    curl \
    fonts-liberation \
    gconf-service \
    libappindicator1 \
    libasound2 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libfontconfig1 \
    libgbm-dev \
    libgdk-pixbuf2.0-0 \
    ibgtk-3-0 \
    libicu-dev \
    libjpeg-dev \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpng-dev \
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
    xdg-utils

# if running on linux
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true 

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci 
RUN npm i

RUN chmod -R o+rwx node_modules/puppeteer/.local-chromium

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build