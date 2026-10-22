import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aanya Voice Assistant | SwipeLoan',
};

export default function AanyaEmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full min-h-screen bg-transparent overflow-hidden">
      {children}
    </div>
  );
}
