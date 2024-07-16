package com.dragnon.moocho.api

// SearchController

data class QueryResult(
    val troveHits: List<TroveHit>,
    val searchResults: List<SearchResult>
)

data class TroveHit(
    val troveId: String,
    val name: String,
    val shortName: String,
    val totalCount: Int,
    val hitType: String,
    val hitCount: Int
)

data class SearchResult(
    val primaryHit: ItemHit,
    val secondaryHits: List<ItemHit>,
    val score: Double
)

data class ItemHit(
    val doc: Int,
    val score: Double,
    val troveId: String,
    val title: String
)

// TroveController

data class TroveSummary(
    val troveId: String,
    val name: String,
    val shortName: String,
    val itemCount: Int
)

data class Trove(
    val id: String,
    val name: String,
    val shortName: String,
    val titles: List<String>?,
    val items: List<Item>?
) {
    fun totalCount() = (items?.count()) ?: (0 + (titles?.count() ?: 0))
}

data class Item(
    val movie: Movie?,
    val spotifyItem: SpotifyItem?,
    val littlePrinceItem: LittlePrinceItem?
)

data class Movie(
    val title: String,
    val year: String,
    val director: String
)
