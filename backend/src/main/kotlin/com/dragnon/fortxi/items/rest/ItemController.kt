package com.dragnon.fortxi.items.rest

import com.dragnon.fortxi.items.data.ItemRepository
import com.dragnon.fortxi.items.data.Item
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.logging.Logger

@RestController
class ItemController(val repository: ItemRepository) {

    @GetMapping("/items")
    fun readItems(): List<Item> {
        Logger.getAnonymousLogger().info("Getting all Items")
        return repository.findAll().toList()
    }

    @PostMapping("/items")
    fun createItem(@RequestBody item: Item) {
        Logger.getAnonymousLogger().info("Saving " + item.name)
        repository.save(item)
    }

    @GetMapping("/menuitems")
    fun readMenu(): HashMap<String, ArrayList<MenuItem>> {
        val items = repository.findAll()

        val menuItems = HashMap<String, ArrayList<MenuItem>>()

        for (item in items) {
            val itemType = item.type!!
            if (!menuItems.contains(itemType)) {
                menuItems[itemType] = ArrayList()
            }
            val itemList = menuItems[itemType]!!
            itemList.add(MenuItem(item.name))
        }

//        val menuCategoryList = ArrayList<MenuCategory>()

        return menuItems
    }
}