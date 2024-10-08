#!/bin/bash

# Create directories
mkdir -p src/tree
mkdir -p src/kafka
mkdir -p src/redis
mkdir -p src/mongo
mkdir -p src/api

# Touch files
touch src/tree/extendedTreeNode.ts
touch src/tree/avlTree.ts
touch src/tree/index.ts
touch src/kafka/consumer.ts
touch src/kafka/producer.ts
touch src/kafka/index.ts
touch src/redis/client.ts
touch src/redis/index.ts
touch src/mongo/client.ts
touch src/mongo/index.ts
touch src/api/gateway.ts
touch src/api/index.ts
touch src/example.ts

# Create package.json if it doesn't exist
if [ ! -f package.json ]; then
  echo '{}' > package.json
fi

echo "File structure created successfully."
