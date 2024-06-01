import React, {useEffect, useState} from 'react';
import axios from 'axios';

import './App.css';

const fetchItems = async () => {
    try {
        const {data: response} = await axios.get("/items");
        return response;
    } catch (error) {
        console.log(error);
    }
};

const App = () => {
    return (
        <div>
        This is a totally empty document
        </div>
    );
};

export default App;
