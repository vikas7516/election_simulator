# Use the official Nginx image as the base
FROM nginx:alpine

# Copy our template to the unique templates folder Nginx Alpine uses for auto-env substitution
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy the static web application files to the Nginx html directory
COPY . /usr/share/nginx/html

# Expose the port Cloud Run expects (8080)
EXPOSE 8080

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
