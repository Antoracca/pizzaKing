import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

type Props = {
  type: AlertType;
  message: string;
  show: boolean;
};

const alertConfig = {
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    iconColor: 'text-green-500',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    iconColor: 'text-orange-500',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
};

export default function AuthAlert({ type, message, show }: Props) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {show && message && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`flex items-start gap-3 rounded-xl border ${config.border} ${config.bg} p-4 shadow-sm`}
        >
          <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
          <p className={`flex-1 text-sm font-medium ${config.text}`}>
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
