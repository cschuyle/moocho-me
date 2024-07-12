#!/usr/bin/env bash

set +e
DOCKER_IMAGE=postgres
DOCKER_CONTAINER=moochome-psql

docker pull ${DOCKER_IMAGE}

# source .envrc # unless you already got direnv to do that for you

docker run -d --name moochome-psql \
-e POSTGRES_PASSWORD=password \
-v ${DB_HOME}/postgres-data/:/var/lib/postgresql/data \
-v ${DB_HOME}/scripts:/var/database-scripts/ \
-p 5432:5432 ${DOCKER_IMAGE}

docker exec ${DOCKER_CONTAINER} psql -h localhost -U postgres -f /var/database-scripts/create-auth-tables.sql
docker exec ${DOCKER_CONTAINER} psql -h localhost -U postgres -f /var/database-scripts/insert-guest-credentials.sql

cat <<EOF
===========================================
Postgresql credential data has been set up.

Username: guest
Password: password

Now go to https://localhost:8080 to log in
===========================================
EOF


