import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Shop from './pages/Shop';

const router = (
  <Router>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Shop />} />
      </Route>
    </Routes>
  </Router>
);

export default router;
