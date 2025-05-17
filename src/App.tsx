import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layout } from 'antd';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import CloudDrive from './pages/CloudDrive';
import KnowledgeBase from './pages/KnowledgeBase';
import KnowledgeDetail from './pages/KnowledgeDetail';
import Agent from './pages/Agent';
import AgentDetail from './pages/AgentDetail';
import AgentChat from './pages/AgentChat';
import ModelService from './pages/ModelService';
import { RootState } from './store';

const App: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        
        <Route path="/chat/:agent_id/:conv_id?" element={isAuthenticated ? <AgentChat /> : <Navigate to="/login" />} />
        
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/cloud-drive" replace />} />
          <Route path="cloud-drive/*" element={<CloudDrive />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          <Route path="knowledge-base/:id" element={<KnowledgeDetail />} />
          <Route path="agent" element={<Agent />} />
          <Route path="agent/:id" element={<AgentDetail />} />
          <Route path="model-service" element={<ModelService />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
