#!/usr/bin/env bash
set -o errexit # set -e
set -o pipefail
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
script_file=$(basename "$0")

cd "$script_dir/../frontend"
yarn build
cd ../backend
gw clean build
cp -R ../frontend/build/ ./src/main/resources/public
