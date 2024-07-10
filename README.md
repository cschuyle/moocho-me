# Moocho Me

**Moocho Me** is a mess O data with some ability to browse it.

Actually, the data (except username and password):
    - Is managed in <https://github.com/cschuyle/moocho> -- see that repo for details.
    - It then makes its way into AWS S3 as JSON documents. That's why you need AWS credentials below.

## Local Setup

### Requirements

- Java 21
- Node.js v21.7.1
- yarn v1.22.22
- AWS account

### Environment variables

If you use `direnv`, copy `envrc-template` to `.envrc` and fill in the blanks.

If not using `direnv`, you can just fill in the blanks, copy the file to whatever you want, and source it.

### Add Heroku remote

```bash
git remote add heroku https://git.heroku.com/moocho-me-web.git
```

### Database

#### Use the prod database - currently PostgreSQL on Heroku.

OR

#### Create a local database

First time as a new user:

You need to be the user who initially installed postgres on the machine.  Call that guy `psql-installer`.

```console
sudo -u psql-installer createuser -s $(whoami)
sudo -u psql-installer createdb $(whoami)
```

Then run the migrations manually:
```console
psql
\c MY_USERNAME
Then, paste in the contents of the file in <./database>. If you think the file looks like a Flyway database migration file, you-re right - but we're not using Flyway currently.
```

Then, follow the **Adding users** section below, except do it in the local DB.

#### Adding users

To get the hashed password you can use [this site](https://bcrypt-generator.com).
Choose the cipher length (number of rounds) to be 10

Note that the DATABASE_URL env var is only used for the Heroku deployment.

```console
$ heroku config

DATABASE_URL:   postgres://USER:PASSWORD@HOSTNAME:5432/DATABASE

$ psql -h HOSTNAME -U USER -d DATABASE

DATABASE=> insert into users (username, password, enabled) values ('your-username', '{bcrypt}<hashed password>
', true);

DATABASE=> insert into authorities (username, authority) values ('your-username', 'ROLE_ADMIN');
```

## Running

Using two different terminal windows:

Start the backend. Changes to the backend code require a re-compile and restart of the server.
```shell
chmod 0755 ./gradlew # Only necessary the first time, and only if you somehow got a copy without the executable bit set
./gradlew bootRun
```

Start the frontend. Changes to the frontend code will automatically refresh.

```console
cd frontend
yarn install # Only necessary the first time
yarn start
```

To use the webapp UI, direct your browser to <http://localhost:3000/>.

You can also hit the REST API directly at <http://localhost:8080/>.

### Testing

```console
./gradlew test
```

## Deploying

`deploy/heroku/deploy-heroku.sh` builds the production release (both the Spring app and the compiled React code) and instructs you to push to Heroku, who does all the rest of the work (buildpack to do Spring and Java, etc). See the README in the `deploy/heroku` directory.