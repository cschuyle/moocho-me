import React from 'react';
import {Badge} from 'react-bootstrap';

interface SelectedTroveSummaryProps {
    troveHits: Array<any>
}

const SelectedTroveSummary = (props: SelectedTroveSummaryProps) => {

    return (
        <>
            {props.troveHits.map(troveHit =>
                <Badge bg={(troveHit.hitCount === 0) ? "secondary" : "primary"}>
                    {troveHit.shortName} ({troveHit.hitCount}/{troveHit.totalCount})
                </Badge>
            )}
        </>
    )
}

export default SelectedTroveSummary
