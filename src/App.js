import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/login';
import Signup from './components/Signup';
import ProfilePage from './components/ProfilePage';
import ProjectDetails from './components/PrjDt';
import ImportSuccess from './components/importSucc';
import Graphs from './components/graphs';
import Processing from './components/processing';
import Models from './components/models';
import PrivateRoute from './components/PrivateRoute';
import Description from './components/description';
import Test from './components/test';
import Historique from './components/historique';
import Result from './components/resultat';
import Deployment from './components/deployment';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/project/:id/:name" element={<ProjectDetails />} />
            <Route path="/importSucc/:id" element={<ImportSuccess />} />
            <Route path="/graphs/:id/:targetFeature" element={<Graphs />} />
            <Route path="/models/:id/:targetFeature" element={<Models />} />
            <Route path="/processing/:id/:targetFeature" element={<Processing />} />
            <Route path="/description/:id/:targetFeature" element={<Description />} />
            <Route path="/test/:id/:model" element={<Test />} />
            <Route path="/models/:id/:targetFeature/:fileData" element={<Models />} />
            <Route path="/models/:id" element={<Models />} />
            <Route path="/historique/:id" element={<Historique />} />
            <Route path="/deployment/:id" element={<Deployment />} />
            <Route path="/deployment/:id/:targetFeature" element={<Deployment />} />

            <Route path="/description/:id" element={<Description />} />
            <Route path="/processing/:id" element={<Processing />} />
            <Route path="/historique/:id/:targetFeature" element={<Historique />} />
            <Route path="/resultat/:id" element={<Result />} />
            <Route path="/processing/:id/:targetFeature/:fileData" element={<Processing />} />

          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
