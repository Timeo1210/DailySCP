FROM node:current-alpine
WORKDIR /app
COPY package.json /app
RUN apk add --no-cache udev ttf-freefont chromium git
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN npm install
COPY . /app
CMD ["npm", "start"]