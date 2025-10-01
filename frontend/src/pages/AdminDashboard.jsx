import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Paper, Typography, Chip, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Assignment, BugReport, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function AdminDashboard() {
  const [bugs, setBugs] = useState([]);
  const [devs, setDevs] = useState([]);
  const [selectedBug, setSelectedBug] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const { token } = useAuth();

  const fetchData = async () => {
    try {
      const bugsRes = await axios.get('http://localhost:5000/api/bugs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched bugs:', bugsRes.data); // Debug log
      setBugs(bugsRes.data || []);
      
      const devsRes = await axios.get('http://localhost:5000/api/users/developers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevs(devsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up polling for live updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const newStatus = destination.droppableId;

    try {
      await axios.put(`http://localhost:5000/api/bugs/${draggableId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchData();
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  const handleAssign = async (devId) => {
    try {
      await axios.put(`http://localhost:5000/api/bugs/${selectedBug._id}/assign`,
        { developerId: devId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setAssignDialogOpen(false);
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
      // Group bugs by developer
      groupByDev: true
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

  // Modified getBugsByDev function to include all developers
  const getBugsByDev = (bugs) => {
    const grouped = {};
    
    // Initialize groups for all developers
    devs.forEach(dev => {
      grouped[dev._id] = {
        developer: dev,
        bugs: []
      };
    });

    // Add bugs to their assigned developers
    bugs.forEach(bug => {
      if (bug.assignedTo) {
        grouped[bug.assignedTo._id].bugs.push(bug);
      }
    });

    return grouped;
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', gap: 2, p: 3 }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.entries(columns).map(([status, { title, color, bugs: columnBugs, groupByDev }]) => (
          <Paper 
            key={status}
            sx={{ 
              width: groupByDev ? 400 : 300,
              bgcolor: 'background.default',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2, bgcolor: color, color: 'white' }}>
              <Typography variant="h6">{title} ({columnBugs.length})</Typography>
            </Box>
            <Droppable droppableId={status}>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{ 
                    height: 'calc(100% - 60px)',
                    overflowY: 'auto',
                    p: 1
                  }}
                >
                  {groupByDev ? (
                    // Show bugs grouped by developer
                    <Box sx={{ width: '100%' }}>
                      {Object.values(getBugsByDev(columnBugs)).map((group) => (
                        <Box 
                          key={group.developer._id} 
                          sx={{ 
                            mb: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              p: 1.5,
                              bgcolor: 'primary.dark',
                              color: 'white',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span>{group.developer.username}</span>
                            <Chip 
                              size="small" 
                              label={`${group.bugs.length} tasks`}
                              sx={{ bgcolor: 'primary.light' }}
                            />
                          </Typography>
                          <Droppable droppableId={`${status}-${group.developer._id}`}>
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{ 
                                  minHeight: 100,
                                  p: 1
                                }}
                              >
                                {group.bugs.map((bug, index) => (
                                  <Draggable 
                                    key={bug._id} 
                                    draggableId={bug._id} 
                                    index={index}
                                  >
                                    {(provided) => (
                                      <Paper
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        sx={{
                                          p: 2,
                                          mb: 1,
                                          '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                      >
                                        <Typography variant="subtitle2">
                                          {bug.title}
                                        </Typography>
                                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                          <Chip 
                                            size="small"
                                            label={bug.priority}
                                            color={
                                              bug.priority === 'high' ? 'error' :
                                              bug.priority === 'medium' ? 'warning' : 'info'
                                            }
                                          />
                                        </Box>
                                      </Paper>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </Box>
                            )}
                          </Droppable>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    // Show regular bug cards for other columns
                    columnBugs.map((bug, index) => (
                      <Draggable 
                        key={bug._id}
                        draggableId={bug._id}
                        index={index}
                      >
                        {(provided) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              p: 2,
                              mb: 1,
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                              {bug.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
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
                                label={bug.reporter?.username || 'Unknown'}
                                variant="outlined"
                              />
                            </Box>
                            {!bug.assignedTo && (
                              <Button
                                size="small"
                                startIcon={<Assignment />}
                                onClick={() => {
                                  setSelectedBug(bug);
                                  setAssignDialogOpen(true);
                                }}
                                fullWidth
                              >
                                Assign Developer
                              </Button>
                            )}
                          </Paper>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Paper>
        ))}
      </DragDropContext>

      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Bug to Developer</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Developer</InputLabel>
            <Select label="Select Developer">
              {devs.map(dev => (
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
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminDashboard;
