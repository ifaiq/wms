#!/bin/sh
# bash.sh

set -e
  
until curl -XGET https://${AWS_HOST}:${AWS_PORT} -u 'admin:admin' --insecure ; do
  echo "Trying to connect to OpenSearch..."
  sleep 3
done
  
echo "OpenSearch is up"

npx prisma migrate dev

npx prisma db seed

npm run test:docker
