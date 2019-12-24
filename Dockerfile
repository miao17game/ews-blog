FROM node:10.16

WORKDIR /home/bigmogician/website/portal

RUN npm install yarn --global
RUN yarn install
RUN yarn build

COPY . .

EXPOSE 3000
CMD ["yarn", "start:prod"]

