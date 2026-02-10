import { Box, styled } from '@mui/material';
import type { BoxProps } from '@mui/material';

const GlassBox = styled(Box)(({ theme }) => ({
    background: 'hsla(0, 0%, 100%, 0.7)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRadius: theme.shape.borderRadius,
    border: '1px solid hsla(0, 0%, 100%, 0.4)',
    boxShadow: '0 8px 32px 0 hsla(222, 47%, 11%, 0.05)',
}));

interface GlassContainerProps extends BoxProps {
    children: React.ReactNode;
}

export const GlassContainer = ({ children, ...props }: GlassContainerProps) => {
    return <GlassBox {...props}>{children}</GlassBox>;
};
