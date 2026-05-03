# Use the official Nginx image as the base
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static web application files to the Nginx html directory
COPY . /usr/share/nginx/html

# Expose the port Cloud Run expects (8080)
EXPOSE 8080

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
