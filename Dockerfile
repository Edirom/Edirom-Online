FROM nginx:alpine

# Remove the default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy everything from the current directory (where Dockerfile is) into the Nginx web root
COPY . /usr/share/nginx/html
