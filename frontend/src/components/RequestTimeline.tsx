import React from 'react';
import { RequestItem } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Sparkles,
  Download,
  Calendar,
  UserCheck
} from 'lucide-react';

interface RequestTimelineProps {
  request: RequestItem;
}

export const RequestTimeline: React.FC<RequestTimelineProps> = ({ request }) => {
  const workflows = request.documentType.workflows || [];
  const approvals = request.approvals || [];
  const hasGeneratedDoc = !!request.generatedDocument;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Verification & Approval Lifecycle
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage progression for Request #{request.requestNumber}
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-brand-50 text-brand-700 rounded-lg border border-brand-200/60">
          Estimated: {request.documentType.estimatedDays} Business Days
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {/* Initial Submission Step */}
        <div className="relative flex items-start group">
          <div className="absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 w-full ml-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">Request Submitted by Student</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(request.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Purpose: <span className="text-slate-800 font-medium">"{request.purpose}"</span>
            </p>
          </div>
        </div>

        {/* Dynamic Workflow Stages */}
        {workflows.map((stage, idx) => {
          const approvalRecord = approvals.find((a) => a.stageOrder === stage.stageOrder);
          const isPassed = request.currentStageOrder > stage.stageOrder || request.status === 'READY_FOR_DOWNLOAD' || request.status === 'COMPLETED';
          const isCurrent = request.currentStageOrder === stage.stageOrder && !request.status.includes('REJECTED') && request.status !== 'READY_FOR_DOWNLOAD' && request.status !== 'COMPLETED';
          const isRejected = (request.status === 'FACULTY_REJECTED' && stage.roleRequired === 'FACULTY') || 
                             (request.status === 'HOD_REJECTED' && stage.roleRequired === 'HOD');

          let iconBg = 'bg-slate-200 text-slate-500';
          let IconComp = Clock;
          if (isPassed || (approvalRecord && approvalRecord.action === 'APPROVED')) {
            iconBg = 'bg-emerald-500 text-white';
            IconComp = CheckCircle2;
          } else if (isCurrent) {
            iconBg = 'bg-blue-600 text-white animate-pulse';
            IconComp = Clock;
          } else if (isRejected) {
            iconBg = 'bg-rose-500 text-white';
            IconComp = XCircle;
          }

          return (
            <div key={stage.id} className="relative flex items-start group">
              <div className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full ${iconBg} flex items-center justify-center ring-4 ring-white shadow-sm`}>
                <IconComp className="w-4 h-4" />
              </div>
              <div
                className={`border rounded-xl p-4 w-full ml-2 transition-all ${
                  isCurrent
                    ? 'bg-blue-50/50 border-blue-200 shadow-sm ring-1 ring-blue-100'
                    : isRejected
                    ? 'bg-rose-50/50 border-rose-200'
                    : isPassed
                    ? 'bg-white border-slate-200/90'
                    : 'bg-slate-50/50 border-slate-200/60 opacity-70'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      Stage {stage.stageOrder}: {stage.stageName}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {stage.roleRequired}
                    </span>
                  </div>
                  {approvalRecord && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(approvalRecord.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1">{stage.description}</p>

                {approvalRecord && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                      <span>{approvalRecord.approver.name} ({approvalRecord.role})</span>
                      <span className={`ml-auto font-semibold px-2 py-0.5 rounded ${
                        approvalRecord.action === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {approvalRecord.action}
                      </span>
                    </div>
                    {approvalRecord.remarks && (
                      <p className="mt-1.5 p-2 bg-slate-50 rounded-lg text-slate-700 italic border border-slate-100">
                        "{approvalRecord.remarks}"
                      </p>
                    )}
                  </div>
                )}

                {isCurrent && !approvalRecord && (
                  <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-100/60 px-2.5 py-1.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    Pending review by {stage.roleRequired}...
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Final Document Generated & Ready Step */}
        <div className="relative flex items-start group">
          <div
            className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full ${
              hasGeneratedDoc ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
            } flex items-center justify-center ring-4 ring-white shadow-sm`}
          >
            <Download className="w-4 h-4" />
          </div>
          <div
            className={`border rounded-xl p-4 w-full ml-2 ${
              hasGeneratedDoc
                ? 'bg-gradient-to-br from-indigo-50/70 to-brand-50/40 border-indigo-200 shadow-sm'
                : 'bg-slate-50/50 border-slate-200/60 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">
                Document Generated & Ready for Download
              </span>
              {hasGeneratedDoc && (
                <span className="text-xs text-indigo-700 font-medium flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Official Ref: {request.generatedDocument?.documentNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {hasGeneratedDoc
                ? 'High-resolution PDF stamped with cryptographic verification hash and scannable QR code.'
                : 'Awaiting completion of all previous approval stages.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
