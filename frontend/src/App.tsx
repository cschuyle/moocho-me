import React, {useEffect, useState} from 'react';
import axios from 'axios';

import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

import './App.css';
import TroveSelector from "./TroveSelector";
import TroveSummary from "./Trove";
import SearchResults from './SearchResults';

const fetchTroves = async () => {
    try {
        const {data: response} = await axios.get("/troves/summary");
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
    const asArray = encodedArray.split("~~")
    return asArray
}

const App = () => {

    const [troves, setTroves]: [TroveSummary[], any] = useState([])
    const [selectedTroves, setSelectedTroves]: [string, any] = useState("")
    const [primaryTrove, setPrimaryTrove]: [string, any] = useState("")
    const [troveShortNameMap, setTroveShortNameMap]: [Map<string, string>, any] =
        useState(new Map<string, string>())

    useEffect(() => {
            fetchTroves().then(theTroves => {
                setTroves(theTroves)
                theTroves.map((theTrove: TroveSummary) => {
                    troveShortNameMap.set("" + theTrove.id, "" + theTrove.shortName)
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

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Choose Troves
            </Button>

            <SearchResults
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
                        troves={troves}
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
