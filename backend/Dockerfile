FROM node:14

WORKDIR /app

COPY . /app

RUN yarn install --ignore-optional

RUN yarn run build

EXPOSE $PORT

CMD "yarn" "run" "start"
