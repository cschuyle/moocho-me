package com.dragnon.moocho.api

data class TroveHit(
    val troveId: String,
    val hitCount: Int,
    val name: String,
    val shortName: String,
    val totalCount: Int,
    val hitType: String
)

data class QueryResult(
    val troveHits: List<TroveHit>,
    val searchResults: List<SearchResult>
)

data class ItemHit(val doc: Int, val score: Double, val troveId: String, val title: String)

data class SearchResult(val primaryHit: ItemHit, val secondaryHits: List<ItemHit>, val score: Double)

