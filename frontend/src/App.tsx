import React, {useEffect, useState} from 'react';
import axios from 'axios';

import './App.css';
import TroveList from "./TroveList";
import TroveSummary from "./Trove";

const fetchTroves = async ()=> {
    try {
        const {data: response} = await axios.get("/troves/summary");
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

    return (
        <div>
            <TroveList troves={troves} />
        </div>
    );
};

export default App;
