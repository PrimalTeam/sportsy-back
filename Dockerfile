FROM node:18

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm run start:dev"]