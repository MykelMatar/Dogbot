FROM node:16.13.0 as base

WORKDIR /home/michael/node/Dogbot

# if running on oracle server
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true 

# Oracle Linux 8 
RUN yum upgrade -y \
    sudo dnf install https://yum.oracle.com/repo/OracleLinux/OL8/developer/EPEL/aarch64/getPackage/minizip-2.8.9-2.el8.aarch64.rpm \
    sudo dnf install https://yum.oracle.com/repo/OracleLinux/OL8/developer/EPEL/aarch64/getPackage/chromium-common-88.0.4324.150-1.0.1.el8.aarch64.rpm 

ENV PUPPETEER_CHROMIUM_REVISION 88.0.4324.150-1.0.1
ENV PUPPETEER_EXECUTABLE_PATH /usr/lib64/chromium-browser

    
COPY package*.json ./
COPY tsconfig.json ./

RUN npm i

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build