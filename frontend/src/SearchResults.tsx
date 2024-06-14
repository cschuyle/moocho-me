import React, { useState } from 'react';
import axios from 'axios';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import { Form } from 'react-bootstrap';

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
    results: string[];
}

interface SearchResult {
    score: Number;
    troveId: string;
    title: string;
}

const SearchResults = (props: SearchResultsProps) => {

    // SEARCH

    const [searchText, setSearchText]: [string, any] = useState('');
    const [resultItems, setResultItems]: [Array<any>, any] = useState([]);

    const doSearchRequest = async (searchText: string) => {
        try {
            const { data: response } = await axios.get(`/search?troves=*&query=${encodeURI(searchText)}&maxResults=1500`);
            return response
        } catch (error) {
            console.log(error);
        }
    }
    
    const doSearch = (searchText: string) => {    
        doSearchRequest(searchText).then(response => {
            const resultItems = response.searchResults.map((searchResult:any) => {
                return {
                    score: searchResult.primaryHit.score,
                    troveId: searchResult.primaryHit.troveId,
                    title: searchResult.primaryHit.title
                }
            })
            setResultItems(resultItems)
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

        <Table striped bordered hover size="sm">
            <thead>
                <tr>
                    <th>Score</th>
                    <th>Trove</th>
                    <th>Title</th>
                </tr>
            </thead>
            <tbody>
                {resultItems.map(item =>
                <tr>
                    <td>{Math.floor(item.score * 100)}%</td>
                    <td>{item.troveId}</td>
                    <td>{item.title}</td>
                </tr>
                )}
            </tbody>
        </Table>
        </>
    );
};

export default SearchResults;
