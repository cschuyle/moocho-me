package com.dragnon.moocho.api

import org.apache.lucene.index.DirectoryReader
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser
import org.apache.lucene.search.IndexSearcher
import org.apache.lucene.search.MatchAllDocsQuery
import java.io.Closeable

class Searcher(troves: List<Trove>) {

    private val logger = org.slf4j.LoggerFactory.getLogger(this::class.java)

    private val trovesIndex = getTrovesIndex(troves)

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

