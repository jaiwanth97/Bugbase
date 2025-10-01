import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Paper, Typography, useTheme } from '@mui/material';

const KanbanBoard = ({ columns, onDragEnd }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 2 }}>
        {Object.entries(columns).map(([columnId, column]) => (
          <Paper key={columnId} sx={{ flex: '1 1 360px', minWidth: 300, maxWidth: '100%', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: isDark ? 'primary.dark' : 'primary.main', color: 'primary.contrastText' }}>
              {column.title}
            </Typography>
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{ p: 2, minHeight: 500, transition: 'background-color 120ms ease', backgroundColor: snapshot.isDraggingOver ? (isDark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.08)') : 'transparent',
                  }}
                >
                  {column.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{ p: 2, mb: 2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, borderRadius: 2,
                                boxShadow: snapshot.isDragging ? (isDark ? '0 8px 30px rgba(0,0,0,0.45)' : '0 8px 30px rgba(0,0,0,0.12)') : theme.shadows[1],
                                transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1.0)',
                                transition: 'transform 120ms ease, box-shadow 120ms ease'
                          }}
                        >
                          <Typography variant="subtitle1">{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.priority} priority
                          </Typography>
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Paper>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default KanbanBoard;
