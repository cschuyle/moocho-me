import React, {useState} from 'react';
import axios from 'axios';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import {Form, InputGroup} from 'react-bootstrap';

import SelectedTroveSummary from "./SelectedTroveSummary"
import TroveSummary from "./Trove";

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
    getTroveShortName: any
}

export interface SearchResult {
    secondaryHits: SearchResult[];
    key: React.Key | null | undefined;
    troveId: string;
    troveShortName: string;
    title: string;
    score: number;
    totalCount: number;
    hitCount: number;
    shortName: string;
}

const SearchResults = (props: SearchResultsProps) => {

    // SEARCH

    const [searchText, setSearchText]: [string, any] = useState('');
    const [resultItems, setResultItems]: [Array<SearchResult>, any] = useState([]);
    const [troveHits, setTroveHits]: [Array<TroveSummary>, any] = useState([]);

    function getSelectedTrovesQuery() {
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

    function mapTroveHits(troveHits: TroveSummary[]) {
        return troveHits.map((troveHit: TroveSummary) => {
            if (props.selectedTroves.length === 0 || props.selectedTroves.includes(troveHit.id)) {
                return {
                    troveId: troveHit.id,
                    shortName: troveHit.shortName,
                    hitCount: troveHit.hitCount,
                    totalCount: troveHit.itemCount
                }
            }
            return null
        });
    }

    function mapSearchResult(hit: any) {
        return {
            key: hit.doc,
            score: Math.floor(hit.score * 100),
            title: hit.title,
            troveShortName: props.getTroveShortName(hit.troveId)
        };
    }

    function mapSearchResults(searchResults: SearchResult[]): any {
        return searchResults.map((searchResult: any) => {
            const hit = searchResult.primaryHit
            let mapped: any = mapSearchResult(hit)
            mapped["secondaryHits"] = searchResult.secondaryHits.map((secondaryHit: any) => {
                return mapSearchResult(secondaryHit)
            })
            return mapped
        })
    }

    const doSearch = (searchText: string) => {
        doSearchRequest(searchText).then(response => {
            setResultItems(mapSearchResults(response.searchResults))

            const theTroveHits = mapTroveHits(response.troveHits)
                .filter((troveHit: any) => troveHit !== null)

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

    const handleSearchAll = (input: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setSearchText("*")
        doSearch("*")
    }

    const handleSearchTextChanged = (input: React.ChangeEvent<HTMLInputElement>) => {
        input.preventDefault()
        setSearchText(input.target.value)
    }

    // THE MEAT

    return (
        <>
            <SelectedTroveSummary troveHits={troveHits}/>
            <Form>

                <InputGroup>

                    <Button
                        onClick={handleDoSearch}>Search
                    </Button>
                    <Form.Control
                        type="search"
                        id="searchText"
                        placeholder='search selected Troves'
                        value={searchText}
                        onChange={handleSearchTextChanged}
                        onKeyDown={handleKeyDown}
                    />
                    <Button
                        variant="outline-secondary"
                        onClick={handleSearchAll}
                    >
                        * (all)
                    </Button>
                </InputGroup>

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
                {resultItems.map((item: SearchResult) => (
                    <>
                        <tr className="table-secondary" key={item.key}>
                            <td>{item.score}%</td>
                            <td>{item.troveShortName}</td>
                            <td>{item.title}</td>
                        </tr>
                        {item.secondaryHits!.map((secondary: SearchResult) => (
                            <tr>
                                <td>{Math.floor(secondary.score * 100)}%</td>
                                <td>{secondary.troveShortName}</td>
                                <td>{secondary.title}</td>
                            </tr>
                        ))}
                    </>
                ))}
                </tbody>
            </Table>
        </>
    )
}

export default SearchResults;
