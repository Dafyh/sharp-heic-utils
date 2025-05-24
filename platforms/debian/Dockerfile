FROM node:24-bullseye
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

ARG VIPS_VERSION="8.16.1"

RUN apt-get update && \
    apt-get install -y \
    wget \
    build-essential \
    meson \
    pkg-config \
    libglib2.0-dev \
    libexpat1-dev \
    libjpeg62-turbo-dev \
    libheif-dev \
    libde265-dev \
    libx265-dev \
    python3 make cmake && \
    apt-get clean all

RUN wget https://github.com/libvips/libvips/releases/download/v${VIPS_VERSION}/vips-${VIPS_VERSION}.tar.xz && \
    tar -xf vips-${VIPS_VERSION}.tar.xz && \
    cd /vips-${VIPS_VERSION} && \
    meson setup build --prefix=/usr/local --buildtype=release -Djpeg=enabled -Dheif=enabled && \
    cd build && \
    meson compile && \
    meson install && \
    cd ../.. && \
    rm -rf vips-${VIPS_VERSION} vips-${VIPS_VERSION}.tar.xz

RUN ldconfig

WORKDIR /app
COPY . .
RUN npm i 
RUN npm run build
CMD ["node", "./dist/index.js"]