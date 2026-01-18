FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port Vite uses (8000 as configured)
EXPOSE 8000

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]