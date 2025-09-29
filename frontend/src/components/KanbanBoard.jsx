import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Paper, Typography } from '@mui/material';

const KanbanBoard = ({ columns, onDragEnd }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ display: 'flex', gap: 2, p: 2, overflowX: 'auto' }}>
        {Object.entries(columns).map(([columnId, column]) => (
          <Paper key={columnId} sx={{ minWidth: 280, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#e0e0e0' }}>
              {column.title}
            </Typography>
            <Droppable droppableId={columnId}>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{ p: 2, minHeight: 500 }}
                >
                  {column.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{ p: 2, mb: 2, bgcolor: 'white' }}
                        >
                          <Typography variant="subtitle1">{item.title}</Typography>
                          <Typography variant="body2" color="textSecondary">
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
