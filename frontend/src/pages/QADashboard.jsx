import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function QADashboard() {
  const [bugs, setBugs] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchQABugs();
  }, []);

  const fetchQABugs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bugs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBugs(response.data.filter(bug => bug.status === 'qa'));
    } catch (error) {
      console.error('Error fetching bugs:', error);
    }
  };

  const handleBugReview = async (bugId, approved) => {
    try {
      await axios.put(`http://localhost:5000/api/bugs/${bugId}/status`, {
        status: approved ? 'closed' : 'inprogress'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQABugs();
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>QA Review Queue</Typography>
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
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={() => handleBugReview(bug._id, true)}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => handleBugReview(bug._id, false)}
                  >
                    Reject
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default QADashboard;
