package com.dragnon.moocho.api

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class SearchController(val repository: TroveRepository, val duplicateFinder: DuplicateFinder) {

    @GetMapping("/search")
    fun search(
        @RequestParam troves: String,
        @RequestParam query: String,
        @RequestParam maxResults: Int
    ) =
        SearchResponse(
            // Summary of hits per trove
            getTroveHits(query, maxResults),
            // The actual hits for all the troves
            getSearchResults(troves, query, maxResults)
        )

    private fun getSearchResults(
        trovesString: String,
        query: String,
        maxResults: Int
    ): SearchResults {
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

    private fun getTroveHits(query: String, maxResults: Int): List<TroveHit> {
        val troveHits = HashMap<String, Int>()
        repository.list().forEach { trove ->
            troveHits[trove.id] = 0
        }
        val searchResults2 = Searcher(repository.list()).search(query, maxResults)
        searchResults2.forEach { searchResult ->
            troveHits.compute(searchResult.primaryHit.troveId) { _, v -> if (v == null) null else v + 1 }
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


