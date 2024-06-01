package com.dragnon.moocho.api

import org.apache.lucene.document.Document
import org.apache.lucene.document.Field
import org.apache.lucene.document.TextField
import org.apache.lucene.index.IndexWriter
import org.apache.lucene.index.IndexWriterConfig
import org.apache.lucene.store.FSDirectory
import org.apache.lucene.util.IOUtils
import java.io.Closeable
import java.nio.file.Files
import java.nio.file.Path
import java.util.concurrent.ConcurrentHashMap
import java.util.regex.Pattern

private val trovesIndexCache: MutableMap<String, TrovesIndex> = ConcurrentHashMap()

fun getTrovesIndex(troves: List<Trove>) =
    trovesIndexCache.computeIfAbsent(troveIndexKey(troves)) { TrovesIndex(troves) }

private fun troveIndexKey(troves: List<Trove>) = troves.map { it.id }.joinToString("|")

class TrovesIndex internal constructor(val troves: List<Trove>) : Closeable {

    private val logger = org.slf4j.LoggerFactory.getLogger(this::class.java)

    val directory: FSDirectory

    private val indexPath: Path

    init {
        val analyzer = AccentedAnalyzer()

        this.indexPath = Files.createTempDirectory("tempIndex")
        this.directory = FSDirectory.open(indexPath)
        val config = IndexWriterConfig(analyzer)
        val iwriter = IndexWriter(directory, config)
        try {
            troves.forEach { trove ->
                logger.info("Indexing trove ${trove.name}")
                trove.titles?.forEach { title ->
                    addDocument(iwriter, trove.id, mapOf("title" to title))
                }
                logger.info("Trove ${trove.name}, titles: ${trove.titles?.size ?: 0}")
                trove.items?.forEach { item ->
                    if (item.movie != null) {
                        addDocument(
                            iwriter, trove.id, mapOf(
                                "title" to item.movie.title,
                                "director" to item.movie.director
                            )
                        )
                    }
                    if (item.spotifyItem != null) {
                        addDocument(
                            iwriter, trove.id, mapOf(
                                "title" to item.spotifyItem.title,
                                "addedAt" to (item.spotifyItem.addedAt ?: ""),
                                "albumArtistName" to (item.spotifyItem.albumArtistName ?: ""),
                                "albumArtistUri" to (item.spotifyItem.albumArtistUri ?: ""),
                                "albumImageUrl" to (item.spotifyItem.albumImageUrl ?: ""),
                                "albumName" to (item.spotifyItem.albumName ?: ""),
                                "albumName" to (item.spotifyItem.albumName ?: ""),
                                "albumReleaseDate" to (item.spotifyItem.albumReleaseDate ?: ""),
                                "albumUri" to (item.spotifyItem.albumUri ?: ""),
                                "artistName" to (item.spotifyItem.artistName ?: ""),
                                "artistName" to (item.spotifyItem.artistName ?: ""),
                                "artistUri" to (item.spotifyItem.artistUri ?: ""),
                                "playlistName" to item.spotifyItem.playlistName,
                                "spotifyUri" to (item.spotifyItem.spotifyUri ?: ""),
                                "trackDurationMs" to (item.spotifyItem.trackDurationMs ?: ""),
                                "trackName" to (item.spotifyItem.trackName ?: ""),
                                "trackUri" to (item.spotifyItem.trackUri ?: ""),
                                "trackPreviewUrl" to (item.spotifyItem.trackPreviewUrl ?: "")
                            )
                        )
                    }
                    if (item.littlePrinceItem != null) {
                        addDocument(
                            iwriter, trove.id, mapOf(
                                "title" to item.littlePrinceItem.title!!,
                                "language" to item.littlePrinceItem.language!!,
                                "smallImageUrl" to item.littlePrinceItem.smallImageUrl!!,
                                "largeImageUrl" to item.littlePrinceItem.largeImageUrl!!
                            )
                        )
                    }
                }
                logger.info("Trove ${trove.name}, items: ${trove.items?.size ?: 0}")
            }
        } finally {
            iwriter.close()
        }
    }

    override fun close() {
        directory.close()
        IOUtils.rm(indexPath)
    }

    private fun addDocument(iwriter: IndexWriter, troveId: String, fields: Map<String, String>) {
        val doc = Document()
        doc.add(Field("troveId", troveId, TextField.TYPE_STORED))
        fields.forEach { (field, value) ->
            doc.add(Field(field, value, TextField.TYPE_STORED))
        }
        iwriter.addDocument(doc)
    }
}

private val LUCENE_PATTERN = Pattern.compile("[\\\\+\\-!():^\\[\\]{}~*?/\"]")

private val REPLACEMENT_STRING = "\\\\$0"

fun escapeQuery(title: String): String {
    return LUCENE_PATTERN.matcher(title).replaceAll(REPLACEMENT_STRING)
}

