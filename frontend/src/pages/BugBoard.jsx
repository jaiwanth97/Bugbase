import { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import KanbanBoard from '../components/KanbanBoard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function BugBoard() {
  const [bugs, setBugs] = useState([]);
  const { token } = useAuth();

  const fetchBugs = async () => {
    try {
      const response = await axios.get('https://bugbase.onrender.com/api/bugs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBugs(response.data);
    } catch (error) {
      console.error('Error fetching bugs:', error);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  const columns = {
    open: {
      title: 'Open',
      items: bugs.filter(bug => bug.status === 'open')
    },
    inprogress: {
      title: 'In Progress',
      items: bugs.filter(bug => bug.status === 'inprogress')
    },
    qa: {
      title: 'QA Review',
      items: bugs.filter(bug => bug.status === 'qa')
    },
    closed: {
      title: 'Closed',
      items: bugs.filter(bug => bug.status === 'closed')
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const bugId = result.draggableId;
    const newStatus = result.destination.droppableId;

    try {
      await axios.put(`https://bugbase.onrender.com/api/bugs/${bugId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchBugs();
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Bug Board</Typography>
      <KanbanBoard columns={columns} onDragEnd={handleDragEnd} />
    </Box>
  );
}

export default BugBoard;
