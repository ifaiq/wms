#NODE BUILDER (STAGE-0) RUN TO BUILD THE PROD READY CODE
FROM node:16.13.1-alpine as builder
ARG PUBLIC_URL=/stockflo
ENV PUBLIC_URL=${PUBLIC_URL}
RUN apk add --no-cache \
    sudo \
    curl \
    build-base \
    g++ \
    libpng \
    libpng-dev \
    jpeg-dev \
    pango-dev \
    cairo-dev \
    giflib-dev \
    python3 \
    ;
RUN mkdir -p /opt/web/portal
WORKDIR /opt/web/portal/

# Copy package.json and run install to use docker caching
# when possible to avoid re-run of yarn install step if nothing in
# package.json changed
RUN echo ${PUBLIC_URL}

COPY package.json .

COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . .

RUN DISABLE_ESLINT_PLUGIN=true yarn build

#NGINX STAGE-1 TO HOST THE CODE OVER NGINX
FROM nginx:1.20.2-alpine
ARG PUBLIC_URL=/stockflo
ENV PUBLIC_URL=${PUBLIC_URL}
WORKDIR /etc/nginx
COPY --from=builder /opt/web/portal/nginx.conf.template .
RUN envsubst '${PUBLIC_URL}' < nginx.conf.template > nginx.conf

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
RUN mkdir -p stockflo
COPY --from=builder /opt/web/portal/build ./stockflo