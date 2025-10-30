'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type AlertMessageVariant = 'default' | 'error' | 'warning' | 'success' | 'info';

interface AlertMessageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  variant?: AlertMessageVariant;
}

const VARIANT_CONFIG: Record<
  AlertMessageVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    iconBg: string;
  }
> = {
  default: {
    icon: Info,
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-100',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
};

export function AlertMessage({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'OK',
  variant = 'default',
}: AlertMessageProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.iconBg}`}>
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
              <AlertDialogDescription className="text-left mt-2">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook to use alert message
 */
export function useAlertMessage() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Omit<AlertMessageProps, 'open' | 'onOpenChange'>>({
    title: '',
    description: '',
  });

  const alert = (props: Omit<AlertMessageProps, 'open' | 'onOpenChange'>) => {
    setConfig(props);
    setIsOpen(true);
  };

  const AlertMessageComponent = () => (
    <AlertMessage {...config} open={isOpen} onOpenChange={setIsOpen} />
  );

  return { alert, AlertMessage: AlertMessageComponent };
}
