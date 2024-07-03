#!/usr/bin/env bash
set -o errexit # set -e
set -o pipefail
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
script_file=$(basename "$0")

echo "######## Building frontend"
cd "$script_dir/../frontend"
yarn build

echo "######## Building backend"
cd ..
gw clean build

echo "######## Copying frontend assets for inclusion in executable jar"
cp -R ./frontend/build/ ./src/main/resources/public

echo "######## Build SUCCESS ! Now you need to do this:
- Test local manually: https://localhost:8080
- Commit to git
- `git push heroku`
"
