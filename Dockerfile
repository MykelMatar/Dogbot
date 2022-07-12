FROM node:16.13.0 as base

WORKDIR /home/michael/node/Dogbot

# if running on oracle server
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true 

ENV CHROME_VERSION "google-chrome-stable"
RUN sed -i -- 's&deb http://deb.debian.org/debian jessie-updates main&#deb http://deb.debian.org/debian jessie-updates main&g' /etc/apt/sources.list \
  && apt-get update && apt-get install wget -y
ENV CHROME_VERSION "google-chrome-stable"
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list \
  && apt-get update && apt-get -qqy install ${CHROME_VERSION:-google-chrome-stable}
CMD /bin/bash
    
COPY package*.json ./
COPY tsconfig.json ./

RUN npm i

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build