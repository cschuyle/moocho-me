#!/usr/bin/env bash
#set -o errexit # set -e
set -o pipefail
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
script_file=$(basename "$0")


docker-compose up --detach
# God I hate this
sleep 3
docker exec moochome-psql psql -h localhost -U postgres -f /var/database-scripts/create-auth-tables.sql
  docker exec moochome-psql psql -h localhost -U postgres -f /var/database-scripts/insert-guest-credentials.sql

cat <<EOF
===========================================
Postgresql credential data has been set up.

Username: guest
Password: password
===========================================
EOF


