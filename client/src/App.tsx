import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Editor from "./pages/Editor";
import Simulate from "./pages/Simulate";
import ExportPage from "./pages/Export";
import Source from "./pages/Source";
import Templates from "./pages/Templates";
import Analytics from "./pages/Analytics";
import ShareView from "./pages/ShareView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/share/:token" element={<ShareView />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/simulate" element={<Simulate />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/source" element={<Source />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
