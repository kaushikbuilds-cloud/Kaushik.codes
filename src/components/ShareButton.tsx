import { Share2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { shareOrCopy } from '@/utils/share';

export function ShareButton({
  title,
  text,
  url,
  className,
}: {
  title: string;
  text?: string;
  url: string;
  className?: string;
}) {
  const { toast } = useToast();

  const handleShare = async () => {
    const result = await shareOrCopy({ title, text, url });
    if (result === 'copied') toast('Link copied bro 🔗');
    else if (result === 'error') toast('Couldnt share, try again', 'error');
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={className ?? 'btn-secondary'}
      aria-label="Share"
    >
      <Share2 size={16} />
      Share
    </button>
  );
}
