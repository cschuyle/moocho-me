export interface TroveSummaryFromServer {
    troveId: string;
    name: string;
    shortName: string;
    itemCount: number;
}

export interface TroveHitSummary {
    troveId: string
    name: string
    shortName: string
    totalCount: number
    hitCount: number
    hitType: string  // "primary" or "secondary" or "none"
}

export interface TroveHitFromServer {
    troveId: string
    name: string
    shortName: string
    totalCount: number
    hitCount: number
    hitType: string  // "primary" or "secondary" or "none"
}

export interface QueryResultFromServer {
    troveHits: TroveHitFromServer[]
    searchResults: SearchResultFromServer[]
}

export interface SearchResultFromServer {
    primaryHit: ItemHitFromServer
    secondaryHits: ItemHitFromServer[]
    score: number
}

export interface ItemHitFromServer {
    doc: number
    score: number
    troveId: string
    title: string
}

