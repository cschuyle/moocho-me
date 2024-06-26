import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

import './App.css';
import TroveList from "./TroveList";
import TroveSummary from "./Trove";
import SearchResults from './SearchResults';

const fetchTroves = async () => {
    try {
        const { data: response } = await axios.get("/troves/summary");
        return response
    } catch (error) {
        console.log(error);
    }
};


const arrayFrom = (encodedArray: string) => {
    if(encodedArray.length == 0) {
        return []
    }
    encodedArray = encodedArray.substring(1, encodedArray.length-1)
    const asArray = encodedArray.split("~~")
    return asArray
}

const App = () => {

    const [troves, setTroves]: [TroveSummary[], any] = useState([]);
    const [selectedTroves, setSelectedTroves]: [string, any] = useState("");
    const [primaryTrove, setPrimaryTrove]: [string, any] = useState("");

    useEffect(() => {
        fetchTroves().then(theTroves => {
            setTroves(theTroves)
        });

        // cleanup function
        return () => undefined;
    },
        // deps
        []
    );

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Choose Troves
            </Button>

            <SearchResults
                selectedTroves={arrayFrom(selectedTroves)}
                primaryTrove={primaryTrove}
            />

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Troves</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body>
                    <TroveList 
                        troves={troves}
                        selectedTroves={selectedTroves}
                        setSelectedTroves={setSelectedTroves}
                        primaryTrove={primaryTrove}
                        setPrimaryTrove={setPrimaryTrove}
                    />
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default App;
