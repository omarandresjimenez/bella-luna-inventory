import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
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
}

export default function PageBreadcrumb({ items, showBackButton = true }: PageBreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
              fontSize: '0.875rem',
              background: 'none',
              border: 'none',
              padding: 0,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
            Volver
          </Link>
        )}
        
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ flex: 1 }}
        >
          <Link
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Inicio
          </Link>
          
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return isLast || !item.href ? (
              <Typography
                key={index}
                color="text.primary"
                sx={{ fontWeight: 500 }}
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
