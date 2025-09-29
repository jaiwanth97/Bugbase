import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function DevDashboard() {
  const [bugs, setBugs] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchAssignedBugs();
  }, []);

  const fetchAssignedBugs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bugs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBugs(response.data);
    } catch (error) {
      console.error('Error fetching bugs:', error);
    }
  };

  const updateBugStatus = async (bugId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/bugs/${bugId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAssignedBugs();
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>My Assigned Bugs</Typography>
      <Grid container spacing={3}>
        {bugs.map((bug) => (
          <Grid item xs={12} md={6} key={bug._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{bug.title}</Typography>
                <Typography color="textSecondary">{bug.description}</Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Chip label={bug.priority} color="primary" />
                  <Chip label={bug.status} color="secondary" />
                </Box>
                <Box sx={{ mt: 2 }}>
                  {bug.status === 'inprogress' && (
                    <Button 
                      variant="contained" 
                      onClick={() => updateBugStatus(bug._id, 'qa')}
                    >
                      Submit for QA
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default DevDashboard;
