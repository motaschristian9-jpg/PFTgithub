FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose Vite port
EXPOSE 5173

# Run Vite with host flag to expose to network
CMD ["npm", "run", "dev", "--", "--host"]
