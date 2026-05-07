import { BookOpen } from 'lucide-react';

interface StateMessageProps {
  title: string;
  message?: string;
  tone?: 'neutral' | 'error';
}

export default function StateMessage({ title, message, tone = 'neutral' }: StateMessageProps) {
  const styles = tone === 'error'
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-white border-zinc-200 text-deep-blue';

  return (
    <div className={`empty-state rounded-[1.75rem] border p-8 md:p-10 text-center shadow-sm ${styles}`}>
      <div className="empty-state-icon mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-saffron/10 text-saffron">
        <BookOpen size={30} />
      </div>
      <h3 className="empty-state-title text-2xl md:text-3xl font-bold">{title}</h3>
      {message && <p className="empty-state-copy mt-3 text-sm md:text-base text-zinc-500 leading-7 max-w-2xl mx-auto">{message}</p>}
    </div>
  );
}
