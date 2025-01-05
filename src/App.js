import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RecordAdmin from "../src/component/RecordAdmin";
import Login from "../src/component/Login";

const App = () => (
  <Router>
    <Routes>
      <Route path="/recordadmin" element={<Login />} />
      <Route path="/recordadmin/admin" element={<RecordAdmin />} />
    </Routes>
  </Router>
);

export default App;
