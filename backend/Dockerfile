FROM node:16

WORKDIR /app

COPY . /app

RUN yarn install --ignore-optional

RUN yarn run build

EXPOSE 1337

CMD "yarn" "run" "start"
