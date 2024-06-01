package com.dragnon.moocho.api

data class TroveDocument(val troveId: String, val title: String) : Comparable<TroveDocument> {
    override fun compareTo(other: TroveDocument): Int {
        if (this.troveId < other.troveId) return -1
        if (this.troveId > other.troveId) return 1
        return this.title.compareTo(other.title)
    }
}