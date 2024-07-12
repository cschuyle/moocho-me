import React from 'react';
import {Badge} from 'react-bootstrap';
import {TroveSummary} from "./SearchResults";

interface SelectedTroveSummaryProps {
    troveHits: TroveSummary[]
}

const SelectedTroveSummary = (props: SelectedTroveSummaryProps) => {

    // Sort by number of hits descending
    const trovesWithHits: () => TroveSummary[] = () => {
        return props.troveHits.filter(troveHit => {
            return troveHit.hitCount > 0
        }).sort((th1: any, th2: any) => {
            return th2.hitCount - th1.hitCount
        })
    }

    // Sort alphabetically
    const trovesWithoutHits: () => TroveSummary[] = () => {
        return props.troveHits.filter(troveHit => {
            return troveHit.hitCount === 0
        }).sort((th1: any, th2: any) => {
            return (th1.shortName.toLowerCase() < th2.shortName.toLowerCase()) ? -1 : 1
        })
    }

    return (
        <>
            {trovesWithHits().map((troveHit: TroveSummary) =>
                <Badge bg="primary">
                    {troveHit.shortName} ({troveHit.hitCount}/{troveHit.itemCount})
                </Badge>
            )}

            {trovesWithoutHits().map(troveHit =>
                <Badge bg="secondary">
                    {troveHit.shortName} ({troveHit.hitCount}/{troveHit.itemCount})
                </Badge>
            )}
        </>
    )
}

export default SelectedTroveSummary
