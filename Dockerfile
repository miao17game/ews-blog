FROM node:10.16-slim

RUN mkdir -p /app
RUN mkdir -p /app/client
RUN mkdir -p /app/server

RUN npm install yarn --global

ADD package.json /app/package.json
ADD yarn.lock /app/yarn.lock
RUN cd /app && yarn install

ADD server/package.json /app/server/package.json
ADD server/yarn.lock /app/server/yarn.lock
RUN cd /app/server && yarn install

ADD server /app/server
RUN cd /app/server && yarn build

ADD client/dist /app/client/dist

WORKDIR /app

RUN yarn postbuild

RUN npx rimraf client

EXPOSE 3000

CMD ["yarn", "start:prod"]

