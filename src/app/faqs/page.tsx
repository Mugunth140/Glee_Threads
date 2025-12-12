'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  name: string;
  icon: React.ReactNode;
  faqs: FAQItem[];
}

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const categories: FAQCategory[] = [
    {
      name: 'Ordering',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      faqs: [
        {
          question: 'How do I place an order?',
          answer: 'Simply browse our collection, select your preferred t-shirt, choose your size and quantity, and add it to your cart. For custom designs, use our design tool to upload your artwork or create from scratch. Then proceed to checkout to complete your order.',
        },
        {
          question: 'Can I modify or cancel my order after placing it?',
          answer: 'You can modify or cancel your order within 2 hours of placing it. After that, production may have already started. Please contact our support team immediately if you need to make changes.',
        },
        {
          question: 'Do you offer bulk or wholesale orders?',
          answer: 'Yes! We offer special pricing for bulk orders of 10+ items. Contact our team via WhatsApp at 8248333655 or Instagram @glee_threads for custom quotes and corporate packages.',
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit SSL encryption.',
        },
      ],
    },
    {
      name: 'Custom Designs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      faqs: [
        {
          question: 'What file formats do you accept for custom designs?',
          answer: 'We accept PNG, JPG, SVG, and PDF files. For best results, we recommend high-resolution PNG files (at least 300 DPI) with transparent backgrounds. SVG files work great for vector graphics.',
        },
        {
          question: 'What are the size requirements for custom artwork?',
          answer: 'For optimal print quality, your artwork should be at least 2000 x 2000 pixels. The maximum print area is 12" x 16" for the front and back of t-shirts.',
        },
        {
          question: 'Can you help me design my t-shirt?',
          answer: 'Absolutely! Our design team can help bring your ideas to life. For a small fee, we offer professional design services. Just describe your vision and we\'ll create mockups for your approval.',
        },
        {
          question: 'How many colors can I use in my design?',
          answer: 'With our DTG (Direct to Garment) printing, there\'s no limit to colors! Your design can include gradients, photographs, and unlimited colors at no extra charge.',
        },
      ],
    },
    {
      name: 'Shipping',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      faqs: [
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping takes 5-7 business days. Express shipping (2-3 business days) and overnight options are also available. Custom orders require an additional 2-3 days for production before shipping.',
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Yes! We ship to over 50 countries worldwide. International shipping typically takes 7-14 business days. Shipping costs and times vary by destination.',
        },
        {
          question: 'How can I track my order?',
          answer: 'Once your order ships, you\'ll receive an email with a tracking number and link. You can also track your order status in your account dashboard.',
        },
        {
          question: 'Is shipping free?',
          answer: 'We offer free standard shipping on orders over $50 within the continental US. Express and international shipping rates are calculated at checkout.',
        },
      ],
    },
    {
      name: 'Returns & Refunds',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
        </svg>
      ),
      faqs: [
        {
          question: 'What is your return policy?',
          answer: 'We accept returns within 30 days of delivery for ready-made items in original condition with tags attached. Custom-designed items are final sale unless there\'s a printing defect.',
        },
        {
          question: 'How do I initiate a return?',
          answer: 'Log into your account, go to Order History, select the item you want to return, and follow the prompts. You\'ll receive a prepaid return label via email within 24 hours.',
        },
        {
          question: 'When will I receive my refund?',
          answer: 'Once we receive and inspect your return, refunds are processed within 3-5 business days. The amount will be credited to your original payment method.',
        },
        {
          question: 'What if my order arrives damaged or incorrect?',
          answer: 'We\'re sorry for any inconvenience! Contact us within 48 hours with photos of the issue. We\'ll send a replacement at no charge or issue a full refund, your choice.',
        },
      ],
    },
    {
      name: 'Product & Sizing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      faqs: [
        {
          question: 'What materials are your t-shirts made of?',
          answer: 'Our standard tees are 100% premium combed cotton (180 GSM). Our premium line features a luxurious cotton-polyester blend (220 GSM) for extra durability and a softer feel.',
        },
        {
          question: 'How do I find my size?',
          answer: 'Check our size guide on each product page for detailed measurements. We recommend measuring a t-shirt that fits you well and comparing it to our charts. When in doubt, size up!',
        },
        {
          question: 'Will the print fade or crack after washing?',
          answer: 'Our DTG prints are designed to last! With proper care (washing inside out in cold water, tumble dry low), your print will stay vibrant for years. We guarantee color-fastness for at least 50 washes.',
        },
        {
          question: 'Do your t-shirts shrink after washing?',
          answer: 'Our t-shirts are pre-shrunk, so minimal shrinkage (less than 3%) may occur. To be safe, follow the care instructions on the label.',
        },
      ],
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 lg:py-20 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-6">
              Help Center
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Frequently Asked
              <br />
              <span className="text-gray-400">Questions</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Find answers to common questions about our products, ordering process, shipping, and more.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Category Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Categories
                </p>
                <nav className="space-y-2">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setActiveCategory(index);
                        setOpenFAQ(0);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeCategory === index
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category.icon}
                      {category.name}
                    </button>
                  ))}
                </nav>

                {/* Contact Card */}
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                  <h3 className="font-semibold text-black mb-2">Still have questions?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our support team is here to help you 24/7.
                  </p>
                  <Link
                    href="https://wa.me/918248333655"
                    className="inline-flex items-center gap-2 text-sm font-medium text-black hover:underline"
                  >
                    Contact Support
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* FAQ Accordions */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">
                  {categories[activeCategory].name}
                </h2>
                <p className="text-gray-600">
                  {categories[activeCategory].faqs.length} questions
                </p>
              </div>

              <div className="space-y-4">
                {categories[activeCategory].faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-colors"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-medium text-black pr-4">{faq.question}</span>
                      <span
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          openFAQ === index ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openFAQ === index ? 'max-h-96' : 'max-h-0'
                      }`}
                    >
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our support team is always ready to help. Reach out to us anytime.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="https://wa.me/918248333655"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                WhatsApp Support
              </Link>
              <Link
                href="tel:+918248333655"
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full text-sm font-semibold border border-gray-200 hover:border-black transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
