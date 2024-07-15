mkdir buckets/moocho-predev

cp -r buckets/moocho-test/troves .

Edit troves to contain only selected ones:

```json
{
  "troves": [
    {
      "id": "dvdinbox",
      "bucketPrefix": "private"
    },
    {
      "id": "goodreads",
      "bucketPrefix": "private"
    },
    {
      "id": "watchlist",
      "bucketPrefix": "private"
    },
    {
      "id": "little-prince-wanted",
      "bucketPrefix": "public"
    }
  ]
}
```

**_NOTE:_**

Copy only the referenced directories from the `moocho-test` dir to `moocho-predev` dir. 
The `bucketPrefix` in the `troves` JSON file is actually a subdirectory of the bucket directory. 

**Keep the directory structure the same when you copy.**
