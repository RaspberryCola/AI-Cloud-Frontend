#!/bin/sh

# Add host.docker.internal to /etc/hosts if not already there
# This is for Docker on Linux compatibility
if ! grep -q "host.docker.internal" /etc/hosts; then
  IP=$(getent hosts host-gateway | awk '{ print $1 }')
  if [ -z "$IP" ]; then
    IP="172.17.0.1"  # Default Docker bridge IP
  fi
  echo "$IP host.docker.internal" >> /etc/hosts
  echo "Added host.docker.internal to /etc/hosts with IP $IP"
fi

# Start Nginx
nginx -g "daemon off;" 