# base image
FROM node:18.3-bullseye

# Set the application directory
WORKDIR /usr/src/app

ARG GL_NPM_TOKEN

ENV GL_NPM_TOKEN=$GL_NPM_TOKEN
RUN npm config set @development-team20:registry=https://gitlab.com/api/v4/packages/npm/
RUN npm config set '//gitlab.com/api/v4/packages/npm/:_authToken=${GL_NPM_TOKEN}'

COPY package*.json ./

RUN npm ci

ADD . .

RUN npx prisma generate

RUN npm run build

CMD ["/bin/sh","-c","npm run prisma:migrate && export OPENSSL_CONF=/etc/ssl/ && npm run start:prod"]
