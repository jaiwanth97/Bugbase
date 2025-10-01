import { Box, Typography, Stack } from '@mui/material';

function PageHeader({ title, subtitle, actions }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actions}
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default PageHeader;


