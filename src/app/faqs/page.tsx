import FAQsClient from '@/components/faqs/FAQsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Glee Threads',
  description: 'Find answers to common questions about ordering, shipping, returns, and custom designs at Glee Threads.',
  openGraph: {
    title: 'Frequently Asked Questions | Glee Threads',
    description: 'Find answers to common questions about ordering, shipping, returns, and custom designs at Glee Threads.',
  },
};

export default function FAQsPage() {
  return <FAQsClient />;
}
