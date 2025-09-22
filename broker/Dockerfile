# Use Node.js 20 LTS
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose ports for MQTT broker and admin UI
EXPOSE 1883 8888 8051

# Start broker
CMD ["node", "broker.js"]
