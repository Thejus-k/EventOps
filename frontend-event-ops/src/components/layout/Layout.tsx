import React from 'react';
import { Sidebar } from './Sidebar';
import { AIAssistant } from '@/components/AIAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <AIAssistant />
    </div>
  );
}