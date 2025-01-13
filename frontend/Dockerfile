

# Use an official Node.js image for building and running the application
FROM node:23-alpine3.20 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite application
RUN npm run build

# Use the same Node.js image for running the application
FROM alpine:3.20 

# Install a minimal HTTP server
RUN apk add --no-cache nodejs npm && npm install -g serve

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the Vite development server's default port
EXPOSE 5173

# Command to serve the application
CMD ["serve", "-s", "dist", "-l", "5173"]




