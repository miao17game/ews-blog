FROM node:10.16

WORKDIR /home/bigmogician/website/portal

COPY . .

RUN npm install yarn --global
RUN yarn install
RUN yarn build

EXPOSE 3000
CMD ["yarn", "start:prod"]

