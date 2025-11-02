# Base image
FROM oven/bun:1
# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build TypeScript
RUN bun run build

# Expose API port
EXPOSE 8000

# Start app
CMD ["bun", "run", "start"]
