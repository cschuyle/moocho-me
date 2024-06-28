import React, {useState} from 'react';
import axios from 'axios';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import {Form} from 'react-bootstrap';

import TroveHits from "./TroveHits"

/*
GET
https://moocho.me/search?troves=books:primary,other-covers:secondary&query=*&maxResults=1500

https://moocho.me/search?troves=*&query=alien&maxResults=1500

RESPONSE
{
    "troveHits": [
        {
            "troveId": "dvdinbox",
            "hitCount": 0,
            "name": "DVDInbox Queue",
            "shortName": "DVDInbox",
            "totalCount": 217
        },
        ...
    ],
    "searchResults": [
        {
            "primaryHit": {
                "doc": 69830,
                "score": 1.0,
                "troveId": "spotify",
                "title": "Surfing with the Alien"
            },
            "secondaryHits": [
                {
                    "doc": 100,
                    "score": 13.835546493530273,
                    "troveId": "other-covers",
                    "title": "La realtà non è come ci appare - La struttura elementare delle cose"
                },
                ...
            ],
            "score": 1.0
        },
        ...
    ]
}
*/

// THis is wrong. It should be the list of troves.
interface SearchResultsProps {
    selectedTroves: string[]
    primaryTrove: string
}

// TODO How do I make a new one of these? - using `any` at the moment.
// interface TroveHit {
//     troveId: string;
//     shortName: string;
//     hitCount: number;
//     totalCount: number;
// }

const SearchResults = (props: SearchResultsProps) => {

    // SEARCH

    const [searchText, setSearchText]: [string, any] = useState('');
    const [resultItems, setResultItems]: [Array<any>, any] = useState([]);
    const [troveHits, setTroveHits]: [Array<any>, any] = useState([]);

    function getSelectedTrovesQuery() {
        console.log("Primary Trove is "+props.primaryTrove)
        return (props.selectedTroves.length === 0)
            ? "*"
            : props.selectedTroves
                .map(trove => {
                    if (props.primaryTrove === trove) {
                        return `${trove}:primary`
                    }
                    return `${trove}:secondary`
                })
                .join(",");
    }

    const doSearchRequest = async (searchText: string) => {
        try {
            const selectedTrovesQuery = getSelectedTrovesQuery()
            const {data: response} = await axios.get(`/search?troves=${selectedTrovesQuery}&query=${encodeURI(searchText)}&maxResults=3000`);
            return response
        } catch (error) {
            console.log(error);
        }
    }

    const doSearch = (searchText: string) => {
        doSearchRequest(searchText).then(response => {
            const resultItems = response.searchResults
            setResultItems(resultItems)

            const theTroveHits = response.troveHits.map((troveHit: any) => {
                if (props.selectedTroves.length === 0 || props.selectedTroves.includes(troveHit.troveId)) {
                    return {
                        troveId: troveHit.troveId,
                        shortName: troveHit.shortName,
                        hitCount: troveHit.hitCount,
                        totalCount: troveHit.totalCount
                    }
                }
                return null
            })
                .filter((thing: any) => thing !== null)

            setTroveHits(theTroveHits)
        });
    }

    const handleKeyDown = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault()
            doSearch(searchText);
        }
        if (e.key === "Escape") {
            setSearchText("")
            doSearch("")
        }
    };

    const handleDoSearch = (e: React.ChangeEvent<any>) => {
        doSearch(searchText);
    }

    const handleSearchTextChanged = (input: React.ChangeEvent<HTMLInputElement>) => {
        input.preventDefault();
        setSearchText(input.target.value);
    };

    // THE MEAT

    return (
        <>
            <TroveHits troveHits={troveHits}/>
            <Form>
                <Form.Control
                    type="search"
                    id="searchText"
                    placeholder='search selected Troves'
                    onChange={handleSearchTextChanged}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    onClick={handleDoSearch}>Search
                </Button>
            </Form>

            <Table bordered hover size="sm">
                <thead>
                <tr>
                    <th>Score</th>
                    <th>Trove</th>
                    <th>Title</th>
                </tr>
                </thead>
                <tbody>
                {/*TODO: Keys for rows*/}
                {resultItems.map(item => (
                    <>
                        <tr className="table-secondary">
                            <td>{Math.floor(item.primaryHit.score * 100)}%</td>
                            <td>{item.primaryHit.troveId}</td>
                            <td>{item.primaryHit.title}</td>
                        </tr>
                        {item.secondaryHits.map((secondary: any) => (
                            <tr>
                                <td>{Math.floor(secondary.score * 100)}%</td>
                                <td>{secondary.troveId}</td>
                                <td>{secondary.title}</td>
                            </tr>
                        ))}
                    </>
                ))}
                </tbody>
            </Table>
        </>
    );
};

export default SearchResults;
