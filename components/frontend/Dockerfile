# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy application code
COPY . .

# Create production build
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]

# Alternative: Use nginx for production
# FROM nginx:alpine
# COPY --from=build /app/build /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/nginx.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]