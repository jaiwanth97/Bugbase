import { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Box, MenuItem, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function UserDashboard() {
  const { token } = useAuth();
  const [bug, setBug] = useState({ title: '', description: '', priority: 'low' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/bugs', bug, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Bug reported successfully!' });
      setBug({ title: '', description: '', priority: 'low' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to report bug' });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Report a Bug
      </Typography>
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              value={bug.title}
              onChange={(e) => setBug({ ...bug, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={bug.description}
              onChange={(e) => setBug({ ...bug, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              select
              fullWidth
              label="Priority"
              value={bug.priority}
              onChange={(e) => setBug({ ...bug, priority: e.target.value })}
              margin="normal"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Submit Bug Report
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserDashboard;
