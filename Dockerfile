FROM node:25.2

WORKDIR /app

RUN apt install openssl

COPY . . 
RUN npm install

RUN npx prisma generate

EXPOSE 8080

CMD ["npm", "start"]
