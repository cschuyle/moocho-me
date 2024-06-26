package com.dragnon.moocho.api

import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.junit.jupiter.api.Test

class SearcherTest {

    @Test
    fun test_wildcardSearch() {
        val searcher = Searcher(
            listOf(
                Trove("trove-0", "trove zero", "tr0", listOf("not at all related"), listOf()),
                Trove("trove-1", "trove one", "tr1", listOf("thing 1", "thing 2"), listOf())
            )
        )

        assertThat(
            searcher.search("*", 1000), `is`(
                listOf(
                    SearchResult(
                        ItemHit(0, 1.0, "trove-0", "not at all related"),
                        listOf(),
                        1.0
                    ),
                    SearchResult(
                        ItemHit(1, 1.0, "trove-1", "thing 1"),
                        listOf(),
                        1.0
                    ),
                    SearchResult(
                        ItemHit(2, 1.0, "trove-1", "thing 2"),
                        listOf(),
                        1.0
                    )
                )
            )
        )
    }
}