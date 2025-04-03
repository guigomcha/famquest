FROM ghcr.io/guigomcha/proxy/node:18.20.4 as builder

WORKDIR /usr/src/famquest/components/welcome-page

# Install dependencies as first layer
COPY components/welcome-page/*.json ./
RUN npm install

# Copy the rest of the application code
COPY components/welcome-page/*.js ./
COPY components/welcome-page/utils ./utils
COPY components/welcome-page/css ./css
#COPY components/welcome-page/components ./components
COPY components/welcome-page/assets ./assets
COPY components/welcome-page/public ./public

# Release in dist/
RUN npx expo export --platform web

# # Stage 2: Create the final image with Nginx
FROM  ghcr.io/guigomcha/proxy/nginx:latest

# Copy the generated HTML files from the previous stage
COPY --from=builder /usr/src/famquest/components/welcome-page/dist /usr/share/nginx/html
COPY --from=builder /usr/src/famquest/components/welcome-page/public /usr/share/nginx/html/public
COPY --from=builder /usr/src/famquest/components/welcome-page/assets /usr/share/nginx/html/assets

