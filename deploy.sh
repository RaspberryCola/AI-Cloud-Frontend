#!/bin/bash

# Build the Docker image
docker build -t ai-cloud-frontend .

# Stop and remove existing container if it exists
docker rm -f ai-cloud-frontend 2>/dev/null || true

# Run the container with host.docker.internal support
docker run -d -p 80:80 \
  --add-host=host.docker.internal:host-gateway \
  --name ai-cloud-frontend ai-cloud-frontend

echo "AI-Cloud-Frontend deployed successfully!"
echo "Access the application at http://localhost"
echo "Backend API requests will be forwarded to http://host.docker.internal:8080" 