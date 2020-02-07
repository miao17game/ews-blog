FROM node:10.16-slim

RUN mkdir -p /app
RUN mkdir -p /app/client
RUN mkdir -p /app/server

RUN npm install yarn --global

ADD package.json /app/package.json
ADD yarn.lock /app/yarn.lock
RUN cd /app && yarn install

ADD client/package.json /app/client/package.json
ADD client/yarn.lock /app/client/yarn.lock
RUN cd /app/client && yarn install

ADD server/package.json /app/server/package.json
ADD server/yarn.lock /app/server/yarn.lock
RUN cd /app/server && yarn install

ADD server /app/server
RUN cd /app/server && yarn build

ADD webpack.config.js /app/webpack.config.js
ADD tsconfig.websdk.json /app/tsconfig.websdk.json
ADD scripts/build-sdk.js /app/scripts/build-sdk.js
RUN cd /app && yarn build:websdk

ADD client /app/client
RUN cd /app/client && yarn build

WORKDIR /app

RUN yarn postbuild

RUN npx rimraf client

EXPOSE 3000

CMD ["yarn", "start:prod"]

