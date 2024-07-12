package com.dragnon.moocho.api

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.GetObjectRequest
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.stereotype.Repository

@Repository
class TroveRepository(
    private val amazonS3Client: AmazonS3,
    private val objectMapper: ObjectMapper
) {
    private val logger = org.slf4j.LoggerFactory.getLogger(this::class.java)
    private val repo: MutableMap<String, Trove> = HashMap()

    init {
        val data = getData()
        for (trove in data.troves) {
            val awsTrove = getTroveFromAws(trove)
            repo[awsTrove.id] = awsTrove
        }
    }

    fun add(trove: Trove) {
        repo[trove.name] = trove
    }

    fun findById(troveId: String): Trove {
        return repo[troveId] ?: throw Exception("Trove '$troveId' does not exist")
    }

    fun list(): List<Trove> {
        return repo.values.toList()
    }

    private fun getData(): MoochoDataRoot {
        val trovesObject = amazonS3Client.getObject(
            GetObjectRequest(
                "moocho-test", "troves"
            )
        )
        return objectMapper.readValue(trovesObject.objectContent)
    }

    private fun getTroveFromAws(troveDef: TroveDef): Trove {
        logger.info("Loading trove: ${troveDef.id}")
        val s3Object = amazonS3Client.getObject(
            GetObjectRequest(
                "moocho-test", "${troveDef.bucketPrefix}/${troveDef.id}"
            )
        )
        val trove = objectMapper.readValue<Trove>(s3Object.objectContent)
        trove.items?.forEach {
            if (it.littlePrinceItem != null && it.littlePrinceItem.title == null) {
                throw Exception("Null title, trove: ${trove.id}, in LittlePrinceItem: ${it.littlePrinceItem}")
            }
            if (it.littlePrinceItem != null && it.littlePrinceItem.language == null) {
                throw Exception("Null language, trove: ${trove.id}, in LittlePrinceItem: ${it.littlePrinceItem}")
            }
            if (it.littlePrinceItem != null && it.littlePrinceItem.smallImageUrl == null) {
                throw Exception("Null smallImageUrl, trove: ${trove.id}, in LittlePrinceItem: ${it.littlePrinceItem}")
            }
            if (it.littlePrinceItem != null && it.littlePrinceItem.largeImageUrl == null) {
                throw Exception("Null largeImageUrl, trove: ${trove.id}, in LittlePrinceItem: ${it.littlePrinceItem}")
            }
        }
        return trove
    }
}


data class Trove(
    val id: String,
    val name: String,
    val shortName: String,
    val titles: List<String>?,
    val items: List<Item>?
) {
    fun totalCount() = (items?.count()) ?: 0 + (titles?.count() ?: 0)
}

data class TroveSummary(
    val troveId: String,
    val name: String,
    val shortName: String,
    val itemCount: Int
)

data class Item(val movie: Movie?, val spotifyItem: SpotifyItem?, val littlePrinceItem: LittlePrinceItem?)

data class Movie(val title: String, val year: String, val director: String)

@JsonIgnoreProperties(ignoreUnknown = true)
data class SpotifyItem(
    val title: String,
    val addedAt: String?,
    val trackName: String?,
    val trackUri: String?,
    val albumName: String?,
    val albumUri: String?,
    val artistName: String?,
    val artistUri: String?,
    val albumArtistName: String?,
    val albumArtistUri: String?,
    val spotifyUri: String?,
    val trackDurationMs: String?,
    val trackPreviewUrl: String?,
    val albumReleaseDate: String?,
    val albumImageUrl: String?,
    val playlistName: String
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class LittlePrinceItem(
    val title: String?,
    val language: String?,
    val largeImageUrl: String?,
    val smallImageUrl: String?,
    val isbn13: String?,
    val publisher: String?,
    val publicationCountry: String?,
    val publicationLocation: String?,
    val format: String?,
    val translator: String?,
    val illustrator: String?,
    val narrator: String?,
    val quantity: Int = 1,
    val year: String?,
    val pages: Int?
)

data class TroveDef(val id: String, val bucketPrefix: String)

data class MoochoDataRoot(val troves: List<TroveDef>)
