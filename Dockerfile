FROM node:10.16

WORKDIR /home/bigmogician/website/portal

COPY . .

EXPOSE 3000
CMD ["yarn", "start:prod"]

