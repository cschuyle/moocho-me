import React, {useState} from 'react';
import axios from 'axios';

interface Item {
    name: string;
}

interface ItemListProps {
    items: Array<Item>;
    triggerItemsRefresh: () => void;
}

const createItem = async (name: string) => {
    try {
        const {data: response} = await axios.post('/items', {name: name});
        return response;
    } catch (error) {
        console.log(error);
    }
};

const ItemList = (props: ItemListProps) => {
    const [newItemName, setNewItemName]: [string, any] = useState('');

    const handleItemNameChanged = (input: React.ChangeEvent<HTMLInputElement>) => {
        input.preventDefault();
        setNewItemName(input.target.value);
    };

    const handleAddNewItem = (e: React.ChangeEvent<any>) => {
        e.preventDefault();
        createItem(newItemName).then(() => {
            setNewItemName('');
            console.log("Trigger refresh because of " + newItemName)
            props.triggerItemsRefresh();
        });
    };

    return (
        <div className="ItemList">

            <div>
                <input className="input" type="text" value={newItemName}
                       onChange={handleItemNameChanged} placeholder="Item name"
                />
                <button className="btn"
                        onClick={handleAddNewItem}>Add Item
                </button>
            </div>

            <h2>All Items</h2>

            <table>
                <tbody>
                {props.items.map((item) => (
                    <tr className="item" key={item.name}>
                        <td>{item.name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ItemList;
