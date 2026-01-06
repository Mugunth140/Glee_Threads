import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Glee Threads',
  description: 'Learn about Glee Threads, our story, values, and commitment to premium quality custom t-shirts in Coimbatore.',
  openGraph: {
    title: 'About Us | Glee Threads',
    description: 'Learn about Glee Threads, our story, values, and commitment to premium quality custom t-shirts in Coimbatore.',
  },
};

export default function AboutPage() {
  const stats = [
    { value: '500+', label: 'Unique Designs' },
    { value: '15k+', label: 'Happy Customers' },
    { value: '1000+', label: 'Custom Orders' },
    { value: '4.9★', label: 'Customer Rating' },
  ];

  const values = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Creativity First',
      description: 'We believe everyone should be able to express their unique style through custom apparel.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: 'Premium Quality',
      description: 'We use only the finest fabrics and printing techniques to ensure lasting comfort and vibrancy.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Sustainable Practices',
      description: 'Eco-friendly materials and responsible manufacturing are at the core of everything we do.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Customer Focused',
      description: 'Your satisfaction is our priority. We provide exceptional support at every step of your journey.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh] py-16">
            {/* Left - Text Content */}
            <div>
              <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-6">
                Our Story
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
                Where Style
                <br />
                <span className="text-gray-400">Meets Expression</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md leading-relaxed">
                We started Glee Threads with a simple idea: everyone deserves a t-shirt that tells their story. Whether it&apos;s your own design or one from our curated collection, we make it happen.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all"
                >
                  Explore Our Collection
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative order-first lg:order-last">
              <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80"
                  alt="About Glee Threads"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-black rounded-2xl -z-10" />
              <div className="absolute -top-6 -right-6 w-24 h-24 border-2 border-gray-200 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-black mb-2">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-6">
              The Beginning
            </span>
            <h2 className="text-4xl font-bold text-black mb-6">From Passion to Purpose</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Founded in Siddhapudur, Coimbatore, Glee Threads was born from a simple frustration—finding quality t-shirts that truly represented who we are. We started with a single screen printing machine and a big dream. Today, we&apos;ve helped thousands of customers bring their visions to life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative aspect-4/5 rounded-2xl overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&q=80"
                alt="Our workshop"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-semibold text-lg">Our Workshop</p>
                <p className="text-sm text-gray-300">Where the magic happens</p>
              </div>
            </div>
            <div className="relative aspect-4/5 rounded-2xl overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80"
                alt="Premium materials"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-semibold text-lg">Premium Materials</p>
                <p className="text-sm text-gray-300">Only the best fabrics</p>
              </div>
            </div>
            <div className="relative aspect-4/5 rounded-2xl overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=600&q=80"
                alt="Happy customers"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-semibold text-lg">Happy Customers</p>
                <p className="text-sm text-gray-300">Thousands of smiles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-600 mb-6">
              Our Values
            </span>
            <h2 className="text-4xl font-bold text-black mb-4">What We Stand For</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do, from design to delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-black hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6 text-black">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Create Your Perfect Tee?</h2>
            <p className="text-lg text-gray-400 mb-8">
              Join thousands of happy customers and start expressing yourself today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/customize"
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full text-sm font-semibold hover:bg-gray-100 transition-all"
              >
                Start Customizing
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-transparent text-white px-8 py-4 rounded-full text-sm font-semibold border border-gray-700 hover:border-white transition-all"
              >
                Browse Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
