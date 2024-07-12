import React from 'react';
import {Badge} from 'react-bootstrap';

interface SelectedTroveSummaryProps {
    troveHits: Array<any>
}

const SelectedTroveSummary = (props: SelectedTroveSummaryProps) => {

    // Sort by number of hits descending
    const trovesWithHits: () => any[] = () => {
        return props.troveHits.filter(troveHit => {
            return troveHit.hitCount > 0
        }).sort((th1: any, th2: any) => {
            return th2.hitCount - th1.hitCount
        })
    }

    // Sort alphabetically
    const trovesWithoutHits: () => any[] = () => {
        return props.troveHits.filter(troveHit => {
            return troveHit.hitCount === 0
        }).sort((th1: any, th2: any) => {
            return (th1.shortName.toLowerCase() < th2.shortName.toLowerCase()) ? -1 : 1
        })
    }
    
    return (
        <>
            {trovesWithHits().map(troveHit =>
                <Badge bg="primary">
                    {troveHit.shortName} ({troveHit.hitCount}/{troveHit.totalCount})
                </Badge>
            )}

            {trovesWithoutHits().map(troveHit =>
                <Badge bg="secondary">
                    {troveHit.shortName} ({troveHit.hitCount}/{troveHit.totalCount})
                </Badge>
            )}
        </>
    )
}

export default SelectedTroveSummary
