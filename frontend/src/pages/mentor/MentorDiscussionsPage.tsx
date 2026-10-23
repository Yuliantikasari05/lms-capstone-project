import React, { useState } from 'react';
import { MessageSquare, Star, Reply, Pin, CheckCircle2, User, CornerDownRight } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';

interface DiscussionThread {
  id: string;
  course_name: string;
  lesson_title: string;
  student_name: string;
  question: string;
  asked_at: string;
  is_answered: boolean;
  replies: {
    author: string;
    role: string;
    content: string;
    time: string;
  }[];
}

const INITIAL_THREADS: DiscussionThread[] = [
  {
    id: 'TH-01',
    course_name: 'Full-Stack Web Development Bootcamp',
    lesson_title: 'Modul 2: Autentikasi JWT & Sanctum Middleware',
    student_name: 'Budi Pratama',
    question: 'Halo Mentor, kenapa token Sanctum saya selalu return 401 saat dipanggil dari Postman padahal header Authorization Bearer sudah diisi?',
    asked_at: '3 jam lalu',
    is_answered: true,
    replies: [
      {
        author: 'Mentor Budi',
        role: 'Mentor Pengampu',
        content: 'Halo Budi, pastikan route di Laravel Anda menggunakan middleware auth:sanctum dan format header Accept: application/json sudah disertakan ya.',
        time: '2 jam lalu',
      },
    ],
  },
  {
    id: 'TH-02',
    course_name: 'Microservices with Go & Docker',
    lesson_title: 'Modul 4: Multi-stage Dockerfile Optimization',
    student_name: 'Ahmad Fauzi (Tech Corp)',
    question: 'Untuk deployment production di Kubernetes, apakah lebih baik menggunakan image Alpine atau Distroless untuk binary Go?',
    asked_at: '5 jam lalu',
    is_answered: false,
    replies: [],
  },
  {
    id: 'TH-03',
    course_name: 'Full-Stack Web Development Bootcamp',
    lesson_title: 'Modul 3: Relasi Database PostgreSQL & Foreign Key',
    student_name: 'Clarissa Maharani',
    question: 'Kapan kita sebaiknya menggunakan onDelete cascade vs onDelete restrict pada migration Laravel?',
    asked_at: '1 hari lalu',
    is_answered: false,
    replies: [],
  },
];

export const MentorDiscussionsPage: React.FC = () => {
  const [threads, setThreads] = useState<DiscussionThread[]>(INITIAL_THREADS);
  const [activeThread, setActiveThread] = useState<DiscussionThread | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'unanswered'>('all');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredThreads = filter === 'all'
    ? threads
    : threads.filter((t) => !t.is_answered);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    const newReply = {
      author: 'Mentor Pengampu (Anda)',
      role: 'Mentor',
      content: replyText.trim(),
      time: 'Baru saja',
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? {
              ...t,
              is_answered: true,
              replies: [...t.replies, newReply],
            }
          : t
      )
    );

    setActiveThread(null);
    setReplyText('');
    setAlert({ type: 'success', message: 'Tanggapan bimbingan berhasil dipublikasikan di forum diskusi modul!' });
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Forum Diskusi Modul & Tanya Jawab Peserta"
        category="production"
        description="Bimbing peserta secara asinkron: tanggapi kendala koding, jawab pertanyaan materi pelajaran, dan pandu diskusi kelas."
        roleScope="Mentor (discussions:manage, discussions:reply)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filter Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">Filter Pertanyaan:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
          >
            <option value="all">Semua Pertanyaan ({threads.length})</option>
            <option value="unanswered">Belum Dijawab ({threads.filter((t) => !t.is_answered).length})</option>
          </select>
        </div>
      </div>

      {/* Thread List */}
      <div className="space-y-4">
        {filteredThreads.map((thread) => (
          <div
            key={thread.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-blue-600">{thread.course_name}</span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-[11px] text-slate-500">{thread.lesson_title}</span>
              </div>
              {thread.is_answered ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Terjawab
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  ⏳ Menunggu Jawaban
                </span>
              )}
            </div>

            {/* Question Card */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                  {thread.student_name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-800">{thread.student_name}</span>
                <span className="text-[10px] text-slate-400">({thread.asked_at})</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{thread.question}</p>
            </div>

            {/* Replies */}
            {thread.replies.length > 0 && (
              <div className="space-y-2 pl-4 border-l-2 border-blue-200 mt-2">
                {thread.replies.map((reply, idx) => (
                  <div key={idx} className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-blue-800 flex items-center">
                        <CornerDownRight className="w-3.5 h-3.5 mr-1" /> {reply.author}
                      </span>
                      <span className="text-[10px] text-slate-400">{reply.time}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveThread(thread)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 flex items-center"
              >
                <Reply className="w-3.5 h-3.5 mr-1.5" />
                {thread.replies.length > 0 ? 'Tambah Tanggapan' : 'Jawab Pertanyaan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {activeThread && (
        <Modal
          isOpen={true}
          onClose={() => setActiveThread(null)}
          title={`Jawab Pertanyaan: ${activeThread.student_name}`}
        >
          <form onSubmit={handleSendReply} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-medium text-slate-700 mb-1">{activeThread.question}</p>
              <p className="text-[10px] text-slate-400">{activeThread.lesson_title}</p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tulis Jawaban & Penjelasan Mentor:
              </label>
              <textarea
                required
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Tuliskan solusi langkah demi langkah, referensi dokumentasi, atau tips debugging..."
                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveThread(null)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Kirim Jawaban ke Siswa
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
