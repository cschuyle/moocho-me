package com.dragnon.moocho.api

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
