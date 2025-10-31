# Moocho.me

### _For All Your Data_

*Moocho.me* is a data navigator. 

I'm building Moocho.me in order to help me in my quest to accumulate My Own Data.

I'm a packrat. Over decades, I've accumulated more and more lists of things. Some of these lists live in web sites that I subscribe to. Some, I curate myself. So, I wanted to solve two problems:

- I want to be able to draw links between the things, and find duplicate and unique things in my lists of lists of things, and generall munge the data however I might want to.

- I want to have third-party data under my own control, for two reasons:

    - I want to slice it and dice it in combination with all my other data.

    - I don't want to wake up one day to find that one of my accounts (oh I dunno, maybe [MySpace](https://mashable.com/article/myspace-data-loss)?) has lost all my data.

  So, I copy my own data into my own private system. I'ts all about Me. Moocho Me.

## The Now

Currently there is a website and a CLI. They sit on a set of data formats, defined in my companion repo [Datagator](https://github.com/cschuyle/datagator). I host the data in AWS S3.

## The Future

Turbo-charge the search functionality to be more like an AI experience than a search one, when desired.

Back it by a more appropriate set of data stores. Currently it's JSON documents in S3, and a Lucene index. A better set of tech would include relational and graphs stores, a document database, and a modern search engine.

Soup-up navigation using the UI: Hierarchies, faceting, link visualization, geography (maps).



