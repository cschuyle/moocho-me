# Deploying to Heroku

It should be as simple as `heroku push`, and that's what you do in regular development.

## Heroku setup

1. Add Heroku remote

```bash
git remote add heroku https://git.heroku.com/moochome.git
```

2. Create the database and seed it with password - see <../README.md>

## CircleCI setup

The app uses in in-memory database which is populated at startup time. Therefore when the data changes, it should be restarted. The data (currently) can only change when the `moocho` repo changes. Therefore one of the steps in the moocho repo's commit workflow restarts THIS APP.

Currently there is a pipeline in circleci.com **ON THE `moocho` REPO -- NOT ON THIS REPO**. Here is its definition (`.circleci/config.yml`):

```yaml
version: 2
jobs:
  transform-and-upload-to-aws:
    docker:
      - image: cschuyle/moocho-ci
    steps:
      - checkout
      - run:
          name: Clone repository I depend on
          command: |
            git clone https://github.com/cschuyle/datagator.git
      - run:
          name: Generate trove JSON for all Troves
          command: |
            ./ci/bin/transform-all.sh
      - run:
          name: Upload Troves
          command: |
            ./ci/bin/upload-all.sh
      - run:
          name: Restart consumer app
          command: |
            # Set HEROKU_API_KEY env var, preferably to a key generated using `heroku authorizations:create`
            heroku restart -a moocho-me-web

workflows:
  version: 2
  pipeline:
    jobs:
      - transform-and-upload-to-aws
```

In addition to configuring circleci, you should do the following, ON THIS REPO:

1. Make an API key:

```console
➜ heroku authorizations:create
Creating OAuth Authorization... done
Client:      <none>
ID:          12345678-1234-1234-1234-123456789abc
Description: Long-lived user authorization
Scope:       global
Token:       HRKU-12345678-1234-1234-1234-123456789abc
Updated at:  Tue Jul 04 1776 18:15:53 GMT-0600 (Mountain Daylight Time) (less than a minute ago)
```

2. Set the Heroku env var for the app. Using the value from the above example:

   **Settings / Config Vars / Add Config Var:**
   
   KEY=`HEROKU_API_KEY`, VALUE=`HRKU-12345678-1234-1234-1234-123456789abc`
