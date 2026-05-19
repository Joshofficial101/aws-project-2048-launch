# Use a lightweight Nginx web server image
FROM nginx:alpine

# Copy all local project files (index.html, assets folder, etc.) into Nginx's public web directory
COPY . /usr/share/nginx/html/

# Expose port 80 so the container can receive web traffic
EXPOSE 80