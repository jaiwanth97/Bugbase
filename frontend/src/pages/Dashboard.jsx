import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import KanbanBoard from '../components/KanbanBoard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [columns, setColumns] = useState({
    open: { title: 'Open', items: [] },
    inProgress: { title: 'In Progress', items: [] },
    qa: { title: 'QA Review', items: [] },
    closed: { title: 'Closed', items: [] }
  });

  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bugs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newColumns = {
        open: { title: 'Open', items: [] },
        inProgress: { title: 'In Progress', items: [] },
        qa: { title: 'QA Review', items: [] },
        closed: { title: 'Closed', items: [] }
      };

      response.data.forEach(bug => {
        const column = bug.status === 'inprogress' ? 'inProgress' : bug.status;
        if (newColumns[column]) {
          newColumns[column].items.push(bug);
        }
      });

      setColumns(newColumns);
    } catch (error) {
      console.error('Error fetching bugs:', error);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/bugs/${draggableId}/status`, {
        status: destination.droppableId === 'inProgress' ? 'inprogress' : destination.droppableId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchBugs();
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Bug Tracking Dashboard</Typography>
      <Typography variant="h6" sx={{ mb: 3 }}>Welcome {user?.username}</Typography>
      <Typography variant="subtitle1" sx={{ mb: 3 }}>Role: {user?.role}</Typography>
      <KanbanBoard columns={columns} onDragEnd={onDragEnd} />
    </Box>
  );
}

export default Dashboard;
