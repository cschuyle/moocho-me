package com.dragnon.moocho.api

import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.junit.jupiter.api.Test


class DuplicateFinderTest {
    @Test
    fun test_findTopDuplicates() {
        val duplicateFinder = DuplicateFinder(
            listOf(
                Trove("id-0", "trove zero", "tr0", listOf("not at all related"), listOf()),
                Trove("id-1", "trove one ", "tr1", listOf("thing 1"), listOf()),
                Trove("id-2", "trove two ", "tr2", listOf("thing 2"), listOf())
            )
        )
        assertThat(
            duplicateFinder.findTopDuplicates(0.0), `is`(
                listOf(
                    DuplicateDescription(
                        TroveDocument("id-1", "thing 1"),
                        listOf(TroveDocument("id-2", "thing 2")),
                        1.0
                    )
                )
            )
        )
    }

    @Test
    fun test_findTopDuplicates_shouldGroupByPrimaryDocument() {
        val duplicateFinder = DuplicateFinder(
            listOf(
                Trove("id-0", "trove zero", "tr0", listOf("not at all related"), listOf()),

                Trove("id-1", "trove one ", "tr1", listOf("one title"), listOf()),
                Trove("id-1", "trove one ", "tr1", listOf("another title"), listOf()),

                Trove("id-2", "trove two ", "tr2", listOf("one title"), listOf()),

                Trove("id-3", "trove two ", "tr2", listOf("another title with lower score"), listOf())
            )
        )
        assertThat(
            duplicateFinder.findTopDuplicates(0.0), `is`(
                listOf(
                    DuplicateDescription(
                        TroveDocument("id-1", "one title"),
                        listOf(
                            TroveDocument("id-2", "one title"),
                            TroveDocument("id-1", "another title"),
                            TroveDocument("id-3", "another title with lower score")
                        ),
                        0.47172035762905046
                    ),
                    DuplicateDescription(
                        TroveDocument("id-1", "another title"),
                        listOf(
                            TroveDocument("id-3", "another title with lower score"),
                            TroveDocument("id-2", "one title")
                        ),
                        0.46295074830922833
                    ),
                    DuplicateDescription(
                        TroveDocument("id-2", "one title"),
                        listOf(
                            TroveDocument("id-3", "another title with lower score")
                        ),
                        0.1678310813402794
                    )
                )
            )
        )
    }
}
