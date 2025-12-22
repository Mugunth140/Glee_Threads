export default function LegalPage() {
  const lastUpdated = 'December 22, 2025';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section id="top" className="py-16 lg:py-20 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-6">
              Legal & Policies
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-4 leading-tight">Privacy, Terms & Cookies</h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">Everything you need to know about how Glee Threads collects data, the rules for using the site, and how cookies are used.</p>
            <p className="text-sm text-gray-400 mt-4">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            <aside className="lg:col-span-1 sticky top-28 hidden lg:block">
              <nav className="space-y-3 bg-white p-4 rounded-xl border border-gray-100">
                <a href="#privacy" className="block text-sm text-gray-700 hover:text-black">Privacy Policy</a>
                <a href="#terms" className="block text-sm text-gray-700 hover:text-black">Terms of Service</a>
                <a href="#cookies" className="block text-sm text-gray-700 hover:text-black">Cookies</a>
              </nav>
            </aside>

            <div className="lg:col-span-3 prose max-w-none text-black/80">
              <section id="privacy">
                <h2 className="text-xl font-bold">Privacy Policy</h2>
                <p>We collect information you provide when placing orders or contacting support and certain technical information automatically (cookies, IP, browser). This information is used to process orders, improve our service, and provide support. We never sell your personal data to third parties; where third-party services are used (payment processors, analytics), their use is disclosed and controlled by their respective policies.</p>

                <h3 className="text-md font-bold mt-2">How we use your data</h3>
                <ul className="list-decimal">
                  <li className="ml-6">Order processing and delivery</li>
                  <li className="ml-6">Customer support and refunds</li>
                  <li className="ml-6">Marketing when you opt in</li>
                </ul>

                <h3 className="text-md font-bold mt-2">Security</h3>
                <p className="mb-4">We protect your information with industry standard safeguards and limit access to authorized staff only.</p>

                {/* <p className="mt-4"><a href="#top" className="text-sm text-primary hover:underline">Back to top</a></p> */}
              </section>

              <hr />

              <section id="terms">
                <h2 className="text-xl font-bold mt-2">Terms of Service</h2>
                <p>By using this site and placing orders you agree to these terms. Orders are subject to availability and acceptance. Prices are displayed in the site currency and all payments are final unless we approve a refund. We reserve the right to refuse service for violations of our policies or illegal activity.</p>

                <h3 className="text-md font-bold mt-2">Intellectual property</h3>
                <p>All content on the site (images, text, code, designs) is owned by Glee Threads or used under license. You may not reproduce content without permission.</p>

                <h3 className="text-md font-bold mt-2">Limitation of liability</h3>
                <p className="mb-4">To the fullest extent permitted by law, Glee Threads is not liable for indirect or consequential losses. Our liability for direct damages is limited to the order value.</p>

                {/* <p className="mt-4"><a href="#top" className="text-sm text-primary hover:underline">Back to top</a></p> */}
              </section>

              <hr />

              <section id="cookies">
                <h2 className="text-xl font-bold mt-2">Cookies</h2>
                <p>We use cookies to provide basic site functionality, remember preferences, and for analytics. Cookies help us improve performance and personalize your shopping experience. You can control cookie usage through your browser settings or by using available opt-out links for analytics providers.</p>

                <h3 className="text-md font-bold mt-2">Types of cookies</h3>
                <ul className="mt-2">
                  <li><strong>Essential:</strong> Required for cart and checkout functionality.</li>
                  <li><strong>Performance & Analytics:</strong> Used to understand site usage and improve UX.</li>
                  <li><strong>Marketing:</strong> Used to display relevant promotions.</li>
                </ul>

                <p className="mt-4 mb-4">If you have questions about our policies, contact support via WhatsApp.</p>
                 <hr />
                <p className="mt-4"><a href="#top" className="text-sm text-primary hover:underline">Back to top</a></p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
