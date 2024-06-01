package com.dragnon.moocho.api

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

// TODO These endpoints are not used by the UI.

@RestController
class FindDuplicatesController(val repository: TroveRepository) {

    @GetMapping("/duplicates/top")
    fun getTopDuplicates(@RequestParam minScore: Double) =
        DuplicateFinder(repository.list()).findTopDuplicates(minScore)

    @GetMapping("/duplicates/none")
    fun getItemsWithNoDuplicates(@RequestParam minScore: Double): MutableList<NoDuplicateDescription> {
        return DuplicateFinder(repository.list()).findItemsWithNoDuplicates(minScore)
    }
}
