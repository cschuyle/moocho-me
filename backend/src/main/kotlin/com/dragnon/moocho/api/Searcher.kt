package com.dragnon.moocho.api

import org.apache.lucene.index.DirectoryReader
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser
import org.apache.lucene.search.IndexSearcher
import org.apache.lucene.search.MatchAllDocsQuery
import java.io.Closeable

class Searcher(troves: List<Trove>) : Closeable {

    private val logger = org.slf4j.LoggerFactory.getLogger(this::class.java)

    private val trovesIndex = getTrovesIndex(troves)

    override fun close() {
        trovesIndex.close()
    }

    fun findDuplicates(
        primaryTrovesList: List<String>,
        secondaryTroves: List<String>,
        queryString: String,
        maxResults: Int,
        minDupScore: Double = 0.4,
        maxDups: Int = 5
    ): List<SearchResult> {

        logger.info("Query from frontend ${queryString}")

        if (queryString.isBlank()) {
            return listOf()
        }

        val analyzer = AccentedAnalyzer()

        val primaryHits: MutableList<ItemHit> = mutableListOf()

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

            val primaryTroves = primaryTrovesList.toSet()

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
                    .filter { scoreDoc -> primaryTroves.contains(isearcher.doc(scoreDoc.doc)["troveId"]) }
                    .forEach { scoreDoc ->
                        val hitDoc = isearcher.doc(scoreDoc.doc)
                        val hitTroveDocument = TroveDocument(hitDoc.get("troveId"), hitDoc.get("title"))
                        val score: Double = scoreDoc.score.toDouble() / maxScore

                        val primaryHit = ItemHit(
                            scoreDoc.doc,
                            score,
                            hitTroveDocument.troveId,
                            hitTroveDocument.title
                        )
                        primaryHits.add(primaryHit)
                        logger.debug("PRIMARY HIT $primaryHit")
                    }
            }
            logger.info("Primary hit result count: ${primaryHits.size}")

            val sortedHits = primaryHits.map { primaryHit ->
                addSecondaryHits(
                    primaryHit,
                    secondaryTroves,
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

    private fun normalizeScore(searchResult: SearchResult, maxScore: Double): SearchResult =
        SearchResult(searchResult.primaryHit, searchResult.secondaryHits, searchResult.score / maxScore)

    fun search(queryText: String, maxResults: Int): List<SearchResult> {
        logger.info("Query ${queryText}")

        if (queryText.isBlank()) {
            return listOf()
        }

        val analyzer = AccentedAnalyzer()

        val searchResults: MutableList<SearchResult> = mutableListOf()

        DirectoryReader.open(trovesIndex.directory).use { reader ->
            val isearcher = IndexSearcher(reader)
            val query = createQuery(queryText, analyzer)
            val scoreDocs = isearcher
                .search(query, maxResults)
                .scoreDocs
            if (scoreDocs.isNotEmpty()) {
                val maxScore = scoreDocs.map { it.score.toDouble() }.maxOrNull()!!
                scoreDocs
                    .forEach { scoreDoc ->
                        val hitDoc = isearcher.doc(scoreDoc.doc)
                        val hitTroveDocument = TroveDocument(hitDoc.get("troveId"), hitDoc.get("title"))
                        val score: Double = scoreDoc.score.toDouble() / maxScore
                        searchResults.add(
                            SearchResult(
                                ItemHit(scoreDoc.doc, score, hitTroveDocument.troveId, hitTroveDocument.title),
                                listOf(),
                                score
                            )
                        )
                    }
            }
            logger.info("Search result count: ${searchResults.size}")
        }

        return searchResults
    }

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
                    val hitDoc = isearcher.doc(scoreDoc.doc)
                    val hitTroveDocument = TroveDocument(hitDoc.get("troveId"), hitDoc.get("title"))
                    val score: Double = scoreDoc.score.toDouble()
                    ItemHit(scoreDoc.doc, score, hitTroveDocument.troveId, hitTroveDocument.title)
                }
                .take(maxDups)

            val compositeScore = if (secondaryHits.isEmpty()) 0.0 else secondaryHits.map { it.score }.maxOrNull()!!
            val searchResult = SearchResult(primaryHit, secondaryHits, compositeScore)

            logger.debug("Search Result: $searchResult")

            return searchResult
        }
    }

    private fun createQuery(queryString: String, analyzer: AccentedAnalyzer) =
        if (queryString == "*") {
            MatchAllDocsQuery()
        } else {
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
            parser.parse(escapeQuery(queryString))
        }
}

