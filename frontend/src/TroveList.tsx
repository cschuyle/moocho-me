import React, {useState} from 'react';
import TroveSummary from "./Trove";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {InputGroup} from "react-bootstrap";

interface TroveSelectorProps {
    troves: Array<TroveSummary>

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
        const filtered = props.troves.filter(trove =>
            trove.name.toLowerCase().includes(theFilter.toLowerCase()) ||
            trove.id.toLowerCase().includes(troveFilter.toLowerCase())
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
    const troveString = (troveId: string) => `~${troveId}~`

    const isTroveSelected = (troveId: string) => {
        const troveStr = troveString(troveId)
        return props.selectedTroves.indexOf(troveStr) >= 0
    }

    const handleTroveSelectionChanged = (e: any, troveId: string) => {
        const wasSelected = isTroveSelected(troveId)
        let newSelectedTroves = "" + props.selectedTroves
        if (wasSelected) {
            newSelectedTroves = newSelectedTroves.replace(troveString(troveId), "");
        } else {
            newSelectedTroves += troveString(troveId)
        }
        props.setSelectedTroves(newSelectedTroves)
    }

    // PRIMARY TROVE - there can be only one and it must also be selected.

    const isTrovePrimarySelected = (troveId: string) => {
        return props.primaryTrove == troveId
    }

    const handlePrimaryTroveSelectionChanged = (e: any, troveId: string) => {
        if (props.primaryTrove === troveId) {
            props.setPrimaryTrove("")
        } else {
            props.setPrimaryTrove(troveId)
        }
    }

    const handleShowOnlySelectedChanged = () => {
        setShowOnlySelected(!showOnlySelected)
    }

    // THE MEAT

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
            </Form>
            <Form.Check // prettier-ignore
                type="switch"
                id="show-only-selecte"
                label="Show only selected Troves"
                checked={showOnlySelected}
                onChange={handleShowOnlySelectedChanged}
            />
            {filteredTroves.map((trove) => (
                <div>
                    {(!showOnlySelected || isTroveSelected(trove.id)) &&
                        <Form.Check
                            key={trove.id}
                            inline
                            checked={isTroveSelected(trove.id)}
                            label={trove.name}
                            onChange={(e: any) => handleTroveSelectionChanged(e, trove.id)}
                        />
                    }
                    {isTroveSelected(trove.id) &&
                        <Form.Check
                            key={"primary-selector-" + trove.id}
                            type="switch"
                            inline
                            reverse
                            checked={isTrovePrimarySelected(trove.id)}
                            onChange={(e: any) => handlePrimaryTroveSelectionChanged(e, trove.id)}
                        />
                    }
                </div>
            ))}
        </>
    );
};

export default TroveSelector;
