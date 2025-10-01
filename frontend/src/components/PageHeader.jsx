import { Box, Typography, Stack, useTheme } from '@mui/material';

function PageHeader({ title, subtitle, actions }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{ mb: 3, p: 3, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}`,
               background: isDark
                 ? 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(124,58,237,0.14))'
                 : 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.06))' }}>
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


