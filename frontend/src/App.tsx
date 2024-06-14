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


const App = () => {

    const [troves, setTroves]: [TroveSummary[], any] = useState([]);

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

    // console.log(`troves is length ${troves.length}`)

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Choose Troves
            </Button>

            <SearchResults
                results={["Item 1", "Item 2"]}
            />

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Troves</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body>
                    <TroveList troves={troves} />
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default App;
