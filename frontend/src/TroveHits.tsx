import React from 'react';
import {Badge} from 'react-bootstrap';

interface TroveHitsProps {
    troveHits: Array<any>
}

const TroveHits = (props: TroveHitsProps) => {

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

export default TroveHits
