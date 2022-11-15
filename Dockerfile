FROM node:15-alpine

RUN npm install -g nodemon

WORKDIR /app

COPY package.json .

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4000

CMD ["npm", "run" , "dev"]