'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  Globe, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Sliders,
  Laptop,
  CheckCheck
} from 'lucide-react';

export default function IntegrationGuidePage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Base domain for integration guides & endpoints (defaults to ai.swipeloan.in)
  const [origin, setOrigin] = React.useState('https://ai.swipeloan.in');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const envBase = process.env.NEXT_PUBLIC_BASE_URL;
      if (envBase) {
        setOrigin(envBase.replace(/\/+$/, ''));
      } else if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setOrigin(window.location.origin);
      } else {
        setOrigin('https://ai.swipeloan.in');
      }
    }
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const scriptCode = `<script src="${origin}/embed.js" async></script>`;

  const customScriptCode = `<script 
  src="${origin}/embed.js" 
  data-position="bottom-right" 
  data-label="Talk to Aanya" 
  data-subtitle="AI Loan Assistant" 
  data-color="#10B981" 
  data-auto-open="false" 
  async
></script>`;

  const iframeCode = `<iframe
  src="${origin}/aanya/embed"
  allow="microphone; autoplay"
  style="width: 100%; height: 620px; border: none; border-radius: 20px; box-shadow: 0 12px 36px rgba(0,0,0,0.15);"
></iframe>`;

  const nextJsCode = `import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="${origin}/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}`;

  const jsControllerCode = `// Open voice call widget programmatically
window.SwipeLoanAanya.open();

// Close voice call widget
window.SwipeLoanAanya.close();

// Check if currently open
if (window.SwipeLoanAanya.isOpen()) {
  console.log("Aanya call is active");
}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-xs">
                <img
                  src="https://swipeloan.in/wp-content/uploads/2024/04/swipefund_logo.png"
                  alt="SwipeLoan"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-emerald-600 transition-colors">
                  SwipeLoan Aanya
                </span>
                <span className="text-[10px] block font-semibold text-emerald-700">
                  Integration & Embed Documentation
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/aanya/embed"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-300 transition-colors"
            >
              <span>Test Widget</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
            <Link
              href="/talktoaanya"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shadow-emerald-600/20"
            >
              <span>Talk to Aanya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 px-4 max-w-6xl mx-auto text-center border-b border-slate-200 bg-white/70">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide uppercase mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick Integration Guide</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
          How to Add Aanya to Any Website
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
          Embed the real-time AI voice loan advisor on your website in under 2 minutes. Works with standard HTML, WordPress, Shopify, Webflow, React, and Next.js.
        </p>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        
        {/* Section 1: All System URLs */}
        <section>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shadow-xs">
              1
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                All Available URLs & Endpoints
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Core URLs provided by your SwipeLoan deployment
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* URL Card 1: embed.js */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Script Tag (CDN)
                </span>
                <Globe className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 font-mono">/embed.js</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5 font-medium">
                Client script that injects the floating launcher button and handles WhatsApp message animation & voice calls.
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => copyToClipboard(`${origin}/embed.js`, 'url-embed-js')}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                >
                  {copiedKey === 'url-embed-js' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                <a
                  href={`${origin}/embed.js`}
                  target="_blank"
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* URL Card 2: /aanya/embed */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                  Iframe / Widget Route
                </span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 font-mono">/aanya/embed</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5 font-medium">
                The embeddable voice interface page designed to load seamlessly inside an iframe or standalone embed container.
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => copyToClipboard(`${origin}/aanya/embed`, 'url-aanya-embed')}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                >
                  {copiedKey === 'url-aanya-embed' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                <Link
                  href="/aanya/embed"
                  target="_blank"
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* URL Card 3: /talktoaanya */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                  Full Web Page
                </span>
                <Laptop className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 font-mono">/talktoaanya</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5 font-medium">
                Complete dedicated landing page for Aanya with rich voice visualizer, eligibility disclosures, and direct audio session.
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => copyToClipboard(`${origin}/talktoaanya`, 'url-talktoaanya')}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                >
                  {copiedKey === 'url-talktoaanya' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                <Link
                  href="/talktoaanya"
                  target="_blank"
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1"
                >
                  <span>Visit Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Method 1 - 1-Line Script (Recommended) */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shadow-xs">
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Method 1: 1-Line Embed Code (Recommended)
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Easiest
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Add the floating button and animated message pop-up to any website with a single line.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                A
              </span>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Copy the snippet below and paste it right before the closing <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-emerald-700 font-mono text-xs">&lt;/body&gt;</code> tag on your website or in your footer scripts.
              </p>
            </div>
          </div>

          {/* Snippet box */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto mb-6 shadow-sm">
            <button
              onClick={() => copyToClipboard(scriptCode, 'snippet-basic')}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedKey === 'snippet-basic' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <pre className="pr-24">{scriptCode}</pre>
          </div>

          {/* Custom attributes section */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Optional Customization Attributes</span>
            </h4>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              You can configure position, labels, colors, and behavior directly on the script tag:
            </p>

            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto mb-6 shadow-sm">
              <button
                onClick={() => copyToClipboard(customScriptCode, 'snippet-custom')}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedKey === 'snippet-custom' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
              <pre className="pr-24">{customScriptCode}</pre>
            </div>

            {/* Parameter reference table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-4">Attribute</th>
                    <th className="py-2.5 px-4">Default</th>
                    <th className="py-2.5 px-4">Options</th>
                    <th className="py-2.5 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">data-position</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">&quot;bottom-right&quot;</td>
                    <td className="py-2.5 px-4">&quot;bottom-right&quot; | &quot;bottom-left&quot;</td>
                    <td className="py-2.5 px-4 text-slate-600">Screen corner placement</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">data-label</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">&quot;Talk to Aanya&quot;</td>
                    <td className="py-2.5 px-4">Any string</td>
                    <td className="py-2.5 px-4 text-slate-600">Main title on launcher button</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">data-subtitle</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">&quot;AI Loan Assistant&quot;</td>
                    <td className="py-2.5 px-4">Any string</td>
                    <td className="py-2.5 px-4 text-slate-600">Sub-headline on launcher button</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">data-color</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">&quot;#10B981&quot;</td>
                    <td className="py-2.5 px-4">Hex color code</td>
                    <td className="py-2.5 px-4 text-slate-600">Primary brand accent color</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">data-theme</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">&quot;dark&quot;</td>
                    <td className="py-2.5 px-4">&quot;light&quot; | &quot;dark&quot;</td>
                    <td className="py-2.5 px-4 text-slate-600">Widget color theme (Light or Dark)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">data-auto-open</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">&quot;false&quot;</td>
                    <td className="py-2.5 px-4">&quot;true&quot; | &quot;false&quot;</td>
                    <td className="py-2.5 px-4 text-slate-600">Auto-open call dialog on page load</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 3: Method 2 - Direct Iframe */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm shadow-xs">
              3
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Method 2: Inline Iframe Embed
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Embed Aanya directly inside a specific container, card, or modal on your page.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto mb-4 shadow-sm">
            <button
              onClick={() => copyToClipboard(iframeCode, 'snippet-iframe')}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedKey === 'snippet-iframe' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <pre className="pr-24">{iframeCode}</pre>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Note: Remember to keep <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">allow=&quot;microphone; autoplay&quot;</code> so the browser allows the voice call permissions.
          </p>
        </section>

        {/* Section 4: Platform Guides */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-sm shadow-xs">
              4
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                CMS & Framework Integration Steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Step-by-step instructions for specific web platforms
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* WordPress Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-bold text-slate-900">WordPress</span>
              </div>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed font-medium">
                <li>Install the free <strong>&quot;Insert Headers and Footers&quot;</strong> plugin (or edit <code className="text-emerald-700 bg-slate-100 px-1 py-0.5 rounded">footer.php</code>).</li>
                <li>Go to <strong>Settings ➔ Insert Headers and Footers</strong>.</li>
                <li>Paste the <code className="text-emerald-700 font-mono text-[11px]">&lt;script src=&quot;{origin}/embed.js&quot; async&gt;&lt;/script&gt;</code> in the <strong>Scripts in Footer</strong> box.</li>
                <li>Click <strong>Save</strong>. The floating button is live immediately!</li>
              </ol>
            </div>

            {/* Shopify / Webflow Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-bold text-slate-900">Shopify / Webflow</span>
              </div>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed font-medium">
                <li>In Shopify, go to <strong>Online Store ➔ Themes ➔ Edit Code</strong>.</li>
                <li>Open <code className="text-emerald-700 bg-slate-100 px-1 py-0.5 rounded">theme.liquid</code> and scroll to the bottom.</li>
                <li>Paste the script tag right above the closing <code className="text-emerald-700 bg-slate-100 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag.</li>
                <li>In Webflow, paste it into <strong>Project Settings ➔ Custom Code ➔ Footer Code</strong>.</li>
              </ol>
            </div>

            {/* Next.js / React Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-bold text-slate-900">Next.js / React</span>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed font-medium">
                Use Next.js <code className="text-emerald-700 bg-slate-100 px-1 py-0.5 rounded font-mono">next/script</code> in your root layout:
              </p>
              <div className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto shadow-sm">
                <pre>{`<Script src="${origin}/embed.js" strategy="lazyOnload" />`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Programmatic JavaScript API */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shadow-xs">
              5
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                JavaScript API (Trigger from Custom Buttons)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Trigger Aanya from your own custom &quot;Apply Now&quot; or &quot;Talk to Advisor&quot; buttons
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed font-medium">
            The embed script exposes the <code className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">window.SwipeLoanAanya</code> global object, allowing your custom buttons to open or close the voice agent:
          </p>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto shadow-sm">
            <button
              onClick={() => copyToClipboard(jsControllerCode, 'snippet-js')}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedKey === 'snippet-js' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <pre className="pr-24">{jsControllerCode}</pre>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 KGIL Fintech Solutions Private Limited (SwipeLoan)</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-emerald-700">Home Directory</Link>
            <Link href="/talktoaanya" className="hover:text-emerald-700">Talk to Aanya</Link>
            <Link href="/aanya/embed" className="hover:text-emerald-700">Widget Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
