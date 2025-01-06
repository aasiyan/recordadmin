import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./RecordAdmin.css";
// import logo from "../assets/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";

const RecordAdmin = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    date: "",
    link: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/"); // Redirect to login if no session
      }
    };
    checkSession();
    fetchItems();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
    } else {
      console.log("User logged out");
      navigate("/recordadmin"); // Redirect to login page
    }
  };
  const fetchItems = async () => {
    const { data, error } = await supabase.from("recordmaster").select("*");
    if (error) console.error(error);
    else setItems(data);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required.";
    if (!formData.description) errors.description = "Description is required.";
    if (!formData.date) errors.date = "Date is required.";
    if (!formData.image) errors.image = "Photo is required.";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
    setErrors({ ...errors, image: "" });
  };

  const saveItem = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl = formData.image ? formData.image.name : "";
      let oldImage = null;

      if (formData.id) {
        const { data: item, error: fetchError } = await supabase
          .from("recordmaster")
          .select("image")
          .eq("id", formData.id)
          .single();

        if (fetchError) {
          console.error("Error fetching record:", fetchError.message);
          return;
        }

        oldImage = item ? item.image : null;
      }

      if (formData.image) {
        const fileName = `${Date.now()}_${formData.image.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, formData.image);

        if (uploadError) {
          console.error("Image upload failed:", uploadError.message);
          return;
        }

        imageUrl = uploadData.path;

        if (oldImage) {
          const oldFileName = oldImage.split("/").pop();
          const { error: deleteError } = await supabase.storage
            .from("images")
            .remove([oldFileName]);

          if (deleteError) {
            console.error("Failed to delete old image:", deleteError.message);
          }
        }
      }

      const { id, image, ...dataToSave } = formData;
      const record = {
        ...dataToSave,
        image: imageUrl,
      };

      if (id) {
        const { error: updateError } = await supabase
          .from("recordmaster")
          .update(record)
          .eq("id", id);

        if (updateError) {
          console.error("Error updating record:", updateError.message);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from("recordmaster")
          .insert(record);

        if (insertError) {
          console.error("Error inserting record:", insertError.message);
          return;
        }
      }

      setFormData({
        id: null,
        name: "",
        description: "",
        date: "",
        link: "",
        image: null,
      });
      fetchItems();
      alert("Records added successfully!!!");
    } catch (error) {
      console.error("Unexpected error:", error.message);
    } finally {
      setLoading(false);
      document.getElementById("file-data").value = "";
    }
  };

  const editItem = (item) => {
    setFormData(item);
    scrollToTop();
    setErrors({});
  };

  const deleteItem = async (id) => {
    setLoading(true);
    try {
      const { data: item, error: fetchError } = await supabase
        .from("recordmaster")
        .select("image")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error fetching record:", fetchError.message);
        return;
      }

      if (item && item.image) {
        const fileName = item.image.split("/").pop();

        const { error: deleteError } = await supabase.storage
          .from("images")
          .remove([fileName]);

        if (deleteError) {
          console.error(
            "Error deleting image from storage:",
            deleteError.message
          );
        }
      }

      const { error } = await supabase
        .from("recordmaster")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error deleting record:", error.message);
      }

      fetchItems();
      alert("Records Deleted successfully!!!");
    } catch (error) {
      console.error("Unexpected error:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      {/* <div className="rec-nav">
        <div>
          <img src={logo} className="logo" alt="aasiyan-logo" />
        </div>
        <div>
          <h1 className="logo-title">Aasiyan</h1>
        </div>
      </div> */}
      <button
        className="btn btn-primary"
        onClick={handleLogout}
        style={{ position: "absolute", top: 20, right: 10 }}
      >
        Logout
      </button>
      <div className="container">
        <h1 className="title">Aasiyan Record Admin</h1>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            saveItem();
          }}
        >
          <label>
            Name <sup style={{ color: "red" }}>*</sup>
          </label>
          <br />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="input"
          />
          {errors.name && <small className="text-danger">{errors.name}</small>}
          <br />
          <br />
          <label>
            Description<sup style={{ color: "red" }}>*</sup>
          </label>
          <br />
          <textarea
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            className="input"
            rows="10"
          />
          {errors.description && (
            <small className="text-danger">{errors.description}</small>
          )}
          <br />
          <br />
          <label>
            Date<sup style={{ color: "red" }}>*</sup>
          </label>
          <br />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="input"
          />
          {errors.date && <small className="text-danger">{errors.date}</small>}
          <br />
          <br />
          <label>Video Link</label>
          <br />
          <input
            type="url"
            name="link"
            placeholder="Link"
            value={formData.link}
            onChange={handleInputChange}
            className="input"
          />
          <br />
          <br />
          <label>
            Photo<sup style={{ color: "red" }}>*</sup>
          </label>
          <br />
          <input
            type="file"
            name="image"
            id="file-data"
            className="file-input"
            onChange={handleFileChange}
          />
          {errors.image && (
            <small className="text-danger">{errors.image}</small>
          )}
          <br />
          <br />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "Save"
            )}
          </button>
        </form>

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
                <p className="record-date">
                  {item.date && formatDate(item.date)}
                </p>
                <a
                  href={item.link}
                  className="record-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Link
                </a>
                <div className="record-actions">
                  <button
                    onClick={() => editItem(item)}
                    className="btn btn-warning btn-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      "Edit"
                    )}
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="btn btn-danger btn-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecordAdmin;
