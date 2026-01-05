import { create } from 'zustand';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 1000000;

let count = 0;

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}

export const useToastStore = create((set, get) => ({
    toasts: [],
    toast: ({ title, description, variant = 'default', duration = 5000 }) => {
        const id = genId();

        const update = (props) =>
            set((state) => ({
                toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...props } : t)),
            }));

        const dismiss = () => set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));

        set((state) => {
            const newToast = {
                id,
                title,
                description,
                variant,
                open: true,
                onOpenChange: (open) => {
                    if (!open) dismiss();
                },
            };
            return {
                toasts: [newToast, ...state.toasts].slice(0, TOAST_LIMIT),
            };
        });

        if (duration !== Infinity) {
            setTimeout(() => {
                dismiss();
            }, duration)
        }

        return {
            id,
            dismiss,
            update,
        };
    },
    dismiss: (toastId) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== toastId),
    })),
}));

export const toast = (props) => useToastStore.getState().toast(props);
