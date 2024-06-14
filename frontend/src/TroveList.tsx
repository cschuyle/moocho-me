import React, { useState } from 'react';
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

    const handleTroveFilterChanged = (input: React.ChangeEvent<HTMLInputElement>) => {
        // console.log("filter changed to " + input.target.value)
        input.preventDefault();
        setTroveFilter(input.target.value);
        // console.log("handled '" + input.target.value + "' - " + (typeof input.target.value))
        if(input.target.value === "") {
            filterTroveList(input.target.value)
        }
    };

    function filterTroveList(theFilter: string) {
        
        if(theFilter === "") {
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

    const onFormSubmit = (e: any) => {
        e.preventDefault()
        e.stopPropagation();
      };

    React.useEffect(() => {
        setFilteredTroves(props.troves);
    }, [props]);

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
                        <tr className="trove" key={trove.id}>
                            <td>{trove.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TroveList;
