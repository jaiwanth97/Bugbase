import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function DevDashboard() {
  const [tasks, setTasks] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bugs/assigned', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleStatusUpdate = async (bugId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/bugs/${bugId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>My Tasks</Typography>
      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} md={6} key={task._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{task.title}</Typography>
                <Typography color="textSecondary" paragraph>
                  {task.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={task.priority} color="primary" />
                  <Chip label={task.status} color="secondary" />
                </Box>
                {task.status === 'inprogress' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleStatusUpdate(task._id, 'qa')}
                  >
                    Submit for QA
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default DevDashboard;
