import React from 'react';
import { RequestStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileCheck, 
  Download, 
  ArrowRightCircle,
  HelpCircle
} from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showIcon = true }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'SUBMITTED':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
          icon: Clock,
          label: 'Submitted',
        };
      case 'UNDER_FACULTY_REVIEW':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-500',
          icon: Clock,
          label: 'Under Faculty Review',
        };
      case 'FACULTY_APPROVED':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-500',
          icon: CheckCircle2,
          label: 'Faculty Approved',
        };
      case 'FACULTY_REJECTED':
      case 'HOD_REJECTED':
      case 'CANCELLED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          dot: 'bg-rose-500',
          icon: XCircle,
          label: status === 'CANCELLED' ? 'Cancelled' : 'Rejected',
        };
      case 'UNDER_HOD_REVIEW':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
          dot: 'bg-purple-500',
          icon: Clock,
          label: 'Under HOD Review',
        };
      case 'HOD_APPROVED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
          label: 'HOD Approved',
        };
      case 'UNDER_OFFICE_PROCESSING':
        return {
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
          dot: 'bg-cyan-500',
          icon: ArrowRightCircle,
          label: 'Office Processing',
        };
      case 'DOCUMENT_GENERATED':
      case 'READY_FOR_DOWNLOAD':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
          dot: 'bg-emerald-600',
          icon: Download,
          label: 'Ready for Download',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-600',
          icon: FileCheck,
          label: 'Completed',
        };
      case 'CORRECTION_REQUIRED':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200/80',
          dot: 'bg-orange-500',
          icon: AlertCircle,
          label: 'Correction Required',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: HelpCircle,
          label: status.replace(/_/g, ' '),
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
