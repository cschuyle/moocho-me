# How To

## Start minio on local machine

```bash
docker-compose up
```

## Make sure your AWS_ env vars point to Minio local

You'll have to do `awes configure` with the local creds:
Auth Key: Admin1!
Secret Key: Password1!

*AND* 

```bash
export AWS_ENDPOINT_URL=http://localhost:9000
```

The go through the script files in sequence: `./0*`, `./1*`, ...

For step 0, you want the from-trove to be the prod trove, which currently is `moocho-test`; and the to-dir to be `moocho-predev`

After you complete all the steps, do step 0 again but with the new trove (to verify):

```console
➜ cd buckets
➜ find moocho-dev -type f|wc -l
     483
➜ find moocho-predev -type f|wc -l
     483
```

Yes, Success!