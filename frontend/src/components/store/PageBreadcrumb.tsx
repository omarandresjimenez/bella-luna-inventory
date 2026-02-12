import { Breadcrumbs, Link, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  sx?: SxProps<Theme>;
}

export default function PageBreadcrumb({ items, showBackButton = true, sx }: PageBreadcrumbProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: { xs: 2, md: 4 }, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, flexWrap: 'wrap' }}>
        {showBackButton && (
          <Link
            component="button"
            onClick={() => navigate(-1)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'text.secondary',
              textDecoration: 'none',
              cursor: 'pointer',
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              background: 'none',
              border: 'none',
              padding: 0,
              flexShrink: 0,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
            Volver
          </Link>
        )}
        
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ 
            flex: 1,
            '& .MuiBreadcrumbs-ol': {
              flexWrap: 'nowrap',
            },
          }}
        >
          <Link
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              textDecoration: 'none',
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: { xs: 16, md: 18 } }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Inicio</Box>
          </Link>
          
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            // On mobile, don't show the last item (product name) as it's too long
            if (isMobile && isLast) {
              return null;
            }
            
            return isLast || !item.href ? (
              <Typography
                key={index}
                color="text.primary"
                sx={{ 
                  fontWeight: 500, 
                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: '150px', sm: '200px', md: '300px' },
                }}
              >
                {item.label}
              </Typography>
            ) : (
              <Link
                key={index}
                component={RouterLink}
                to={item.href}
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: '120px', sm: '150px', md: '200px' },
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>
    </Box>
  );
}
