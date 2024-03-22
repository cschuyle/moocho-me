package com.dragnon.fortxi.items.data

import jakarta.persistence.Entity
import jakarta.persistence.Id

@Entity
data class Item(
    @Id
    var name: String? = null,
    var type: String? = null
)
