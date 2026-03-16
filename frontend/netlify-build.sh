#!/bin/sh
set -eu

NODE_VERSION="${NODE_VERSION:-20.11.1}"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found, installing Node $NODE_VERSION"
  curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" -o /tmp/node.tar.xz
  tar -xf /tmp/node.tar.xz -C /tmp
  export PATH="/tmp/node-v${NODE_VERSION}-linux-x64/bin:$PATH"
fi

npm --version
node --version

npm install
node ./node_modules/vite/bin/vite.js build