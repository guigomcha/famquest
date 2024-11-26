FROM node:18.20.4 as builder

WORKDIR /usr/src/famquest/components/front-manager

# Install dependencies as first layer
COPY components/front-manager/*.json ./
RUN npm install

# Copy the rest of the application code
COPY components/front-manager/*.js ./
COPY components/front-manager/components ./components
COPY components/front-manager/css ./css
COPY components/front-manager/assets ./assets
COPY components/front-manager/backend_interface ./backend_interface
COPY components/front-manager/public ./public
COPY components/front-manager/utils ./utils

# Release in dit/
RUN npx expo export --platform web

# Stage 2: Create the final image with Nginx
FROM  registry.atosresearch.eu:18488/nginx:latest

# Copy the generated HTML files from the previous stage
COPY --from=builder /usr/src/famquest/components/front-manager/dist /usr/share/nginx/html

