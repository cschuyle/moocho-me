package com.dragnon.moocho.api

import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/troves")
class TroveController(val repository: TroveRepository) {

    @PostMapping
    fun createTrove(@RequestBody trove: Trove) = repository.add(trove)

    @GetMapping
    fun get() = repository.list()
}
