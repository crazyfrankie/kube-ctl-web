FROM node:lts as builder
WORKDIR /app/kube-ctl-web

COPY . .

RUN npm install

RUN npm run build:prod

FROM nginx:alpine

COPY --from=builder /app/kube-ctl-web/dist/ /usr/share/nginx/html/
COPY --from=builder /app/kube-ctl-web/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

