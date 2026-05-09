import { useState } from 'react';
import {
  Monitor, Smartphone, Sparkles, Send, Edit3, Mail,
  Calendar, Clock, User, Video, Link2, MessageSquare,
  CheckCircle2, Loader2,
} from 'lucide-react';

/**
 * EmailPreview — Live email preview with desktop/mobile toggle,
 * edit-before-send, and AI improve button.
 */
export default function EmailPreview({
  candidateName = 'Candidate',
  jobTitle = 'Position',
  date = '',
  startTime = '',
  endTime = '',
  platform = 'Google Meet',
  meetingLink = '',
  interviewerName = 'HR Team',
  notes = '',
  onSend,
  onEdit,
  onImproveWithAI,
  sending = false,
  aiImproving = false,
}) {
  const [view, setView] = useState('desktop'); // desktop | mobile
  const [editMode, setEditMode] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes);

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set';

  const handleSend = () => {
    onSend?.(editMode ? editedNotes : notes);
  };

  const handleAIImprove = () => {
    onImproveWithAI?.(editedNotes || notes);
  };

  // Summary cards data
  const details = [
    { icon: Calendar, label: 'Date', value: formattedDate, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Clock, label: 'Time', value: startTime && endTime ? `${startTime} – ${endTime}` : 'Not set', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: User, label: 'Interviewer', value: interviewerName, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Video, label: 'Platform', value: platform, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-4">
      {/* Detail summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {details.map((d) => (
          <div
            key={d.label}
            className="flex items-center gap-3 rounded-xl border border-slate-200/50 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.02] px-3.5 py-3"
          >
            <div className={`w-8 h-8 rounded-lg ${d.bg} flex items-center justify-center shrink-0`}>
              <d.icon className={`w-4 h-4 ${d.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {d.label}
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {d.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Meeting link */}
      {meetingLink && (
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/50 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.02] px-3.5 py-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
            <Link2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Meeting Link
            </p>
            <p className="text-sm text-sky-600 dark:text-sky-400 truncate font-medium">
              {meetingLink}
            </p>
          </div>
        </div>
      )}

      {/* View toggle + action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06]">
          <button
            onClick={() => setView('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === 'desktop'
                ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            onClick={() => setView('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === 'mobile'
                ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditMode(!editMode); setEditedNotes(notes); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              editMode
                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                : 'text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.03]'
            }`}
          >
            <Edit3 className="w-3 h-3" /> {editMode ? 'Editing' : 'Edit'}
          </button>
          {onImproveWithAI && (
            <button
              onClick={handleAIImprove}
              disabled={aiImproving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-prpl/8 dark:bg-prpl/15 text-prpl border border-prpl/15 dark:border-prpl/20 hover:bg-prpl/15 dark:hover:bg-prpl/25 transition-all disabled:opacity-50"
            >
              {aiImproving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              {aiImproving ? 'Improving...' : 'AI Improve'}
            </button>
          )}
        </div>
      </div>

      {/* Edit area */}
      {editMode && (
        <div className="animate-fade-in">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
            Custom Message / Notes
          </label>
          <textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 resize-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="Add a custom message for the candidate..."
          />
        </div>
      )}

      {/* Email Preview Card */}
      <div
        className={`rounded-2xl border border-slate-200/60 dark:border-white/[0.06] overflow-hidden shadow-sm transition-all duration-300 mx-auto ${
          view === 'mobile' ? 'max-w-[375px]' : 'w-full'
        }`}
      >
        {/* Email header bar */}
        <div className="bg-gradient-to-r from-prpl via-purple-600 to-violet-700 px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-bold">H</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">HireX</h3>
          </div>
          <p className="text-white/70 text-xs font-medium">Interview Invitation</p>
        </div>

        {/* Email body */}
        <div className="bg-white dark:bg-[#1a1c24] px-5 py-5">
          <p className="text-base font-medium text-slate-800 dark:text-slate-200 mb-3">
            Hello {candidateName},
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            We're excited to invite you to an interview for the{' '}
            <strong className="text-slate-800 dark:text-slate-200">{jobTitle}</strong> position.
            Please find the details below:
          </p>

          {/* Details card inside email */}
          <div className="rounded-xl bg-purple-50/80 dark:bg-prpl/8 border border-purple-200/50 dark:border-prpl/15 p-4 mb-4 space-y-2.5">
            {[
              { emoji: '📅', label: 'Date', value: formattedDate },
              { emoji: '🕐', label: 'Time', value: startTime && endTime ? `${startTime} – ${endTime}` : 'Not set' },
              { emoji: '👤', label: 'Interviewer', value: interviewerName },
              ...(meetingLink ? [{ emoji: '🔗', label: 'Meeting', value: meetingLink, isLink: true }] : []),
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {row.emoji} {row.label}
                </span>
                {row.isLink ? (
                  <span className="text-prpl font-medium truncate max-w-[200px]">
                    Join Meeting ↗
                  </span>
                ) : (
                  <span className="text-slate-800 dark:text-slate-200 font-medium text-right">
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          {(editMode ? editedNotes : notes) && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              <strong className="text-slate-700 dark:text-slate-300">Notes:</strong>{' '}
              {editMode ? editedNotes : notes}
            </p>
          )}

          {/* CTA button */}
          {meetingLink && (
            <div className="text-center mb-4">
              <span className="inline-block bg-prpl text-white font-semibold text-sm px-6 py-2.5 rounded-xl">
                Join Interview
              </span>
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            If you have any questions or need to reschedule, please don't hesitate to reach out.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Best regards,<br />
            <strong className="text-slate-700 dark:text-slate-300">The HireX Team</strong>
          </p>
        </div>

        {/* Email footer */}
        <div className="bg-slate-50 dark:bg-white/[0.02] text-center py-3 border-t border-slate-200/40 dark:border-white/[0.04]">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} HireX. All rights reserved.
          </p>
        </div>
      </div>

      {/* Send button */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleSend}
          disabled={sending}
          className="btn-magnetic inline-flex items-center gap-2 bg-gradient-to-r from-prpl to-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.3)] text-sm disabled:opacity-50 transition-all"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Send Invitation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
