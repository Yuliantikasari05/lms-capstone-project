import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { assessmentService } from '../../services/assessmentService';
import { getApiError } from '../../services/courseService';
import type { ExamResult, ExamSession } from '../../types/assessment';
import { Alert } from '../../components/common/Alert';

interface Props {
  session: ExamSession;
  onClose: (finished: boolean) => void;
}

const fmt = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const ExamTakerModal: React.FC<Props> = ({ session, onClose }) => {
  const endsAt = new Date(session.ends_at).getTime();
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ data: ExamResult; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const res = await assessmentService.submitExam(session.exam.id, session.attempt_id, answersRef.current);
      setResult({ data: res.result, message: res.message });
    } catch (err) {
      submittedRef.current = false;
      setError(getApiError(err, 'Gagal mengumpulkan ujian. Coba lagi.'));
    } finally {
      setSubmitting(false);
    }
  }, [session.exam.id, session.attempt_id]);

  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(timer);
        submit();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt, result, submit]);

  const answered = Object.keys(answers).length;
  const total = session.questions.length;

  if (result) {
    const r = result.data;
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          {r.timed_out ? (
            <XCircle className="w-14 h-14 text-rose-500 mx-auto" />
          ) : r.passed ? (
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          ) : (
            <XCircle className="w-14 h-14 text-amber-500 mx-auto" />
          )}
          <h2 className="text-xl font-bold text-slate-900 mt-3">{session.exam.title}</h2>
          <p className="text-5xl font-extrabold text-slate-900 mt-4">{r.score}</p>
          <p className="text-xs text-slate-500 mt-1">
            {r.correct_count} dari {r.total_questions} soal benar • batas lulus {r.passing_score}
          </p>
          <p className={`text-sm font-semibold mt-3 ${r.passed ? 'text-emerald-700' : 'text-rose-700'}`}>{result.message}</p>
          <button onClick={() => onClose(true)} className="mt-6 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg">
            Kembali ke Daftar Ujian
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{session.exam.title}</p>
            <p className="text-xs text-slate-500">
              Terjawab {answered}/{total}
            </p>
          </div>
          <div className={`flex items-center space-x-1.5 font-mono text-lg font-bold ${remaining <= 60 ? 'text-rose-600' : 'text-slate-900'}`}>
            <Clock className="w-5 h-5" />
            <span>{fmt(remaining)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {session.questions.map((q, qi) => (
          <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              {qi + 1}. {q.question}
              <span className="ml-2 text-[11px] font-normal text-slate-400">({q.points} poin)</span>
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg border cursor-pointer transition ${
                    answers[q.id] === oi ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === oi}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-slate-800">
                    <span className="font-semibold mr-1.5">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pb-10">
          <button onClick={() => onClose(false)} className="text-xs font-semibold text-slate-600 hover:underline">
            Keluar &amp; lanjutkan nanti (waktu tetap berjalan)
          </button>
          <button
            onClick={() => {
              if (answered < total && !window.confirm(`Masih ada ${total - answered} soal belum dijawab. Kumpulkan sekarang?`)) return;
              submit();
            }}
            disabled={submitting}
            className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-5 py-2.5 rounded-lg"
          >
            {submitting ? 'Mengumpulkan...' : 'Kumpulkan Ujian'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamTakerModal;
