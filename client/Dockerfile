# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve build with `serve`
FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/dist ./dist

# Expose the port changed to 4173
EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]
