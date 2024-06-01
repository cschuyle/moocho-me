package com.dragnon.moocho.api

import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.junit.jupiter.api.Test

class SearcherTest {

    // TODO The SearchResults family and DuplicateDescription family should be merged and refactored.
    // - Compare the expectation of this test vs DuplicateFinderTest.
    // - Map the output of the Searcher from DuplicateDescription (internal) to SearchResponse (HTTP response).
    @Test
    fun test_findDuplicates() {

        val searcher = Searcher(
            listOf(
                Trove("id-0", "trove zero", "tr0", listOf("not at all related"), listOf()),
                Trove("id-1", "trove one ", "tr1", listOf("thing 1"), listOf()),
                Trove("id-2", "trove two ", "tr2", listOf("thing 2"), listOf())
            )
        )

        assertThat(
            searcher.findDuplicates(listOf("id-1"), listOf("id-0", "id-2"), "*", 500, 0.1, 3), `is`(
                listOf(
                    SearchResult(
                        ItemHit(1, 1.0, "id-1", "thing 1"),
                        listOf(ItemHit(2, 0.389965683221817, "id-2", "thing 2")),
                        1.0
                    )
                )
            )
        )
    }
}