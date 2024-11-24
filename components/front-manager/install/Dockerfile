FROM node:18.20.4

WORKDIR /usr/src/famquest/components/front-manager

# Install dependencies as first layer
COPY components/front-manager/package*.json ./
RUN npm install

# Copy the rest of the application code
COPY components/front-manager/ .

# Run the development server
CMD ["npx", "expo", "start", "--web"]
