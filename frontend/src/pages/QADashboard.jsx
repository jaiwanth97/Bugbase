import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, Grid, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function QADashboard() {
  const [bugs, setBugs] = useState([]);
  const [message, setMessage] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    const response = await axios.get('http://localhost:5000/api/bugs/qa', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBugs(response.data);
  };

  const handleReview = async (bugId, approved) => {
    try {
      await axios.put(`http://localhost:5000/api/bugs/${bugId}/status`,
        { status: approved ? 'closed' : 'inprogress' },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setMessage(`Bug ${approved ? 'approved' : 'rejected'} successfully`);
      fetchBugs();
    } catch (error) {
      setMessage('Error updating bug status');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>QA Review</Typography>
      {message && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      <Grid container spacing={3}>
        {bugs.map(bug => (
          <Grid item xs={12} md={6} key={bug._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{bug.title}</Typography>
                <Typography color="textSecondary" paragraph>
                  {bug.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={bug.priority} color="primary" />
                  <Chip label={bug.status} color="secondary" />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleReview(bug._id, true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleReview(bug._id, false)}
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
