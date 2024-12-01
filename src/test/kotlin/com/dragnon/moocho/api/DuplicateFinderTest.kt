package com.dragnon.moocho.api

import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.junit.jupiter.api.Test

class DuplicateFinderTest {

    @Test
    fun test_findDuplicates() {

        val searcher = DuplicateFinder(troves, primaryTroveIds, secondaryTroveIds)

        val troves = listOf(
            Trove("id-0", "trove zero", "tr0", listOf("not at all related"), listOf()),
            Trove("id-1", "trove one ", "tr1", listOf("thing 1"), listOf()),
            Trove("id-2", "trove two ", "tr2", listOf("thing 2"), listOf())
        )

        assertThat(
            searcher.findDuplicates(troves, listOf("id-1"), listOf("id-0", "id-2"), SearchController.CrossTroveOperation.Duplicates,"*", 500, 0.1, 3), `is`(
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

    // TODO Should refactor the controller so the logic is in the Search service.
//    @Test
//    fun test_wildcardSearch() {
//        val searcher = Searcher(
//            listOf(
//                Trove("trove-0", "trove zero", "tr0", listOf("not at all related"), listOf()),
//                Trove("trove-1", "trove one", "tr1", listOf("thing 1", "thing 2"), listOf()),
//
//            )
//        )
//
//        assertThat(
//            searcher.search("*", 1000), `is`(
//                SearchResponse(
//                    listOf(
//                        TroveHit("trove-0", 1, "trove zero", "tr0", 1),
//                        TroveHit("trove-1", 2, "trove one", "tr1", 2)
//                    ),
//                    listOf(
//                        SearchResult(
//                            ItemHit(0, 1.0, "trove-0", "not at all related"),
//                            listOf(),
//                            1.0
//                        ),
//                        SearchResult(
//                            ItemHit(1, 1.0, "trove-1", "thing 1"),
//                            listOf(),
//                            1.0
//                        ),
//                        SearchResult(
//                            ItemHit(1, 1.0, "trove-1", "thing 2"),
//                            listOf(),
//                            1.0
//                        )
//                    )
//                )
//            )
//        )
//    }
}