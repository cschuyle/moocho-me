package com.dragnon.moocho.api

import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/troves")
class TroveController(val repository: TroveRepository) {

    @PostMapping
    fun createTrove(@RequestBody trove: Trove) = repository.add(trove)

    @GetMapping
    fun get() = repository.list()

    @GetMapping("summary")
    fun getSummary() = repository.list().map { trove: Trove -> TroveSummary(id = trove.id, name = trove.name, shortName = trove.shortName, itemCount = trove.totalCount()) }
}
