import React, {useState} from 'react';
import axios from 'axios';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import {Form, InputGroup} from 'react-bootstrap';

import SelectedTroveSummary from "./SelectedTroveSummary"

import {
    ItemHitFromServer,
    QueryResultFromServer,
    SearchResultFromServer,
    TroveHitFromServer
} from "./ServerData";

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

interface SearchResultsProps {
    selectedTroves: string[]
    primaryTrove: string
    getTroveShortName: any
}

export interface SearchResult {
    secondaryHits: SearchResult[]
    key: React.Key | null | undefined
    troveId: string
    troveShortName: string
    title: string
    score: number
    shortName: string
}

export interface TroveSummary {
    troveId: string
    name: string
    shortName: string
    itemCount: number
}

const SearchResults = (props: SearchResultsProps) => {

    // SEARCH

    const [searchText, setSearchText]: [string, any] = useState('')
    const [resultItems, setResultItems]: [SearchResult[], any] = useState([])
    const [troveHits, setTroveHits]: [TroveHitFromServer[], any] = useState([])

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
                .join(",")
    }

    const doSearchRequest = async (searchText: string) => {
        try {
            const selectedTrovesQuery = getSelectedTrovesQuery()
            const {data: response} = await axios.get(`/search?troves=${selectedTrovesQuery}&query=${encodeURI(searchText)}&maxResults=3000`)
            return response
        } catch (error) {
            console.log(error)
        }
    }

    function mapTroveHits(troveHits: TroveHitFromServer[]): (TroveSummary | null)[] {
        return troveHits.map((troveHit: TroveHitFromServer) => {
            if (props.selectedTroves.length === 0 || props.selectedTroves.includes(troveHit.troveId)) {
                return {
                    troveId: troveHit.troveId,
                    name: troveHit.name,
                    shortName: troveHit.shortName,
                    hitCount: troveHit.hitCount,
                    itemCount: troveHit.totalCount
                }
            }
            return null
        })
    }

    function mapItemHit(hit: ItemHitFromServer, parentKey: string = ""): SearchResult {
        return {
            key: hit.troveId + hit.doc + parentKey,
            score: Math.floor(hit.score * 100),
            title: hit.title,
            troveShortName: props.getTroveShortName(hit.troveId),
            troveId: hit.troveId,
            shortName: props.getTroveShortName(hit.troveId),

            // Blecch. Just mirror the data structures in the server for chrissakes
            // totalCount: -1,
            // hitCount: -1,
            secondaryHits: []
        }
    }

    function mapSecondaryHits(secondaryHits: any, parentKey: string) {
        return secondaryHits.map((secondaryHit: any) => {
            return mapItemHit(secondaryHit, parentKey)
        })
    }

    function mapSearchResults(searchResults: SearchResultFromServer[]): SearchResult[] {
        return searchResults.map((searchResult: SearchResultFromServer) => {
            let primaryHit: SearchResult = mapItemHit(searchResult.primaryHit)
            primaryHit["secondaryHits"] = mapSecondaryHits(searchResult.secondaryHits, "" + primaryHit.key)
            return primaryHit
        })
    }

    const doSearch = (searchText: string) => {
        doSearchRequest(searchText).then((response: QueryResultFromServer) => {
            console.log("TROVE HITS IS " + response.troveHits)
            setTroveHits(mapTroveHits(response.troveHits)
                .filter((troveHit: any) => troveHit !== null))

            setResultItems(mapSearchResults(response.searchResults))
        })
    }

    const handleKeyDown = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault()
            doSearch(searchText)
        }
        if (e.key === "Escape") {
            setSearchText("")
            doSearch("")
        }
    }

    const handleDoSearch = (_: React.ChangeEvent<any>) =>
        doSearch(searchText)

    const handleSearchAll = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
                            <tr key={item.key}>
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
