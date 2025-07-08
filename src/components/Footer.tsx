import { Box, Typography } from '@mui/material';
import theme from '../styles/theme';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 3,
        px: 2,
        backgroundColor: theme.colors.primary,
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} FlatFinder. Todos os direitos reservados.
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.8 }}>
        Desenvolvido como projeto académico.
      </Typography>
    </Box>
  );
};

export default Footer;
