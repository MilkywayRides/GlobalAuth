"use client";

import 'fumadocs-ui/style.css';
import { DocsLayout as FumaDocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider';

export function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider>
      <FumaDocsLayout
        nav={{
          title: 'BlazeNeuro',
          url: '/',
        }}
      >
        {children}
      </FumaDocsLayout>
    </RootProvider>
  );
}
