import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CrudApp = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    date: '',
    link: '',
    image: null,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from('recordmaster').select('*');
    if (error) console.error(error);
    else setItems(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const saveItem = async () => {
    if (!formData.image) {
      console.error("Please select an image.");
      return;
    }

    let imageUrl = '';

    // Upload image to Supabase Storage
    const imageFile = formData.image;
    const fileName = `${Date.now()}_${imageFile.name}`;
    console.log("fileName"+fileName);
    console.log("imageFile"+imageFile); 
    const { data, error: uploadError } = await supabase.storage
      .from('images') 
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error("Image upload failed:", uploadError.message);
      return;
    }

    imageUrl = data.Key; // Store the image URL in Supabase

    const { id, ...dataToSave } = formData;
    if (id) {
      // Update record
      const { error } = await supabase.from('recordmaster').update({
        ...dataToSave,
        image: imageUrl,
      }).eq('id', id);
      if (error) console.error(error);
    } else {
      // Insert new record
      const { error } = await supabase.from('recordmaster').insert({
        ...dataToSave,
        image: imageUrl,
      });
      if (error) console.error(error);
    }

    setFormData({ id: null, name: '', description: '', date: '', link: '', image: null });
    fetchItems();
  };

  const editItem = (item) => {
    setFormData(item);
  };

  const deleteItem = async (id) => {
    const { error } = await supabase.from('recordmaster').delete().eq('id', id);
    if (error) console.error(error);
    fetchItems();
  };

  return (
    <div>
      <h1>CRUD with Supabase</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveItem();
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
        <input
          type="url"
          name="link"
          placeholder="Link"
          value={formData.link}
          onChange={handleInputChange}
          required
        />
        <input
          type="file"
          name="image"
          onChange={handleFileChange}
          required
        />
        <button type="submit">Save</button>
      </form>

      <div>
        <h2>Records</h2>
        {items.map((item) => (
          <div key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>{item.date}</p>
            <a href={item.link}>Link</a>
            {item.image && (
              <img
                src={`https://vjvrzdtysyorsntbmrwu.supabase.co/storage/v1/object/public/images/${item.image}`}
                alt={item.name}
                style={{ width: '100px' }}
              />
            )}
            <button onClick={() => editItem(item)}>Edit</button>
            <button onClick={() => deleteItem(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrudApp;
