import React, {useEffect, useState} from 'react';
import axios from 'axios';

import './App.css';
import ItemList from './ItemList';
import Item from './Item';

const fetchItems = async () => {
    try {
        const {data: response} = await axios.get("/items");
        return response;
    } catch (error) {
        console.log(error);
    }
};

const App = () => {
    const [items, setItems]: [Item[], any] = useState([]);

    useEffect(() => {
        fetchItems().then(theItems => setItems(theItems));
        // cleanup function
        return () => undefined;
    },
    // deps
    []
    );

    return (
        <div>
            <ItemList items={items} triggerItemsRefresh={() => fetchItems().then(theItems => setItems(theItems))}/>
        </div>
    );
};

export default App;
