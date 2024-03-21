package com.dragnon.fortxi.items.rest

import com.dragnon.fortxi.items.data.ItemRepository
import com.dragnon.fortxi.items.data.Item
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class ItemController(val repository: ItemRepository) {

    @GetMapping("/items")
    fun readItems(): List<Item> {
        return repository.findAll().toList();
    }
}