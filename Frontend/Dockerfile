FROM node:20

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy application code
COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Start the development server
CMD ["npm", "start", "--", "--host", "0.0.0.0"]