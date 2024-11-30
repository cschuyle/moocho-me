import React, {useState} from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {InputGroup} from "react-bootstrap";
import {TroveSummaryFromServer} from "./ServerData";

export enum CrossTroveOperation {
    Duplicates = "Duplicates", Uniques = "Uniques"
}

interface TroveSelectorProps {
    getAllTroveSummaries: () => Map<string, TroveSummaryFromServer>

    getSelectedTroves: () => Map<string, number>
    setSelectedTroves: (map: Map<any, any>) => null

    getPrimaryTrove: () => string
    setPrimaryTrove: (troveId: string) => null

    getCrossTroveOperation: () => CrossTroveOperation
    setCrossTroveOperation: (operation: CrossTroveOperation | null) => null
}

const TroveSelector = (props: TroveSelectorProps) => {
    const [troveFilterState, setTroveFilterState]: [string, any] = useState("");
    const [filteredTrovesState, setFilteredTrovesState]: [TroveSummaryFromServer[], any] = useState([]);

    function justSelectedTroveIds() {
        return Array.from(props.getSelectedTroves().keys())
            .filter((troveId) => troveId !== props.getPrimaryTrove());
    }

    function justPrimarySelectedTroveIds() {
        return Array.from(props.getAllTroveSummaries().keys())
            .filter((troveId) => troveId === props.getPrimaryTrove());
    }

    function searchAllTrovesIsSet() {
        return justSelectedTroveIds().length === 0 && justPrimarySelectedTroveIds().length === 0;
    }


    const troveNameFor = (troveId: string) =>
        props.getAllTroveSummaries().get(troveId)?.name

    React.useEffect(() => {
        filterTroveList(troveFilterState)
    }, [props]);

    // TROVE FILTER (textbox)

    const handleTroveFilterChanged = (input: React.ChangeEvent<HTMLInputElement>) => {
        input.preventDefault();
        setTroveFilterState(input.target.value);
        filterTroveList(input.target.value)
    };

    function filterTroveList(theFilter: string) {

        if (theFilter === "") {
            setFilteredTrovesState(Array.from(props.getAllTroveSummaries().values()))
            return
        }
        const filtered = Array.from(props.getAllTroveSummaries().values())
            .filter(trove => {
                    return trove.name.toLowerCase().includes(theFilter.toLowerCase())
                    // || // TODO Why did I have this here?
                    // trove.troveId.toLowerCase().includes(troveFilterState.toLowerCase())
                }
            )
        setFilteredTrovesState(filtered)
    }

    const handleKeyDown = (e: any) => {
        // e.preventDefault()
        if (e.key === "Enter") {
            filterTroveList(troveFilterState);
        }
        if (e.key === "Escape") {
            // e.preventDefault()
            e.stopPropagation()
            setTroveFilterState("")
            filterTroveList("")
        }
    };

    // Nothing to do on the backend for this form
    const onFormSubmit = (e: any) => {
        e.preventDefault()
        e.stopPropagation();
    };

    // TROVE SELECTION (checkboxes)

    const isTroveSelected = (troveId: string) =>
        justSelectedTroveIds().includes(troveId)
        || justPrimarySelectedTroveIds().includes(troveId)

    const handleTroveSelectionChanged = (e: any, troveId: string) => {
        e.preventDefault();
        let newSelectedTroves = new Map(props.getSelectedTroves())
        if (isTroveSelected(troveId)) {
            newSelectedTroves.delete(troveId)
            if (isTrovePrimarySelected(troveId)) {
                props.setPrimaryTrove("")
            }
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
            console.log(`YES primary trove is ${troveId}.`)
            props.setPrimaryTrove("")
            props.setCrossTroveOperation(null)
        } else {
            console.log(`NO primary trove is NOT ${troveId}.`)
            props.setPrimaryTrove(troveId)
        }
    }

    const handleSelectSearchAllTroves = () => {
        props.setPrimaryTrove("")
        props.setSelectedTroves(new Map())
    }

    // THE MEAT

    function handleCrossTroveOperationChanged(e: React.ChangeEvent<HTMLSelectElement>) {
        e.preventDefault()
        props.setCrossTroveOperation(e.target.value as CrossTroveOperation)
    }

    return (
        <>
            <Form onSubmit={onFormSubmit}>
                <InputGroup>
                    <Form.Control
                        type="search"
                        id="troveFilter"
                        value={troveFilterState}
                        placeholder='filter by Trove name'
                        onChange={handleTroveFilterChanged}
                        onKeyDown={handleKeyDown}
                    />
                </InputGroup>
                {!searchAllTrovesIsSet() &&
                    <Button
                        variant="outline-secondary"
                        onClick={handleSelectSearchAllTroves}
                    >
                        Clear all selections
                    </Button>
                }
            </Form>
            {/*{searchAllTrovesIsSet() &&*/}
            {/*    <p>All troves will be searched. You may select which troves to search.</p>}*/}

            {justSelectedTroveIds().length > 0 && !props.getPrimaryTrove() &&
                <>
                    <hr/>
                    <h6> No Primary Trove selected
                    </h6>
                    <p>You may select a Trove to be Primary, and then select an operation between it and the other selected Troves.</p>
                </>
            }
            {props.getPrimaryTrove() &&
                <>
                    <hr/>
                    <h6> Primary Trove
                    </h6>
                    <>
                        Operation for Primary Trove:
                        <Form.Select
                            onChange={(e) => handleCrossTroveOperationChanged(e)}
                            value={props.getCrossTroveOperation()}
                        >
                            <option value="Duplicates">Find Duplicates in Other Troves</option>
                            <option value="Uniques">Find Items Unique to this Trove</option>
                        </Form.Select>
                    </>
                </>}
            {justPrimarySelectedTroveIds()
                .map((troveId) => (
                    <div>
                        <Form.Check
                            key={troveId}
                            inline
                            checked={true}
                            label={troveNameFor(troveId)}
                            onChange={(e: any) => handleTroveSelectionChanged(e, troveId)}
                        />
                        <Form.Check
                            key={"primary-selector-" + troveId}
                            type="switch"
                            inline
                            reverse
                            checked={true}
                            onChange={(e: any) => handlePrimaryTroveSelectionChanged(e, troveId)}
                        />
                    </div>
                ))
            }

            {justSelectedTroveIds().length === 0 && justPrimarySelectedTroveIds().length === 0 &&
                <>
                    <hr/>
                    <h6> No Troves selected
                    </h6>
                    <p>All troves will be searched. You may select which troves to search.</p>
                </>
            }

            {justSelectedTroveIds().length > 0 && justPrimarySelectedTroveIds().length > 0 &&
                <>
                    <hr/>
                    <h6> Other Troves
                    </h6>
                </>
            }
            {justSelectedTroveIds().length > 0 && justPrimarySelectedTroveIds().length === 0 &&
                <>
                    <hr/>
                    <h6> Selected troves
                    </h6>
                </>
            }
            {justSelectedTroveIds()
                .filter((troveId) => !isTrovePrimarySelected(troveId))
                .map((troveId) => (
                    <div>
                        <Form.Check
                            key={troveId}
                            inline
                            checked={true}
                            label={troveNameFor(troveId)}
                            onChange={(e: any) => handleTroveSelectionChanged(e, troveId)}
                        />
                        <Form.Check
                            key={"primary-selector-" + troveId}
                            type="switch"
                            inline
                            reverse
                            checked={false}
                            onChange={(e: any) => handlePrimaryTroveSelectionChanged(e, troveId)}
                        />
                    </div>
                ))
            }
            <hr/>
            <h6> Available Troves
            </h6>
            <>
                {
                    filteredTrovesState
                        .filter((trove) => !isTroveSelected(trove.troveId))
                        .map((trove) => (
                            <div>
                                <Form.Check
                                    key={trove.troveId}
                                    inline
                                    checked={false}
                                    label={trove.name}
                                    onChange={(e: any) => handleTroveSelectionChanged(e, trove.troveId)}
                                />
                            </div>
                        ))}
            </>
        </>
    )
}


export default TroveSelector;