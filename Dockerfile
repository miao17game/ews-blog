FROM node:10.16

RUN mkdir -p /app
RUN mkdir -p /app/client
RUN mkdir -p /app/server

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
COPY client/package.json /app/client/package.json
COPY client/yarn.lock /app/client/yarn.lock
COPY server/package.json /app/server/package.json
COPY server/yarn.lock /app/server/yarn.lock

RUN npm install yarn --global
RUN cd /app && yarn install

WORKDIR /app
COPY . /app

RUN yarn build

RUN npx rimraf client

EXPOSE 3000
CMD ["yarn", "start:prod"]

