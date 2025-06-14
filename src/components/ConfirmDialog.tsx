import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, CheckCircle, Info, XCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'danger'
}: ConfirmDialogProps) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: Trash2,
          iconBg: 'bg-gradient-to-r from-red-100 to-red-200',
          iconColor: 'text-red-600',
          confirmButton: 'btn-delete',
          titleColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-gradient-to-r from-yellow-100 to-yellow-200',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5',
          titleColor: 'text-yellow-800'
        };
      case 'info':
        return {
          icon: Info,
          iconBg: 'bg-gradient-to-r from-blue-100 to-blue-200',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5',
          titleColor: 'text-blue-800'
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconBg: 'bg-gradient-to-r from-bank-green-100 to-bank-green-200',
          iconColor: 'text-bank-green-600',
          confirmButton: 'btn-primary',
          titleColor: 'text-bank-green-800'
        };
      default:
        return {
          icon: AlertTriangle,
          iconBg: 'bg-gradient-to-r from-gray-100 to-gray-200',
          iconColor: 'text-gray-600',
          confirmButton: 'btn-primary',
          titleColor: 'text-gray-800'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center">
            <div className={`w-full h-full ${config.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
              <Icon className={`w-8 h-8 ${config.iconColor}`} />
            </div>
          </div>
          <div className="space-y-2">
            <DialogTitle className={`text-xl font-bold ${config.titleColor}`}>
              {title}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 font-medium py-2.5 px-6 rounded-lg transition-all duration-300"
          >
            {cancelText}
          </Button>
          <Button 
            type="button" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full sm:w-auto order-1 sm:order-2 ${config.confirmButton}`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
