ARG node_version=18-alpine
FROM node:${node_version}
LABEL maintainer="Francis Adeboye"

WORKDIR /app

# Copy package files
COPY src/package.json src/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application code
COPY src/server.js ./
COPY src/public ./public

EXPOSE 3000

CMD ["node", "server.js"]