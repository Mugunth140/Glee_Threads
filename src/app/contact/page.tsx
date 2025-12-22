import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-16 lg:py-20 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-6">
              Get in touch
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Contact
              <br />
              <span className="text-gray-400">We&apos;d love to hear from you</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Have a question about an order, a custom request, or anything else? Reach out and our support team will reply as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="p-8 bg-gray-50 rounded-2xl text-center">
              <h3 className="text-lg font-semibold text-black mb-2">WhatsApp</h3>
              <p className="text-sm text-gray-600 mb-4">Message us for quick support and order queries.</p>
              <Link href="https://wa.me/918248333655" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-all">
                Message on WhatsApp
              </Link>
            </div>

            <div className="p-8 bg-gray-50 rounded-2xl text-center">
              <h3 className="text-lg font-semibold text-black mb-2">Call Us</h3>
              <p className="text-sm text-gray-600 mb-4">Prefer to talk? Call our support line during business hours.</p>
              <a href="tel:+918248333655" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 text-black text-sm font-semibold hover:border-black transition-all">
                +91 8248333655
              </a>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center">
            <p className="text-gray-600 mb-6">For urgent order issues (damaged/incorrect items), please include your order number and photos when contacting us.</p>
            <Link href="/faqs" className="text-sm font-medium text-black hover:underline">See our Help Center</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
