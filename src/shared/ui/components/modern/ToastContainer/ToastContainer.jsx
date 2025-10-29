import { motion, AnimatePresence } from 'framer-motion';
import ModernToast from '../ModernToast';

const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ModernToast
                        key={toast.id}
                        {...toast}
                        onClose={onRemove}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
