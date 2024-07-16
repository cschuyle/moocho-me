package com.dragnon.moocho.api

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class SearchController(val repository: TroveRepository, val duplicateFinder: DuplicateFinder) {

    private val logger = org.slf4j.LoggerFactory.getLogger(this::class.java)

    @GetMapping("/search")
    fun search(
        @RequestParam troves: String,
        @RequestParam query: String,
        @RequestParam maxResults: Int
    ): QueryResult {
        val searchResults = getSearchResults(troves, query, maxResults)
        return QueryResult(
            // Summary of hits per trove
            getTroveHits(searchResults),
            // The actual hits for all the troves
            searchResults
        )
    }

    private fun getSearchResults(
        trovesString: String,
        query: String,
        maxResults: Int
    ): List<SearchResult> {
        val troveString = trovesString.split(",")
        val troves = if (trovesString.isBlank() || trovesString == "*") {
            repository.list()
        } else {
            troveString.map { troveId ->
                repository.findById(
                    troveId
                        .replace(Regex(":.*"), "")
                )
            }
        }
        val primaryTroveIds = troveString
            .filter { troveId -> troveId.matches(Regex(".+:primary")) }
            .map { troveId -> troveId.replace(Regex(":.*"), "") }

        val secondaryTroveIds = troveString
            .filter { troveId -> troveId.matches(Regex(".+:secondary")) || troveId.matches(Regex("[^:]+")) }
            .map { troveId -> troveId.replace(Regex(":.*"), "") }

        val searchResults = if (primaryTroveIds.isNotEmpty() && secondaryTroveIds.isNotEmpty())
            duplicateFinder.findDuplicates(troves, primaryTroveIds, secondaryTroveIds, query, maxResults)
        else
            Searcher(troves).search(query, maxResults)

        return searchResults
    }

    private fun getTroveHits(searchResults: List<SearchResult>): List<TroveHit> {
        val primaryHitCounts = HashMap<String, Int>()
        val secondaryHitCounts = HashMap<String, Int>()

        searchResults.forEach { searchResult ->
            primaryHitCounts.compute(searchResult.primaryHit.troveId) { k, v ->
//                logger.info("PRIMARY HIT ${k} had ${v}")
                if (v == null) 1 else v + 1
            }
            for (secondaryHit in searchResult.secondaryHits) {
                secondaryHitCounts.compute(secondaryHit.troveId) { k, v ->
//                    logger.info("SECONDARY HIT ${k} had ${v}")
                    if (v == null) 1 else v + 1
                }
            }
        }

        fun makeTroveHit(troveId: String, hitCount: Int, hitType: String): TroveHit {
            return TroveHit(
                troveId=troveId,
                name=repository.findById(troveId).name,
                shortName=repository.findById(troveId).shortName,
                totalCount=repository.findById(troveId).totalCount(),
                hitType=hitType,
                hitCount=hitCount
            )
        }

        val allTroves: List<Trove> = repository.list()

        return allTroves.map { trove ->
            when {
                primaryHitCounts.containsKey(trove.id) ->
                    makeTroveHit(trove.id, primaryHitCounts[trove.id]!!, "primary")

                secondaryHitCounts.containsKey(trove.id) ->
                    makeTroveHit(trove.id, secondaryHitCounts[trove.id]!!, "secondary")

                else -> makeTroveHit(trove.id, 0, "none")
            }
        }
    }
}
