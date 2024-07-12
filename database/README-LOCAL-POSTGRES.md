# Setting up local PostgreSQL (using Docker)

## Requirements

docker

## Usage

```
./setup-local-psql.sh
```
## Caveats

It doesn't check any error codes.

It has hardwired credentials, on purpose (because: laziness, and safety). 
So you'll want to make sure your your `.envrc` contains the following:

```bash
host=localhost
database='postgres'
user='postgres'
port=5432
password='password'
```