package com.dragnon.moocho.api

import org.apache.lucene.index.DirectoryReader
import org.apache.lucene.queryparser.classic.QueryParser
import org.apache.lucene.search.IndexSearcher
import java.io.Closeable

// Find all duplicates for all troves, without an accompanying keyword search (filter).
// See Searcher for finding duplicates with a filter.
class DuplicateFinder(troves: List<Trove>) : Closeable {

    private val trovesIndex = getTrovesIndex(troves)

    fun findTopDuplicates(minScore: Double): List<DuplicateDescription> {

        val analyzer = AccentedAnalyzer()

        DirectoryReader.open(trovesIndex.directory).use { reader ->
            return FindTopDuplicates(reader, analyzer).execute(minScore)
        }
    }

    override fun close() {
        trovesIndex.close()
    }

    fun findItemsWithNoDuplicates(minScore: Double): MutableList<NoDuplicateDescription> {

        val analyzer = AccentedAnalyzer()

        val noDuplicates: MutableList<NoDuplicateDescription> = mutableListOf()
        // Now search the index:
        DirectoryReader.open(trovesIndex.directory).use { reader ->
            val isearcher = IndexSearcher(reader)
            // Parse a simple query that searches for "text":
            val parser = QueryParser("title", analyzer)

            trovesIndex.troves.forEach { trove ->
                if (trove.titles != null)
                    title@ for (title in trove.titles) {
                        val query = parser.parse(escapeQuery(title))
                        val searchingFrom = TroveDocument(trove.name, title)
                        val scoreDocs = isearcher
                            .search(query, 10)
                            .scoreDocs
                        if (scoreDocs.isEmpty()) {
                            noDuplicates.add(NoDuplicateDescription(searchingFrom, false, null))
                        } else {
                            val duplicatePairs: MutableList<DuplicatePair> = mutableListOf()
                            var foundDuplicate = false
                            val maxScore: Double = scoreDocs.map { it.score.toDouble() }.maxOrNull()!!
                            for (scoreDoc in scoreDocs) {
                                val hitDoc = isearcher.doc(scoreDoc.doc)
                                val hitTroveDocument = TroveDocument(hitDoc.get("troveId"), hitDoc.get("title"))
                                if (hitTroveDocument == searchingFrom) {
                                    continue
                                }
//                            if (remembered(hitTroveDocument, searchingFrom)) {
//                                continue@title
//                            }
//                            remember(hitTroveDocument, searchingFrom)
                                val score: Double = scoreDoc.score.toDouble() / maxScore
                                duplicatePairs.add(
                                    DuplicatePair(
                                        Pair(searchingFrom, hitTroveDocument),
                                        score
                                    )
                                )
                                if (score > minScore) {
                                    foundDuplicate = true
                                }
                            }

                            if (!foundDuplicate) {
                                noDuplicates.add(NoDuplicateDescription(searchingFrom, foundDuplicate, duplicatePairs))
                            }
                        }
                    }
            }
        }

        return noDuplicates
    }

    private inner class FindTopDuplicates(
        reader: DirectoryReader?,
        analyzer: AccentedAnalyzer
    ) {
        val isearcher: IndexSearcher = IndexSearcher(reader)
        val parser: QueryParser = QueryParser("title", analyzer)
        val duplicates: MutableList<DuplicateDescription> = mutableListOf()

        fun execute(
            minScore: Double
        ): List<DuplicateDescription> {

            trovesIndex.troves.forEach { trove ->
                trove.titles?.forEach { title ->
                    findDuplicatesForTitle(trove, minScore, title)?.let {
                        duplicates.add(it)
                    }
                }
            }
            return duplicates
        }

        private fun findDuplicatesForTitle(trove: Trove, minScore: Double, title: String)
                : DuplicateDescription? {

            val query = parser.parse(escapeQuery(title))

            val primaryTroveDoc = TroveDocument(trove.id, title)

            val scoreDocs = isearcher
                .search(query, 10)
                .scoreDocs

            if (scoreDocs.isEmpty()) {
                return null
            }
            val duplicateDescription = DuplicateDescriptionBuilder(primaryTroveDoc)

            val hitsMaxScore = scoreDocs.map { it.score.toDouble() }.maxOrNull()!!

            scoreDocs.forEach { scoreDoc ->

                val hitDoc = isearcher.doc(scoreDoc.doc)
                val hitTroveDoc = TroveDocument(hitDoc.get("troveId"), hitDoc.get("title"))
                if (hitTroveDoc != primaryTroveDoc &&
                    !isAlreadyEncounteredDuplicate(hitTroveDoc, primaryTroveDoc)
                ) {
                    (scoreDoc.score.toDouble() / hitsMaxScore).let { score ->
                        if (score > minScore) {
                            addEncounteredDuplicate(hitTroveDoc, primaryTroveDoc)
                            duplicateDescription.addDuplicate(hitTroveDoc, score)
                        }
                    }
                }
            }
            return if (duplicateDescription.hasDuplicates()) duplicateDescription.build() else null
        }

    }

    private val encounteredDuplicates: MutableMap<TroveDocument, MutableSet<TroveDocument>> = mutableMapOf()

    private fun isAlreadyEncounteredDuplicate(docA: TroveDocument, docB: TroveDocument): Boolean {
        if (docA < docB) {
            return encounteredDuplicates[docA]?.contains(docB) ?: false
        } else {
            return encounteredDuplicates[docB]?.contains(docA) ?: false
        }
    }

    private fun addEncounteredDuplicate(docA: TroveDocument, docB: TroveDocument) {
        if (docA < docB) {
            encounteredDuplicates.computeIfAbsent(docA) { HashSet() }.add(docB)
        } else {
            encounteredDuplicates.computeIfAbsent(docB) { HashSet() }.add(docA)
        }
    }

}

data class DuplicateDescription(
    val thisHasDuplicates: TroveDocument,
    val theDuplicates: List<TroveDocument>,
    val score: Double
)

data class DuplicatePair(val duplicate: Pair<TroveDocument, TroveDocument>, val score: Double)

data class NoDuplicateDescription(
    val queryForDocument: TroveDocument,
    val match: Boolean,
    val duplicatePairs: List<DuplicatePair>?
)

class DuplicateDescriptionBuilder(private val primary: TroveDocument) {
    private var secondaries = mutableListOf<TroveDocument>()
    private var totalScore = 0.0

    fun hasDuplicates() = secondaries.isNotEmpty()

    fun addDuplicate(secondary: TroveDocument, score: Double) {
        secondaries.add(secondary)
        totalScore += score
    }

    fun build(): DuplicateDescription {
        return DuplicateDescription(primary, secondaries, totalScore / secondaries.size)
    }
}
