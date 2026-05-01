// resources/js/layouts/owner-layout.tsx
// Shell for all Owner/* pages — uses shared AppHeader

import AppHeader from '@/components/app-header';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AppHeader />
            <main className="flex-1">{children}</main>
        </div>
    );
}
