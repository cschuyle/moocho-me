package com.dragnon.moocho.api

import org.apache.lucene.index.DirectoryReader
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser
import org.apache.lucene.search.IndexSearcher
import org.apache.lucene.search.MatchAllDocsQuery
import org.apache.lucene.search.ScoreDoc

class DuplicateFinder(val troves: List<Trove>, val primaryTroveIds: List<String>, val secondaryTroveIds: List<String>) {

    private val logger = org.slf4j.LoggerFactory.getLogger(this::class.java)

    fun compare(
        operation: SearchController.CrossTroveOperation,
        queryString: String,
        maxResults: Int,
        minDupScore: Double = 0.4,
        maxDups: Int = 5
    ): List<SearchResult> {
        return when (operation) {
            SearchController.CrossTroveOperation.Duplicates -> findDuplicates(
                queryString,
                maxResults,
                minDupScore,
                maxDups
            )

            SearchController.CrossTroveOperation.Uniques -> findUniques(queryString, maxResults, minDupScore, maxDups)
        }
    }

    fun findDuplicates(
        queryString: String,
        maxResults: Int,
        minDupScore: Double,
        maxDups: Int
    ): List<SearchResult> {

        logger.info("Query from frontend ${queryString}")

        if (queryString.isBlank()) {
            return listOf()
        }

        val analyzer = AccentedAnalyzer()

        val primaryHits: MutableList<ItemHit> = mutableListOf()

        val trovesIndex = getTrovesIndex(troves)

        DirectoryReader.open(trovesIndex.directory).use { reader ->
            val isearcher = IndexSearcher(reader)
            val parser = MultiFieldQueryParser(
                arrayOf(
                    "title",
                    "director",
                    "albumName",
                    "artistName",
                    "playlistName",
                    "trackName"
                ), analyzer
            )

            val primaryTroves = primaryTroveIds.toSet()

            val primaryTroveQuery = primaryTroves
                .map { troveId -> "troveId:$troveId" }
                .joinToString(" OR ")

            val primaryTroveQueryToExecute =
                if (queryString == "*")
                    primaryTroveQuery
                else
                    "+($primaryTroveQuery) AND ${escapeQuery(queryString)}"

            logger.info("Query to Lucene ${primaryTroveQueryToExecute}")

            val query = parser.parse(primaryTroveQueryToExecute)

            val scoreDocs = isearcher
                .search(query, 10000) // TODO maybe use the Collector version and stream/take the results
                .scoreDocs
            if (scoreDocs.isNotEmpty()) {
                val maxScore = scoreDocs.map { it.score.toDouble() }.maxOrNull()!!
                scoreDocs
                    .filter { scoreDoc ->
                        primaryTroves.contains(
                            isearcher.storedFields().document(scoreDoc.doc)["troveId"]
                        )
                    }
                    .forEach { scoreDoc ->
                        val primaryHit = makeItemHit(isearcher, scoreDoc, maxScore)
                        primaryHits.add(primaryHit)
                        logger.debug("PRIMARY HIT {}", primaryHit)
                    }
            }
            logger.info("Primary hit result count: ${primaryHits.size}")

            val sortedHits = primaryHits.map { primaryHit ->
                addSecondaryHits(
                    primaryHit,
                    secondaryTroveIds,
                    parser,
                    isearcher,
                    maxResults,
                    minDupScore,
                    maxDups
                )
            }
                .filter { it.secondaryHits.isNotEmpty() }
                .sortedByDescending { it.score }

            val maxScore = sortedHits.map { it.score }.maxOrNull()

            return sortedHits
                .take(maxResults)
                .map { normalizeScore(it, maxScore!!) }
        }
    }

    fun findUniques(
        queryString: String,
        maxResults: Int,
        minDupScore: Double,
        maxDups: Int
    ): List<SearchResult> {

        logger.info("Query from frontend ${queryString}")

        if (queryString.isBlank()) {
            return listOf()
        }

        val analyzer = AccentedAnalyzer()

        val primaryHits: MutableList<ItemHit> = mutableListOf()

        val trovesIndex = getTrovesIndex(troves)

        DirectoryReader.open(trovesIndex.directory).use { reader ->
            val isearcher = IndexSearcher(reader)
            val parser = MultiFieldQueryParser(
                arrayOf(
                    "title",
                    "director",
                    "albumName",
                    "artistName",
                    "playlistName",
                    "trackName"
                ), analyzer
            )

            val primaryTroves = primaryTroveIds.toSet()

            val primaryTroveQuery = primaryTroves
                .map { troveId -> "troveId:$troveId" }
                .joinToString(" OR ")

            val primaryTroveQueryToExecute =
                if (queryString == "*")
                    primaryTroveQuery
                else
                    "+($primaryTroveQuery) AND ${escapeQuery(queryString)}"

            logger.info("Query to Lucene ${primaryTroveQueryToExecute}")

            val query = parser.parse(primaryTroveQueryToExecute)

            val scoreDocs = isearcher
                .search(query, 10000) // TODO maybe use the Collector version and stream/take the results
                .scoreDocs
            if (scoreDocs.isNotEmpty()) {
                val maxScore = scoreDocs.map { it.score.toDouble() }.maxOrNull()!!
                scoreDocs
                    .filter { scoreDoc ->
                        primaryTroves.contains(
                            isearcher.storedFields().document(scoreDoc.doc)["troveId"]
                        )
                    }
                    .forEach { scoreDoc ->
                        val primaryHit = makeItemHit(isearcher, scoreDoc, maxScore)
                        primaryHits.add(primaryHit)
                        logger.debug("PRIMARY HIT {}", primaryHit)
                    }
            }
            logger.info("Primary hit result count: ${primaryHits.size}")

            // Make SearchResults including the secondary hits

            val sortedHits = primaryHits.map { primaryHit ->
                addSecondaryHits(
                    primaryHit,
                    secondaryTroveIds,
                    parser,
                    isearcher,
                    maxResults,
                    minDupScore,
                    maxDups
                )
            }
                .filter { it.secondaryHits.isNotEmpty() }
                .sortedBy { it.score } // Note this is the opposite sort from the other

            val allHits = sortedHits.map { it.score }
            val maxScore = allHits.max()

            val allHitDocs = sortedHits.map { it.primaryHit.doc }

            // Get all the docs in the corpus

            val allScoreDocs = isearcher.search(parser.parse(primaryTroveQuery), 100000).scoreDocs

            val reallyUniqueScoreDocs = allScoreDocs
                .filter { scoreDoc -> !allHitDocs.contains(scoreDoc.doc) }

            val reallyUniqueSearchResults = reallyUniqueScoreDocs
                .map { scoreDoc -> makeItemHit(isearcher, scoreDoc, maxScore) }
                .map { itemHit -> SearchResult(itemHit, listOf(), 100.0) }
                .take(maxResults)

            if (reallyUniqueSearchResults.size >= maxResults) {
                return reallyUniqueSearchResults
            }

            // Not enough true-uniques. Add the stuff that wasn't already output

            val alreadyResults = reallyUniqueSearchResults.size

            val reallyUniqueDocs = reallyUniqueScoreDocs.map { it.doc }
            val maybeUniques = sortedHits
                .filter { searchResult -> !reallyUniqueDocs.contains(searchResult.primaryHit.doc) }
                .take(maxResults - alreadyResults)
                .map { normalizeScore(it, maxScore) }

            return reallyUniqueSearchResults + maybeUniques
        }
    }

    private fun makeItemHit(
        isearcher: IndexSearcher,
        scoreDoc: ScoreDoc,
        maxScore: Double
    ): ItemHit {
        val hitDoc = isearcher.storedFields().document(scoreDoc.doc)
        val hitTroveDocument = TroveDocument(hitDoc.get("troveId"), hitDoc.get("title"))
        val score: Double = scoreDoc.score.toDouble() / maxScore

        val primaryHit = ItemHit(
            scoreDoc.doc,
            score,
            hitTroveDocument.troveId,
            hitTroveDocument.title
        )
        return primaryHit
    }

    private fun normalizeScore(searchResult: SearchResult, maxScore: Double): SearchResult =
        SearchResult(searchResult.primaryHit, searchResult.secondaryHits, searchResult.score / maxScore)

    private fun addSecondaryHits(
        primaryHit: ItemHit,
        secondaryTroves: List<String>,
        parser: MultiFieldQueryParser,
        isearcher: IndexSearcher,
        maxResults: Int,
        minDupScore: Double,
        maxDups: Int
    ): SearchResult {

        val secondaryTroveQuery = secondaryTroves
            .map { troveId -> "troveId:$troveId" }
            .joinToString(" OR ")

        val query = parser.parse("($secondaryTroveQuery) AND ${escapeQuery(primaryHit.title)}")
        val scoreDocs = isearcher
            .search(query, maxResults)
            .scoreDocs
        if (scoreDocs.isEmpty()) {
            return SearchResult(primaryHit, listOf(), 0.0)
        } else {
            val secondaryHits = scoreDocs
                .filter { scoreDoc -> scoreDoc.doc != primaryHit.doc }
                .filter { scoreDoc -> scoreDoc.score.toDouble() > minDupScore }
                .map { scoreDoc ->
                    val hitDoc = isearcher.storedFields().document(scoreDoc.doc)
                    val hitTroveDocument = TroveDocument(hitDoc.get("troveId"), hitDoc.get("title"))
                    val score: Double = scoreDoc.score.toDouble()
                    ItemHit(scoreDoc.doc, score, hitTroveDocument.troveId, hitTroveDocument.title)
                }
                .take(maxDups)

            // TODO Is taking the max what we want to base our output on? Probably not.
            //   Figure out a more sophisticated way to:
            //   - Rank and display the possible-duplicates in
            //     - for each primary hit
            //     - the entire SearchResults (list of primary hits)
            val compositeScore = if (secondaryHits.isEmpty()) 0.0 else secondaryHits.map { it.score }.maxOrNull()!!
            val searchResult = SearchResult(primaryHit, secondaryHits, compositeScore)

            logger.debug("Search Result: {}", searchResult)

            return searchResult
        }
    }
}