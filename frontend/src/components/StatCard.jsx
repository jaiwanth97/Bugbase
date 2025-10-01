import { Card, CardContent, Typography, Box } from '@mui/material';

function StatCard({ label, value, icon, color = 'primary' }) {
  return (
    <Card sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="overline" color="text.secondary">{label}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
          </Box>
          {icon && (
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: (t) => t.palette[color].main + '20', color: `${color}.main` }}>
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatCard;


