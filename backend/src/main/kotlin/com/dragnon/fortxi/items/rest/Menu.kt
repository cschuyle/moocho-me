package com.dragnon.fortxi.items.rest

/*
List of MenuCategories
[
    {
        type: Drink,
        items: [
            { name: Coke }
        ]
    }
]
*/

Drinks

* coke

Sides

fries
beans



data class MenuItem(
    val name: String? = null
)

data class MenuCategory(
    val type: String? = null,
    val items: List<MenuItem>? = null
)
