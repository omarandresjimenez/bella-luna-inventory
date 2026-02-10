import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface MotionWrapperProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    delay?: number;
}

export const MotionWrapper = ({ children, delay = 0, ...props }: MotionWrapperProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.8,
                delay: delay,
                ease: [0.16, 1, 0.3, 1],
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};
