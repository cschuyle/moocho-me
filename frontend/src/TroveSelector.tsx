import React, {useState} from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {InputGroup} from "react-bootstrap";
import {TroveSummary} from "./SearchResults";

interface TroveSelectorProps {
    troves: TroveSummary[]

    selectedTroves: any // TODO Should this be state?
    setSelectedTroves: any

    primaryTrove: string
    setPrimaryTrove: any
}

const TroveSelector = (props: TroveSelectorProps) => {
    const [troveFilter, setTroveFilter]: [string, any] = useState('');
    const [filteredTroves, setFilteredTroves]: [TroveSummary[], any] = useState([]);
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
            setFilteredTroves(props.troves)
            return
        }
        const filtered = props.troves.filter(trove => {
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
    const mangledTroveString = (troveId: string) => `~${troveId}~`

    const isTroveSelected = (troveId: string) => {
        const troveStr = mangledTroveString(troveId)
        const ret = props.selectedTroves.indexOf(troveStr) >= 0
        return ret
    }

    const handleTroveSelectionChanged = (_: any, troveId: string) => {
        const wasSelected = isTroveSelected(troveId)
        let newSelectedTroves = "" + props.selectedTroves
        if (wasSelected) {
            newSelectedTroves = newSelectedTroves.replace(mangledTroveString(troveId), "");
        } else {
            newSelectedTroves += mangledTroveString(troveId)
        }
        props.setSelectedTroves(newSelectedTroves)
    }

    // PRIMARY TROVE - there can be only one and it must also be selected.

    const isTrovePrimarySelected = (troveId: string) => {
        return props.primaryTrove == troveId
    }

    const handlePrimaryTroveSelectionChanged = (_: any, troveId: string) => {
        if (props.primaryTrove === troveId) {
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
        props.setSelectedTroves("")
    }

    // THE MEAT

    function searchAllTrovesIsSet() {
        return props.selectedTroves === "";
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
