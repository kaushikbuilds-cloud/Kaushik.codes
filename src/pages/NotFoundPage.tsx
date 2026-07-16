import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSeo } from '@/hooks/useSeo';

export function NotFoundPage() {
  useSeo({ title: 'Not found — Kaushik Codes', noindex: true });
  return (
    <div className="container-app py-20">
      <EmptyState
        icon={<Compass size={40} />}
        title="Bro inga onnum illa 👀"
        description="The page you are looking for doesnt exist."
        action={
          <Link to="/" className="btn-primary">
            Back home
          </Link>
        }
      />
    </div>
  );
}
