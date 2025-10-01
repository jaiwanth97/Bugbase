import { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Button } from '@mui/material';
import KanbanBoard from '../components/KanbanBoard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

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

  const stats = useMemo(() => ({
    open: columns.open.items.length,
    inProgress: columns.inProgress.items.length,
    qa: columns.qa.items.length,
    closed: columns.closed.items.length,
  }), [columns]);

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Bug Tracking Dashboard"
        subtitle={`Welcome ${user?.username} · Role: ${user?.role}`}
        actions={<Button variant="contained">New Bug</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Open" value={stats.open} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="In Progress" value={stats.inProgress} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="QA Review" value={stats.qa} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Closed" value={stats.closed} /></Grid>
      </Grid>

      <KanbanBoard columns={columns} onDragEnd={onDragEnd} />
    </Box>
  );
}

export default Dashboard;
