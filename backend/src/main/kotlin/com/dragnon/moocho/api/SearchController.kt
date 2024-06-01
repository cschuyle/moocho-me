package com.dragnon.moocho.api

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class SearchController(val repository: TroveRepository) {

    @GetMapping("/search")
    fun search(
        @RequestParam troves: String,
        @RequestParam query: String,
        @RequestParam maxResults: Int
    ) =
        SearchResponse(
            getTroveHits(query, maxResults),
            getSearchResults(troves, query, maxResults)
        )

    private fun getSearchResults(
        trovesString: String,
        query: String,
        maxResults: Int
    ): SearchResults {
        val troves = trovesString.split(",")
        val repos = if (trovesString.isBlank() || trovesString == "*") {
            repository.list()
        } else {
            troves.map { troveId ->
                repository.findById(
                    troveId
                        .replace(Regex(":.*"), "")
                )
            }
        }
        val primaryTroves = troves
            .filter { troveId -> troveId.matches(Regex(".+:primary")) }
            .map { troveId -> troveId.replace(Regex(":.*"), "") }

        val secondaryTroves = troves
            .filter { troveId -> troveId.matches(Regex(".+:secondary")) || troveId.matches(Regex("[^:]+")) }
            .map { troveId -> troveId.replace(Regex(":.*"), "") }

        val searchResults = if (primaryTroves.isNotEmpty() && secondaryTroves.isNotEmpty())
            Searcher(repos).findDuplicates(primaryTroves, secondaryTroves, query, maxResults)
        else
            Searcher(repos).search(query, maxResults)

        return searchResults
    }

    private fun getTroveHits(query: String, maxResults: Int): List<TroveHit> {
        val troveHits = HashMap<String, Int>()
        repository.list().forEach { trove ->
            troveHits[trove.id] = 0
        }
        val searchResults2 = Searcher(repository.list()).search(query, maxResults)
        searchResults2.forEach { searchResult ->
            troveHits.compute(searchResult.primaryHit.troveId) { _, v -> if (v == null) v else v + 1 }
        }

        val troveHitsResponse = troveHits
            .map { (troveId, hitCount) ->
                TroveHit(
                    troveId,
                    hitCount,
                    repository.findById(troveId).name,
                    repository.findById(troveId).shortName,
                    repository.findById(troveId).totalCount()
                )
            }
        return troveHitsResponse
    }
}

data class TroveHit(
    val troveId: String,
    val hitCount: Int,
    val name: String,
    val shortName: String,
    val totalCount: Int
)

data class SearchResponse(val troveHits: List<TroveHit>, val searchResults: SearchResults)

data class ItemHit(val doc: Int, val score: Double, val troveId: String, val title: String)

data class SearchResult(val primaryHit: ItemHit, val secondaryHits: List<ItemHit>, val score: Double)

typealias SearchResults = List<SearchResult>
