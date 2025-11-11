'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import CertificationsHalalPage from '@/components/CertificationsHalalPage';

export default function CertificationsHalal() {
  return (
    <ErrorBoundary>
      <CertificationsHalalPage />
    </ErrorBoundary>
  );
}