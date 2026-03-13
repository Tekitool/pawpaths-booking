// lib/animations.ts

export const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 20,
            stiffness: 50,
            duration: 1.2
        }
    }
};

export const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
        }
    }
};

export const floatAnimation = (delay: number = 0): any => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: [0, -15, 0],
        transition: {
            opacity: { duration: 1, delay },
            y: {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut",
                delay
            }
        }
    }
});

export const scaleIn: any = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 60,
            duration: 1.5
        }
    }
};
