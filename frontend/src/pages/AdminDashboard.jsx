import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Paper, Typography, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, FormControl, InputLabel, Grid, Tabs, Tab, Breadcrumbs, Link } from '@mui/material';
import { Assignment, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

function AdminDashboard() {
  const [bugs, setBugs] = useState([]);
  const [devs, setDevs] = useState([]);
  const [selectedBug, setSelectedBug] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const { token } = useAuth();

  const fetchData = async () => {
    try {
      const [bugsRes, devsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/bugs', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/users/developers', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setBugs(bugsRes.data || []);
      setDevs(devsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const idOf = (maybeObjOrId) => {
    if (!maybeObjOrId) return null;
    if (typeof maybeObjOrId === 'string') return maybeObjOrId;
    if (maybeObjOrId._id) return String(maybeObjOrId._id);
    return String(maybeObjOrId);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { destination, draggableId } = result;

    // assign to developer if dropped in a dev droppable
    if (destination.droppableId.startsWith('dev-')) {
      const devId = destination.droppableId.replace('dev-', '');
      try {
        await axios.put(`http://localhost:5000/api/bugs/${draggableId}/assign`,
          { developerId: devId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchData();
      } catch (error) {
        console.error('Error assigning bug:', error);
      }
      return;
    }

    // change status if dropped into a status column
    const newStatus = destination.droppableId;
    try {
      await axios.put(`http://localhost:5000/api/bugs/${draggableId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  const handleAssign = async (devId) => {
    if (!selectedBug) return;
    try {
      await axios.put(`http://localhost:5000/api/bugs/${selectedBug._id}/assign`,
        { developerId: devId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignDialogOpen(false);
      setSelectedBug(null);
      fetchData();
    } catch (error) {
      console.error('Error assigning bug:', error);
    }
  };

  const columns = {
    open: {
      title: 'Open',
      color: '#ff9800',
      bugs: bugs.filter(bug => !bug.status || bug.status === 'open')
    },
    inprogress: {
      title: 'In Progress',
      color: '#2196f3',
      bugs: bugs.filter(bug => bug.status === 'inprogress'),
      showDevs: true
    },
    qa: {
      title: 'QA Review',
      color: '#9c27b0',
      bugs: bugs.filter(bug => bug.status === 'qa')
    },
    closed: {
      title: 'Closed',
      color: '#4caf50',
      bugs: bugs.filter(bug => bug.status === 'closed')
    }
  };

  const renderBugCard = (bug, index) => (
    <Draggable key={String(bug._id)} draggableId={String(bug._id)} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{ p: 2, mb: 1, border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 2,
                boxShadow: snapshot.isDragging ? (t) => t.shadows[8] : (t) => t.shadows[1],
                transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1.0)',
                transition: 'transform 120ms ease, box-shadow 120ms ease',
                '&:hover': { bgcolor: 'action.hover' } }}
        >
          <Typography variant="subtitle1">{bug.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {bug.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip
              size="small"
              label={`Priority: ${bug.priority}`}
              color={
                bug.priority === 'high' ? 'error' :
                bug.priority === 'medium' ? 'warning' : 'info'
              }
            />
            <Chip
              size="small"
              icon={<Person />}
              label={bug.assignedTo?.username || bug.reporter?.username || 'Unknown'}
              variant="outlined"
            />
          </Box>
          {!bug.assignedTo && (
            <Button
              size="small"
              startIcon={<Assignment />}
              onClick={() => { setSelectedBug(bug); setAssignDialogOpen(true); }}
              fullWidth
            >
              Assign Developer
            </Button>
          )}
        </Paper>
      )}
    </Draggable>
  );

  const [tab, setTab] = useState(0);
  const stats = useMemo(() => ({
    total: bugs.length,
    open: bugs.filter(b => !b.status || b.status === 'open').length,
    inprogress: bugs.filter(b => b.status === 'inprogress').length,
    qa: bugs.filter(b => b.status === 'qa').length,
    closed: bugs.filter(b => b.status === 'closed').length,
  }), [bugs]);

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Admin Dashboard" subtitle="Manage bugs and assignments" />
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit">Home</Link>
        <Typography color="text.primary">Admin</Typography>
      </Breadcrumbs>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label="Board" />
      </Tabs>

      {tab === 0 && (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total" value={stats.total} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Open" value={stats.open} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="In Progress" value={stats.inprogress} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Closed" value={stats.closed} /></Grid>
      </Grid>
      )}

      {tab === 1 && (
      <Box sx={{ minHeight: 'calc(100vh - 220px)', display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.entries(columns).map(([status, { title, color, bugs: columnBugs, showDevs }]) => (
          <Paper
            key={status}
            sx={{
              flex: '1 1 360px',
              minWidth: showDevs ? 420 : 320,
                bgcolor: 'background.paper',
              borderRadius: 2,
              overflow: 'hidden',
              border: (t) => `1px solid ${t.palette.divider}`
            }}
          >
            <Box sx={{ p: 2, bgcolor: color, color: 'white' }}>
              <Typography variant="h6">{title} ({columnBugs.length})</Typography>
            </Box>

            {showDevs ? (
              <Box sx={{ p: 1 }}>
                {devs.map((dev) => {
                  const devIdStr = String(dev._id);
                  const devBugs = columnBugs.filter(bug => 
                    bug.assignedTo && String(bug.assignedTo._id) === devIdStr
                  );
                  return (
                    <Paper key={devIdStr} sx={{ mb: 2, bgcolor: 'background.paper' }}>
                      <Box sx={{ p: 1, bgcolor: 'primary.dark', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">{dev.username}</Typography>
                        <Chip size="small" label={`${devBugs.length} tasks`} sx={{ bgcolor: 'primary.light' }} />
                      </Box>
                      <Droppable droppableId={`dev-${devIdStr}`}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{ p: 1, minHeight: 80 }}
                          >
                            {devBugs.map((bug, index) => renderBugCard(bug, index))}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </Paper>
                  );
                })}
              </Box>
            ) : (
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ height: 'calc(100% - 60px)', overflowY: 'auto', p: 1,
                          backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                          transition: 'background-color 120ms ease' }}
                  >
                    {columnBugs.map((bug, index) => renderBugCard(bug, index))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            )}
          </Paper>
        ))}
      </DragDropContext>
      </Box>
      )}

      <Dialog open={assignDialogOpen} onClose={() => { setAssignDialogOpen(false); setSelectedBug(null); }}>
        <DialogTitle>Assign Bug to Developer</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Developer</InputLabel>
            <Select
              label="Select Developer"
              value=""
            >
              {devs.map((dev) => (
                <MenuItem
                  key={dev._id}
                  value={dev._id}
                  onClick={() => handleAssign(dev._id)}
                >
                  {dev.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAssignDialogOpen(false); setSelectedBug(null); }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminDashboard;