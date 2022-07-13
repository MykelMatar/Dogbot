FROM node:16.13.0 as base

WORKDIR /home/michael/node/Dogbot

# if running on linux
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true 

RUN apt-get install -y && \
    apt-get fonts-liberation && \
    apt-get gconf-service && \
    apt-get libappindicator1 && \
    apt-get libasound2  && \
    apt-get libatk1.0-0  && \
    apt-get libcairo2  && \
    apt-get libcups2 && \
    apt-get libfontconfig1 && \
    apt-get libgbm-dev   && \
    apt-get libgdk-pixbuf2.0-0 && \
    apt-get libgtk-3-0 && \
    apt-get libicu-dev && \
    apt-get libjpeg-dev && \
    apt-get libnspr4 && \
    apt-get libnss3 && \
    apt-get libpango-1.0-0 && \
    apt-get libpangocairo-1.0-0 && \
    apt-get libpng-dev && \
    apt-get libx11-6 && \
    apt-get libx11-xcb1 && \
    apt-get libxcb1 && \
    apt-get libxcomposite1 && \
    apt-get libxcursor1 &&\
    apt-get libxdamage1 &&\
    apt-get libxext6 &&\
    apt-get libxfixes3 &&\
    apt-get libxi6 &&\
    apt-get libxrandr2 &&\
    apt-get libxrender1 &&\
    apt-get libxss1 &&\
    apt-get libxtst6 &&\
    apt-get xdg-utils&&\

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci 
RUN npm i

RUN chmod -R o+rwx node_modules/puppeteer/.local-chromium

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build