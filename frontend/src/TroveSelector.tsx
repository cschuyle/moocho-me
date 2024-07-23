import React, {useState} from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {InputGroup} from "react-bootstrap";
import {TroveSummaryFromServer} from "./ServerData";

interface TroveSelectorProps {
    getAllTroveSummaries: () => Map<string, TroveSummaryFromServer>

    getSelectedTroves: () => Map<string, number>
    setSelectedTroves: (map: Map<any, any>) => null

    getPrimaryTrove: () => string
    setPrimaryTrove: (troveId: string) => null
}

const TroveSelector = (props: TroveSelectorProps) => {
    const [troveFilter, setTroveFilter]: [string, any] = useState('');
    const [filteredTroves, setFilteredTroves]: [TroveSummaryFromServer[], any] = useState([]);
    const [showOnlySelected, setShowOnlySelected]: [boolean, any] = useState(false);

    React.useEffect(() => {
        filterTroveList(troveFilter)
    }, [props]);

    // TROVE FILTER (textbox)

    const handleTroveFilterChanged = (input: React.ChangeEvent<HTMLInputElement>) => {
        input.preventDefault();
        setTroveFilter(input.target.value);
        if (input.target.value === "") {
            filterTroveList(input.target.value)
        }
    };

    function filterTroveList(theFilter: string) {

        if (theFilter === "") {
            setFilteredTroves(Array.from(props.getAllTroveSummaries().values()))
            return
        }
        const filtered = Array.from(props.getAllTroveSummaries().values())
            .filter(trove => {
                    return trove.name.toLowerCase().includes(theFilter.toLowerCase()) ||
                        trove.troveId.toLowerCase().includes(troveFilter.toLowerCase())
                }
            )
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
    };

    // Nothing to do on the backend for this form
    const onFormSubmit = (e: any) => {
        e.preventDefault()
        e.stopPropagation();
    };


    // TROVE SELECTION (checkboxes)

    // The way to encode troveIds in the state variable. Puke.
    // const mangledTroveString = (troveId: string) => `~${troveId}~`

    const selectedTrovesList = () => Array.from(props.getSelectedTroves().keys())

    const isTroveSelected = (troveId: string) => selectedTrovesList().includes(troveId)


    const handleTroveSelectionChanged = (_: any, troveId: string) => {
        let newSelectedTroves = props.getSelectedTroves()
        if (isTroveSelected(troveId)) {
            newSelectedTroves.delete(troveId)
        } else {
            newSelectedTroves.set(troveId, 1)
        }
        props.setSelectedTroves(newSelectedTroves)
    }

    // PRIMARY TROVE - there can be only one and it must also be selected.

    const isTrovePrimarySelected = (troveId: string) =>
        props.getPrimaryTrove() === troveId

    const handlePrimaryTroveSelectionChanged = (_: any, troveId: string) => {
        if (props.getPrimaryTrove() === troveId) {
            props.setPrimaryTrove("")
        } else {
            props.setPrimaryTrove(troveId)
        }
    }

    const handleShowOnlySelectedChanged = () => {
        setShowOnlySelected(!showOnlySelected)
        setTroveFilter("")
        filterTroveList(troveFilter);
    }

    const handleSelectSearchAllTroves = () => {
        props.setPrimaryTrove("")
        props.setSelectedTroves(new Map())
    }

    // THE MEAT

    function searchAllTrovesIsSet() {
        return selectedTrovesList().length === 0;
    }

    return (
        <>
            <Form onSubmit={onFormSubmit}>
                <InputGroup>
                    <Button
                        onClick={handleFilterTroves}>filter
                    </Button>
                    <Form.Control
                        type="search"
                        id="troveFilter"
                        placeholder='filter by Trove name'
                        onChange={handleTroveFilterChanged}
                        onKeyDown={handleKeyDown}
                    />
                </InputGroup>
                {!searchAllTrovesIsSet() &&
                    <Button
                        variant="outline-primary"
                        onClick={handleSelectSearchAllTroves}
                    >
                        Search all troves
                    </Button>
                }
            </Form>

            {!searchAllTrovesIsSet() &&
                <Form.Check // prettier-ignore
                    type="switch"
                    id="show-only-selected"
                    label="Show only selected Troves"
                    checked={showOnlySelected}
                    onChange={handleShowOnlySelectedChanged}
                />
            }
            {searchAllTrovesIsSet() &&
                <p>All troves will be searched. To limit search, select troves to search.</p>}

            {filteredTroves.map((trove) => (
                <div>
                    {(!showOnlySelected || isTroveSelected(trove.troveId)) &&
                        <Form.Check
                            key={trove.troveId}
                            inline
                            checked={isTroveSelected(trove.troveId)}
                            label={trove.name}
                            onChange={(e: any) => handleTroveSelectionChanged(e, trove.troveId)}
                        />
                    }
                    {isTroveSelected(trove.troveId) &&
                        <Form.Check
                            key={"primary-selector-" + trove.troveId}
                            type="switch"
                            inline
                            reverse
                            checked={isTrovePrimarySelected(trove.troveId)}
                            onChange={(e: any) => handlePrimaryTroveSelectionChanged(e, trove.troveId)}
                        />
                    }
                </div>
            ))}
        </>
    );
};

export default TroveSelector;
