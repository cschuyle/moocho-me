import React, { useState, useEffect } from 'react';

type Item = {
    name: string;
}
const ItemList = () => {
    const [newItemName, setNewItemName]: [string, any] = useState('');
    const [items, setItems] : [Item[], any] = useState([]);

    const ReadItems = () => {

        useEffect(() => {
            fetch('/items')
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    console.log(data);
                    setItems(data);
                });
        }, []);
    };

    const handleItemNameChanged = (input: React.ChangeEvent<HTMLInputElement>) => {
        setNewItemName(input.target.value);
    };

    const handleAddNewItem = (_: React.ChangeEvent<any>) => {
        setItems([...items, {
            name: newItemName
        }]);
        setNewItemName('');
    };

    ReadItems();

    return (
        <div className="ItemList">

            <div>
                <button className="btn"
                        onClick={handleAddNewItem}>Add Item</button>
                <input className="input" type="text" value={newItemName}
                       onChange={handleItemNameChanged} placeholder="Item name" />
            </div>

            <h2>All Items</h2>

            <table>
                <tbody>
                { items.map((item) => (
                    <tr className="item" key={item.name}>
                    <td>Item {item.name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ItemList;
