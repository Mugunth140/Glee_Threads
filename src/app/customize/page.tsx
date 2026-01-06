import CustomizeClient from '@/components/customize/CustomizeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design Your Own T-Shirt | Glee Threads',
  description: 'Create your unique style with our custom t-shirt designer. Upload your art, add text, and choose from premium colors and sizes.',
  openGraph: {
    title: 'Design Your Own T-Shirt | Glee Threads',
    description: 'Create your unique style with our custom t-shirt designer. Upload your art, add text, and choose from premium colors and sizes.',
  },
};

export default function CustomizePage() {
  return <CustomizeClient />;
}
