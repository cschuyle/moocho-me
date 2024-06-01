import React, {useState} from 'react';
import TroveSummary from "./Trove";
import axios from 'axios';


interface TroveListProps {
    troves: Array<TroveSummary>;
}

const TroveList = (props: TroveListProps) => {
    const [troveFilter, setTroveFilter]: [string, any] = useState('');
    const [filteredTroves, setFilteredTroves]: [TroveSummary[], any] = useState([]);

    const handleTroveFilterChanged = (input: React.ChangeEvent<HTMLInputElement>) => {
        input.preventDefault();
        setTroveFilter(input.target.value);
    };

    function filterTroveList() {
        const filtered = props.troves.filter(trove => trove.name.toLowerCase().includes(troveFilter.toLowerCase()) || trove.id.toLowerCase().includes(troveFilter.toLowerCase()))
        // console.log(`${props.troves.length}, filtered with ${troveFilter}: ${filtered.length}`)
        setFilteredTroves(filtered)
    }

    const handleFilterTroves = (e: React.ChangeEvent<any>) => {
        e.preventDefault();
        filterTroveList();
    };

    // TODO: Revisit to see if this apparent bug (or lack of a feature?) in React/Typescript is fixed. This is a hack that I found on: https://stackoverflow.com/questions/69284145/typescript-issues-with-keyboardevent-event-type-and-addeventlistener
    interface KeyboardEvent {
        key: string;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            filterTroveList();
        }
    };

    React.useEffect(() => {
        setFilteredTroves(props.troves);
    }, [props]);

    return (
        <div className="TroveList">
            <div>
                <input className="input" type="text" value={troveFilter}
                       placeholder="Trove name"
                       onChange={handleTroveFilterChanged}
                       onKeyDown={handleKeyDown}
                />
                <button className="btn"
                        onClick={handleFilterTroves}>Filter troves
                </button>
            </div>

            <h2>Select Troves</h2>

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
