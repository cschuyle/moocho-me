export interface TroveSummaryFromServer {
    troveId: string;
    name: string;
    shortName: string;
    itemCount: number;
}

export interface TroveHitFromServer {
    troveId: string
    hitCount: number
    name: string
    shortName: string
    totalCount: number
}

export interface QueryResultFromServer {
    troveHits: TroveHitFromServer[]
    searchResults: SearchResultFromServer[]
}

export interface ItemHitFromServer {
    doc: number
    score: number
    troveId: string
    title: string
}

export interface SearchResultFromServer {
    primaryHit: ItemHitFromServer
    secondaryHits: ItemHitFromServer[]
    score: number
}

