import React from 'react';
import {Badge} from 'react-bootstrap';
// import {TroveSummary} from "./SearchResults";
import {TroveHitFromServer, TroveSummaryFromServer} from "./ServerData";

interface SelectedTroveSummaryProps {
    troveHits: TroveHitFromServer[]
}

const SelectedTroveSummary = (props: SelectedTroveSummaryProps) => {

    // Sort by number of hits descending
    const primaryTroveHits: () => TroveHitFromServer[] = () => {
        return props.troveHits.filter(troveHit => {
            return troveHit.hitCount > 0 && troveHit.hitType === "primary"
        }).sort((th1: any, th2: any) => {
            return th2.hitCount - th1.hitCount
        })
    }

    const secondaryTroveHits: () => TroveHitFromServer[] = () => {
        return props.troveHits.filter(troveHit => {
            return troveHit.hitCount > 0 && troveHit.hitType === "secondary"
        }).sort((th1: any, th2: any) => {
            return th2.hitCount - th1.hitCount
        })
    }

    // Sort alphabetically
    const trovesWithoutHits: () => TroveHitFromServer[] = () => {
        return props.troveHits.filter(troveHit => {
            return troveHit.hitCount === 0
        }).sort((th1: any, th2: any) => {
            return (th1.shortName.toLowerCase() < th2.shortName.toLowerCase()) ? -1 : 1
        })
    }

    return (
        <>
            {primaryTroveHits().map((troveHit: TroveHitFromServer) =>
                <Badge bg="primary" key={troveHit.troveId}>
                    {troveHit.shortName} ({troveHit.hitCount}/{troveHit.totalCount})
                </Badge>
            )}

            {secondaryTroveHits().map((troveHit: TroveHitFromServer) =>
                <Badge bg="success" key={troveHit.troveId}>
                    {troveHit.shortName} ({troveHit.hitCount}/{troveHit.totalCount})
                </Badge>
            )}

            {trovesWithoutHits().map(troveHit =>
                <Badge bg="secondary" key={troveHit.troveId}>
                    {troveHit.shortName} ({troveHit.hitCount}/{troveHit.totalCount})
                </Badge>
            )}
        </>
    )
}

export default SelectedTroveSummary
