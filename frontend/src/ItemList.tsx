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

    function createNewItemAndRefreshList() {
        createItem(newItemName).then(() => {
            setNewItemName('');
            console.log("Trigger refresh because of " + newItemName)
            props.triggerItemsRefresh();
        });
    }

    const handleAddNewItem = (e: React.ChangeEvent<any>) => {
        e.preventDefault();
        createNewItemAndRefreshList();
    };

    // TODO: Revisit to see if this apparent bug (or lack of a feature?) in React/Typescript is fixed. This is a hack that I found on: https://stackoverflow.com/questions/69284145/typescript-issues-with-keyboardevent-event-type-and-addeventlistener
    interface KeyboardEvent {
        key: string;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        console.log("Ooooh you pressed " + e.key)
        if (e.key === "Enter") {
            console.log("Setting new item")
            createNewItemAndRefreshList();
        }
    };

    return (
        <div className="ItemList">

            <div>
                <input className="input" type="text" value={newItemName}
                       placeholder="Item name"
                       onChange={handleItemNameChanged}
                       onKeyDown={handleKeyDown}
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
