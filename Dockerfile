# Pull Nginx from Amazon's official public mirror to bypass Docker Hub rate limits
FROM public.ecr.aws/nginx/nginx:alpine

# Copy all local project files into Nginx's public web directory
COPY . /usr/share/nginx/html/

# Expose port 80 so the container can receive web traffic
EXPOSE 80