import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden relative">
                <Image src="/glee_logo.png" alt="Glee Threads" fill className="object-cover" />
              </div>
              <span className="text-xl font-semibold text-black">Glee Threads</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              Your destination for custom and ready-made t-shirts. Create your unique style or choose from our curated collection.
            </p>
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-black">Location:</span> Siddhapudur, Coimbatore
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-black">Phone:</span> <a href="tel:+918248333655" className="hover:text-black">+91 8248333655</a>
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-black">WhatsApp:</span> <a href="https://wa.me/918248333655" className="hover:text-black">+91 8248333655</a>
              </p>
            </div>
            {/* Social Links */}
            <div className="flex gap-3">
              <a href="https://instagram.com/glee_threads" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://wa.me/918248333655" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm font-semibold text-black mb-5 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-sm text-gray-500 hover:text-black transition-colors">
                  All T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/products?filter=graphic" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Graphic Tees
                </Link>
              </li>
              <li>
                <Link href="/products?filter=plain" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Plain Tees
                </Link>
              </li>
              <li>
                <Link href="/products?filter=oversized" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Oversized
                </Link>
              </li>
              <li>
                <Link href="/customize" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Custom Design
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-black mb-5 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-black transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold text-black mb-5 uppercase tracking-wider">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/faqs" className="text-sm text-gray-500 hover:text-black transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} Glee Threads. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-black transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-black transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-gray-400 hover:text-black transition-colors">
                Cookies
              </Link>
            </div>
            {/* Payment Icons */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium text-gray-600">UPI</div>
              <div className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium text-gray-600">Visa</div>
              <div className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium text-gray-600">Mastercard</div>
              <div className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium text-gray-600">COD</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
