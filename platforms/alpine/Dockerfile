FROM node:24-alpine
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

ARG VIPS_VERSION="8.16.1"

RUN apk update && \
    apk add --no-cache \
    wget \
    pkgconfig \
    build-base \
    glib-dev \
    expat-dev \
    meson \
    x265-dev \
    libde265-dev \
    libheif-dev \
    libjpeg-turbo-dev \
    python3
    
RUN wget https://github.com/libvips/libvips/releases/download/v${VIPS_VERSION}/vips-${VIPS_VERSION}.tar.xz && \
    tar -xf vips-${VIPS_VERSION}.tar.xz && \
    cd /vips-${VIPS_VERSION} && \
    meson setup build --prefix=/usr/local --buildtype=release -Djpeg=enabled -Dheif=enabled && \
    cd build && \
    meson compile && \
    meson install && \
    cd ../.. && \
    rm -rf vips-${VIPS_VERSION} vips-${VIPS_VERSION}.tar.xz

WORKDIR /app
COPY . .
RUN npm i
RUN npm run build
CMD ["node", "./dist/index.js"]
