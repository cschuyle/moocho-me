import React, {useEffect, useState} from 'react';
import axios from 'axios';

import Button from 'react-bootstrap/Button';
import {Form, InputGroup} from 'react-bootstrap';

import SelectedTroveSummary from "./SelectedTroveSummary"

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel, Table,
    useReactTable
} from '@tanstack/react-table'

import {
    ItemHitFromServer,
    QueryResultFromServer,
    SearchResultFromServer,
    TroveHitFromServer,
    TroveHitSummary,
    TroveSummaryFromServer
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
    getTroveSummary: (troveId: string) => TroveSummaryFromServer
    selectedTroves: Map<string, number>
    primaryTrove: string
    getTroveShortName: (troveId: string) => string
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

const SearchResults = (props: SearchResultsProps) => {

    // SEARCH

    const [searchText, setSearchText]: [string, any] = useState('')
    const [resultItems, setResultItems]: [SearchResult[], any] = useState([])
    const [troveHits, setTroveHits]: [TroveHitFromServer[], any] = useState([])

    function getSelectedTrovesQuery() {
        return (Array.from(props.selectedTroves.keys()).length === 0)
            ? "*"
            : Array.from(props.selectedTroves.keys())
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

    const selectedTrovesList = () => Array.from(props.selectedTroves.keys())

    // TODO Why am I mapping this? Oh partly because I want to be able to have null
    function mapTroveHits(troveHits: TroveHitFromServer[]): (TroveHitSummary | null)[] {
        return troveHits.map((troveHit: TroveHitFromServer) => {

            if (selectedTrovesList().length === 0 || selectedTrovesList().includes(troveHit.troveId)) {
                return {
                    troveId: troveHit.troveId,
                    name: troveHit.name,
                    shortName: troveHit.shortName,
                    totalCount: troveHit.totalCount,
                    hitCount: troveHit.hitCount,
                    hitType: troveHit.hitType
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
            secondaryHits: []
        }
    }

    function mapSecondaryHits(secondaryHits: ItemHitFromServer[], parentKey: string) {
        return secondaryHits.map((secondaryHit: ItemHitFromServer) => {
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
            setTroveHits(mapTroveHits(response.troveHits)
                .filter((troveHit: TroveHitSummary | null) => troveHit !== null))

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

    const emptyTroveHitForId = (troveId: string) => {
        const troveSummary = props.getTroveSummary(troveId)!
        console.log("PRIMARY TROVE IS " + props.primaryTrove)
        return {
            troveId: troveSummary.troveId,
            name: troveSummary.name,
            shortName: troveSummary.shortName,
            totalCount: troveSummary.itemCount,
            hitCount: 0,
            hitType: (troveId === props.primaryTrove) ? "primary" : "none"
        }
    }

    useEffect(() => {
            if (selectedTrovesList().length !== 0) {
                setTroveHits(selectedTrovesList().map((troveId) => {
                    return emptyTroveHitForId(troveId)
                }))
            } else {
                setTroveHits([])
            }
        },
        // deps
        [props]
    )

    //https://tanstack.com/table/latest/docs/framework/react/examples/basic
    const columnHelper = createColumnHelper<SearchResult>()

    const columns = [
        columnHelper.accessor(row => row.score, {
            header: 'Score',
            cell: item => <span>{item.getValue()}%</span>
        }),
        columnHelper.accessor(row => row.troveShortName, {
            header: 'Trove'
        }),
        columnHelper.accessor(row => row.title, {
            header: 'Title'
        })
    ]

    const table : Table<SearchResult> = useReactTable({
        data: resultItems,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

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


            <table className="table table-sm table-bordered table-hover" >
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr className="table-secondary" key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}

export default SearchResults;
