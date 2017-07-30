FROM node:alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

CMD yarn install

COPY . /usr/src/app/

CMD yarn start