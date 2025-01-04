import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
const Demo = () => {
    const [items, setItems] = useState([]);
    const fetchItems = async () => {
        const { data, error } = await supabase.from("recordmaster").select("*");
        if (error) console.error(error);
        else setItems(data);
    };
    useEffect(() => {
        fetchItems();
    }, []);
    return (
        <div className="records">
            <h2 className="subtitle">Records</h2>
            <div className="record-card-flex">
                {items.map((item) => (
                    <div className="record-card" key={item.id}>
                        {item.image && (
                            <img
                                src={`https://vjvrzdtysyorsntbmrwu.supabase.co/storage/v1/object/public/images/${item.image}`}
                                alt={item.name}
                                className="record-image"
                            />
                        )}
                        <h3 className="record-title">{item.name}</h3>
                        <p className="record-description">{item.description}</p>
                        <p className="record-date">{item.date}</p>
                        <a
                            href={item.link}
                            className="record-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Visit Link
                        </a>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Demo