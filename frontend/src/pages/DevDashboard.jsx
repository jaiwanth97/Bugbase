import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, Grid, Skeleton, Alert } from '@mui/material';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function DevDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchTasks = async () => {
    try {
      setError('');
      const response = await axios.get('http://localhost:5000/api/bugs/assigned', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
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
      <PageHeader title="My Tasks" subtitle="Work assigned to you" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!loading && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}><StatCard label="In Progress" value={tasks.filter(t => t.status === 'inprogress').length} /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard label="Awaiting QA" value={tasks.filter(t => t.status === 'qa').length} /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard label="Total" value={tasks.length} /></Grid>
        </Grid>
      )}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={140} />
            </Grid>
          ))}
        </Grid>
      ) : tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
          <Typography>No assigned tasks yet.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item xs={12} md={6} key={task._id}>
              <Card sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{task.title}</Typography>
                  <Typography color="text.secondary" paragraph>
                    {task.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={task.priority} color="primary" variant="outlined" />
                    <Chip label={task.status} color="secondary" variant="outlined" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={() => handleStatusUpdate(task._id, 'qa')}
                      disabled={!(task.status === 'inprogress' || task.status === 'inProgress')}
                    >
                      Submit for QA
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default DevDashboard;
