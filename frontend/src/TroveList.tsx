import React, { ChangeEventHandler, useState } from 'react';
import TroveSummary from "./Trove";
import axios from 'axios';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

interface TroveListProps {
    troves: Array<TroveSummary>;
}

const TroveList = (props: TroveListProps) => {
    const [troveFilter, setTroveFilter]: [string, any] = useState('');
    const [filteredTroves, setFilteredTroves]: [TroveSummary[], any] = useState([]);
    const [selectedTroves, setSelectedTroves]: [string, any] = useState("");

    React.useEffect(() => {
        setFilteredTroves(props.troves);
    }, [props]);

    // TROVE FILTER (textbox)

    const handleTroveFilterChanged = (input: React.ChangeEvent<HTMLInputElement>) => {
        // console.log("filter changed to " + input.target.value)
        input.preventDefault();
        setTroveFilter(input.target.value);
        // console.log("handled '" + input.target.value + "' - " + (typeof input.target.value))
        if (input.target.value === "") {
            filterTroveList(input.target.value)
        }
    };

    function filterTroveList(theFilter: string) {

        if (theFilter === "") {
            // console.log("it's empty!")
            setFilteredTroves(props.troves)
            return
        }
        const filtered = props.troves.filter(trove => trove.name.toLowerCase().includes(theFilter.toLowerCase()) || trove.id.toLowerCase().includes(troveFilter.toLowerCase()))
        // console.log(`${props.troves.length}, filtered with ${troveFilter}: ${filtered.length}`)
        setFilteredTroves(filtered)
    }

    const handleFilterTroves = (e: React.ChangeEvent<any>) => {
        e.preventDefault();
        filterTroveList(troveFilter);
    };

    const handleKeyDown = (e: any) => {
        if (e.key === "Enter") {
            filterTroveList(troveFilter);
        }
        if (e.key === "Escape") {
            // e.preventDefault()
            e.stopPropagation()
            setTroveFilter("")
            filterTroveList(troveFilter)
        }
        // console.log("pressed " + e.key)
    };

    // Nothing to do on the backend for this form
    const onFormSubmit = (e: any) => {
        e.preventDefault()
        e.stopPropagation();
    };


    // TROVE SELECTION (checckboxes)

    const isTroveSelected = (troveId: string) => {
        return selectedTroves.indexOf(troveId) >= 0
    }

    const handleTroveSelectionChanged = (e: any, troveId: string) => {
        const wasSelected = isTroveSelected(troveId)
        console.log("Will change troveId " + troveId + " to " + !wasSelected)
        let newSelectedTroves = ""+selectedTroves
        // console.log(`old ${selectedTroves} new ${newSelectedTroves}`)
        if (wasSelected) {
            newSelectedTroves = newSelectedTroves.replace(troveId, "");
        } else {
            newSelectedTroves += troveId
        }
        setSelectedTroves(newSelectedTroves)
        // console.log("Did change troveId " + troveId + " to " + isTroveSelected(troveId))
    }

    // THE MEAT
    
    return (
        <div className="TroveList">
            <div>
                <Form onSubmit={onFormSubmit}>
                    <Form.Control
                        type="search"
                        id="troveFilter"
                        placeholder='filter by Trove name'
                        onChange={handleTroveFilterChanged}
                        onKeyDown={handleKeyDown}
                    />
                    <Button
                        onClick={handleFilterTroves}>filter
                    </Button>
                </Form>
            </div>

            <table>
                <tbody>
                    {filteredTroves.map((trove) => (
                        <tr className="trove">
                            <Form.Check
                                key={trove.id}
                                checked={isTroveSelected(trove.id)}
                                onChange={(e: any) => handleTroveSelectionChanged(e, trove.id)}
                            >
                            </Form.Check>

                            <td>{trove.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TroveList;
