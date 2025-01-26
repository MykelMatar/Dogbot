# Bun base image
FROM oven/bun:1 AS base
#FROM imbios/bun-node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies using Bun
FROM base AS install
run mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev
RUN cd /temp/dev && bun install --frozen-lockfile

# Copy the rest of your bot's code
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Set environment variables from the .env file (passed at runtime)
ENV NODE_ENV=production

# Expose a port (if your bot uses one)
# EXPOSE 3000

# Start the bot with Bun
#USER bun
CMD ["bun", "run", "start"]

