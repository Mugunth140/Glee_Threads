import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide | Glee Threads',
  description: 'Find your perfect fit with our detailed size guide. Measurements for chest, length, and sleeve to ensure you order the right size.',
  openGraph: {
    title: 'Size Guide | Glee Threads',
    description: 'Find your perfect fit with our detailed size guide. Measurements for chest, length, and sleeve to ensure you order the right size.',
  },
};

export default function SizeGuidePage() {
  const sizes = [
    { label: 'S', chest: "34-36", length: '27', sleeve: '8.5' },
    { label: 'M', chest: "38-40", length: '28', sleeve: '9' },
    { label: 'L', chest: "42-44", length: '29', sleeve: '9.5' },
    { label: 'XL', chest: "46-48", length: '30', sleeve: '10' },
    { label: 'XXL', chest: "50-52", length: '31', sleeve: '10.5' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="py-16 lg:py-20 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-6">
              Fit & Sizing
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Size Guide
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">Use the chart below to find the best fit. Measure a t-shirt that fits you well and compare the measurements.</p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-left table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-gray-500">Size</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-500">Chest (inches)</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-500">Length (inches)</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-500">Sleeve (inches)</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {sizes.map((s) => (
                    <tr key={s.label} className="border-t border-gray-100">
                      <td className="px-6 py-4 text-sm text-black font-medium">{s.label}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.chest}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.length}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 prose text-gray-700">
              <h3>How to measure</h3>
              <ul>
                <li><strong>Chest:</strong> Measure across the chest 1&quot; below the armholes while the shirt is laid flat; double this measurement.</li>
                <li><strong>Length:</strong> Measure from the highest point on the shoulder to the bottom hem.</li>
                <li><strong>Sleeve:</strong> Measure from the center back of the neck to the end of the sleeve for long sleeve, or from shoulder seam for short sleeve length.</li>
              </ul>
              <p className="mt-4">If you&apos;re between sizes, we recommend sizing up for a comfortable fit. For custom fits or bulk orders, contact us via WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
