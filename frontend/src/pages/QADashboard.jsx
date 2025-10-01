import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, Grid, Alert, Skeleton } from '@mui/material';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function QADashboard() {
  const [bugs, setBugs] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetchBugs();
    const interval = setInterval(fetchBugs, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchBugs = async () => {
    try {
      setError('');
      const response = await axios.get('http://localhost:5000/api/bugs/qa/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBugs(response.data);
    } catch (e) {
      setError('Failed to load QA tickets');
    } finally {
      setLoading(false);
    }
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
      <PageHeader title="QA Review" subtitle="Evaluate tickets submitted by developers" />
      {message && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={140} />
            </Grid>
          ))}
        </Grid>
      ) : bugs.length === 0 ? (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
          <Typography>No tickets awaiting QA.</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}><StatCard label="Awaiting QA" value={bugs.length} /></Grid>
          </Grid>
          <Grid container spacing={3}>
          {bugs.map(bug => (
            <Grid item xs={12} md={6} key={bug._id}>
              <Card sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{bug.title}</Typography>
                  <Typography color="text.secondary" paragraph>
                    {bug.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={bug.priority} color="primary" variant="outlined" />
                    <Chip label={bug.status} color="secondary" variant="outlined" />
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
        </>
      )}
    </Box>
  );
}

export default QADashboard;
