import React, {useEffect, useState} from 'react';
import axios from 'axios';

import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

import './App.css';
import TroveSelector from "./TroveSelector";
import SearchResults from './SearchResults';
import {TroveHitSummary, TroveSummaryFromServer} from "./ServerData";

const fetchTroveSummaries = async () => {
    try {
        const {data: response} = await axios.get("/troves/summary");
        // console.log("GOT TROVE SUMMARIES: " + response)
        return response
    } catch (error) {
        console.log(error);
    }
};


const arrayFrom = (encodedArray: string) => {
    if (encodedArray.length == 0) {
        return []
    }
    encodedArray = encodedArray.substring(1, encodedArray.length - 1)
    return encodedArray.split("~~")
}

const mapTroveSummaries = (troveSummaries: TroveSummaryFromServer[]): TroveHitSummary[] => {
    // console.log("MAPPING TROVE HIT SUMMARIES FROM " + troveSummaries)
    return troveSummaries.map(troveSummary => {
        return {
            troveId: troveSummary.troveId,
            name: troveSummary.name,
            shortName: troveSummary.shortName,
            totalCount: troveSummary.itemCount,
            hitCount: 0,
            hitType: "none"
        }
    })
}

const App = () => {

    const [allTroveSummaries, setAllTroveSummaries]: [Map<string, TroveSummaryFromServer>, any] = useState(new Map())
    const [troveHitSummaries, setTroveHitSummaries]: [TroveSummaryFromServer[], any] = useState([])
    const [selectedTroves, setSelectedTroves]: [string, any] = useState("")
    const [primaryTrove, setPrimaryTrove]: [string, any] = useState("")
    const [troveShortNameMap, setTroveShortNameMap]: [Map<string, string>, any] = useState(new Map())

    useEffect(() => {
            fetchTroveSummaries().then(theTroveSummaries => {
                // This is error-prone because of the naming of the vars ... make a function!
                theTroveSummaries.forEach((theTroveSummary: TroveSummaryFromServer) => {
                    allTroveSummaries.set("" + theTroveSummary.troveId, theTroveSummary)
                })
                setAllTroveSummaries(allTroveSummaries)

                setTroveHitSummaries(mapTroveSummaries(theTroveSummaries))

                // TODO allTroveSummaries has this info already
                theTroveSummaries.forEach((theTroveSummary: TroveSummaryFromServer) => {
                    troveShortNameMap.set("" + theTroveSummary.troveId, "" + theTroveSummary.shortName)
                })
                setTroveShortNameMap(troveShortNameMap)
            })

            // cleanup function
            return () => undefined;
        },
        // deps
        []
    )

    const [show, setShow] = useState(false)

    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)
    const getTroveShortName = (troveId: string) => {
        return troveShortNameMap.get(troveId)
    }
    const getTroveSummary = (troveId: string) => {
        // console.log(`allTroveSummaries is ${allTroveSummaries}`)
        return allTroveSummaries.get(troveId)
    }

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Choose Troves
            </Button>

            <SearchResults
                getTroveSummary={getTroveSummary}
                selectedTroves={arrayFrom(selectedTroves)}
                primaryTrove={primaryTrove}
                getTroveShortName={getTroveShortName}
            />

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Troves</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body>
                    <TroveSelector
                        troves={troveHitSummaries}
                        selectedTroves={selectedTroves}
                        setSelectedTroves={setSelectedTroves}
                        primaryTrove={primaryTrove}
                        setPrimaryTrove={setPrimaryTrove}
                    />
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default App;
