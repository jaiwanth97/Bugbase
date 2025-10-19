import { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Box, MenuItem, Alert, Grid, FormControlLabel, Checkbox } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function UserDashboard() {
  const { token } = useAuth();
  const [bug, setBug] = useState({
    title: '',
    description: '',
    steps: '',
    expected: '',
    actual: '',
    environmentOs: 'Windows',
    environmentBrowser: 'Chrome',
    priority: 'low',
    severity: 'minor',
    category: 'UI',
    tags: '',
    reproducible: true,
    frequency: 'always'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const composedDescription = [
        bug.description && `Summary:\n${bug.description}`,
        (bug.steps || bug.expected || bug.actual) && '---',
        bug.steps && `Steps to Reproduce:\n${bug.steps}`,
        bug.expected && `Expected Result:\n${bug.expected}`,
        bug.actual && `Actual Result:\n${bug.actual}`,
        '---',
        `Environment:\nOS: ${bug.environmentOs}\nBrowser: ${bug.environmentBrowser}`,
        `Reproducible: ${bug.reproducible ? 'Yes' : 'No'} (${bug.frequency})`,
        `Category: ${bug.category}`,
        bug.tags && `Tags: ${bug.tags}`,
        `Severity: ${bug.severity}`
      ]
        .filter(Boolean)
        .join('\n');

      await axios.post('https://bugbase.onrender.com/api/bugs', {
        title: bug.title,
        description: composedDescription,
        priority: bug.priority
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Bug reported successfully!' });
      setBug({
        title: '',
        description: '',
        steps: '',
        expected: '',
        actual: '',
        environmentOs: 'Windows',
        environmentBrowser: 'Chrome',
        priority: 'low',
        severity: 'minor',
        category: 'UI',
        tags: '',
        reproducible: true,
        frequency: 'always'
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to report bug' });
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <PageHeader title="Report a Bug" subtitle="Provide details to help us reproduce and fix it" />
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={bug.title}
                  onChange={(e) => setBug({ ...bug, title: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Category"
                  select
                  value={bug.category}
                  onChange={(e) => setBug({ ...bug, category: e.target.value })}
                  margin="normal"
                >
                  <MenuItem value="UI">UI</MenuItem>
                  <MenuItem value="Backend">Backend</MenuItem>
                  <MenuItem value="Performance">Performance</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Priority"
                  select
                  value={bug.priority}
                  onChange={(e) => setBug({ ...bug, priority: e.target.value })}
                  margin="normal"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Severity"
                  select
                  value={bug.severity}
                  onChange={(e) => setBug({ ...bug, severity: e.target.value })}
                  margin="normal"
                >
                  <MenuItem value="minor">Minor</MenuItem>
                  <MenuItem value="major">Major</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  value={bug.tags}
                  onChange={(e) => setBug({ ...bug, tags: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Short summary"
                  value={bug.description}
                  onChange={(e) => setBug({ ...bug, description: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Steps to reproduce"
                  value={bug.steps}
                  onChange={(e) => setBug({ ...bug, steps: e.target.value })}
                  margin="normal"
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expected result"
                  value={bug.expected}
                  onChange={(e) => setBug({ ...bug, expected: e.target.value })}
                  margin="normal"
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Actual result"
                  value={bug.actual}
                  onChange={(e) => setBug({ ...bug, actual: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Operating System"
                  select
                  value={bug.environmentOs}
                  onChange={(e) => setBug({ ...bug, environmentOs: e.target.value })}
                  margin="normal"
                >
                  <MenuItem value="Windows">Windows</MenuItem>
                  <MenuItem value="macOS">macOS</MenuItem>
                  <MenuItem value="Linux">Linux</MenuItem>
                  <MenuItem value="Android">Android</MenuItem>
                  <MenuItem value="iOS">iOS</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Browser"
                  select
                  value={bug.environmentBrowser}
                  onChange={(e) => setBug({ ...bug, environmentBrowser: e.target.value })}
                  margin="normal"
                >
                  <MenuItem value="Chrome">Chrome</MenuItem>
                  <MenuItem value="Firefox">Firefox</MenuItem>
                  <MenuItem value="Edge">Edge</MenuItem>
                  <MenuItem value="Safari">Safari</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bug.reproducible}
                      onChange={(e) => setBug({ ...bug, reproducible: e.target.checked })}
                    />
                  }
                  label="Reproducible"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Frequency"
                  select
                  value={bug.frequency}
                  onChange={(e) => setBug({ ...bug, frequency: e.target.value })}
                  margin="normal"
                >
                  <MenuItem value="always">Always</MenuItem>
                  <MenuItem value="often">Often</MenuItem>
                  <MenuItem value="sometimes">Sometimes</MenuItem>
                  <MenuItem value="rarely">Rarely</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Submit Bug Report
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserDashboard;
