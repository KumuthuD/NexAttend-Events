import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, CalendarPlus, ArrowRight, CheckCircle2, Users, Download, Shield, ClipboardList, ScanLine, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans overflow-x-hidden selection:bg-[#00d4ff]/30 selection:text-white">
      
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a1a]/80 backdrop-blur-md border-b border-white/5 saturate-150">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#00d4ff] blur-md opacity-40 rounded-full" />
              <img src="/logo.png" alt="NexAttend Logo" className="w-10 h-10 object-contain relative z-10" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] hidden sm:block">
              NexAttend Events
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/events" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
              Explore Events
            </Link>
            {user ? (
              <Link to="/dashboard" className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors border border-white/10">
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-6 py-2.5 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Background Gradients */}
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[80vw] h-[50vh] bg-[#7c3aed]/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute top-[20%] left-[20%] w-[30vw] h-[40vh] bg-[#00d4ff]/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#00d4ff] mb-8">
              <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
              Privacy-First Event Check-Ins
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6 tracking-tight">
              Event tracking, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
                without the friction.
              </span>
            </h1>
            <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Create beautiful registration forms, generate instant QR tickets, and check people in seamlessly. No biometrics. No hardware. Just your phone.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(124,58,237,0.4)] group">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/events" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center rounded-xl font-bold text-lg transition-all backdrop-blur-sm">
                Explore Events
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-[#00d4ff]" /> No apps needed</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#7c3aed]" /> Unlimited scans</div>
            </div>
          </motion.div>

          {/* Isometric App Mockup Graphic */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#7c3aed]/20 to-[#00d4ff]/20 blur-3xl rounded-full" />
            <div className="relative bg-[#dadbe1]/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-4 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700 ease-out">
              {/* Fake UI Header */}
              <div className="flex items-center justify-between mb-8 px-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="text-xs font-mono text-gray-500">scanner_live.js</div>
              </div>
              
              {/* Fake UI Content */}
              <div className="bg-[#0a0a1a] rounded-3xl border border-white/10 p-6 shadow-inner mx-2 mb-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]" />
                
                <div className="text-center mb-6">
                  <p className="text-[#00d4ff] text-xs font-bold uppercase tracking-widest mb-1">Live Check-In</p>
                  <h3 className="text-2xl font-bold">VisioNEX 2026</h3>
                </div>

                <div className="relative w-64 h-64 mx-auto mb-6 bg-white/5 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center">
                  <QrCode className="w-20 h-20 text-gray-400 mb-4 opacity-50" />
                  <div className="absolute top-0 w-full h-[2px] bg-[#00d4ff] shadow-[0_0_15px_#00d4ff] animate-pulse" style={{ top: '50%' }} />
                </div>

                {/* Animated Scanner Success Bubble */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.5, type: 'spring', damping: 15 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="bg-green-500/20 p-2 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-400 text-sm font-semibold">Checked in successfully</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 border-t border-white/5 relative bg-[#0a0a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Everything you need</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Built for organizers who value speed, simplicity, and design.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              {
                title: 'Custom Registration',
                description: 'Build forms in seconds with drag-and-drop fields. Capture exactly the data you need.',
                icon: <CalendarPlus className="w-8 h-8 text-[#00d4ff]" />,
                color: 'from-[#00d4ff]/20'
              },
              {
                title: 'Instant QR Tickets',
                description: 'Tired of emailing lists? We auto-generate and email unique QR codes upon signup.',
                icon: <QrCode className="w-8 h-8 text-[#7c3aed]" />,
                color: 'from-[#7c3aed]/20'
              },
              {
                title: 'Live Scanner',
                description: 'Turn any phone into a high-speed scanner. Data syncs instantly across devices.',
                icon: <CheckCircle2 className="w-8 h-8 text-green-400" />,
                color: 'from-green-500/20'
              },
              {
                title: 'One-Click Export',
                description: 'Download full attendance sheets as Excel or CSV in a matter of seconds.',
                icon: <Download className="w-8 h-8 text-orange-400" />,
                color: 'from-orange-500/20'
              }
            ].map((feature, i) => (
              <motion.div 
                {...fadeIn}
                key={i}
                className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feature.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full`} />
                <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-white/10 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 relative z-10">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm relative z-10">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 border-t border-white/5 relative bg-[#080815]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">From zero to fully managed event in under five minutes.</p>
          </div>

          <div className="relative">
            {/* Connector line (desktop only) */}
            <div className="hidden lg:block absolute top-12 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-[#00d4ff]/30 via-[#7c3aed]/30 to-[#00d4ff]/30" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
              {[
                {
                  step: '01',
                  title: 'Build your event',
                  description: 'Create an event in minutes. Add a title, date, location, capacity, and drag-and-drop the exact form fields you need.',
                  icon: <ClipboardList className="w-7 h-7 text-[#00d4ff]" />,
                  color: 'border-[#00d4ff]/30 bg-[#00d4ff]/5',
                  glow: 'shadow-[0_0_30px_rgba(0,212,255,0.15)]',
                },
                {
                  step: '02',
                  title: 'Attendees register & get tickets',
                  description: 'Share your event link. Attendees fill the form and instantly receive a unique QR code ticket via email — no account required.',
                  icon: <QrCode className="w-7 h-7 text-[#7c3aed]" />,
                  color: 'border-[#7c3aed]/30 bg-[#7c3aed]/5',
                  glow: 'shadow-[0_0_30px_rgba(124,58,237,0.15)]',
                },
                {
                  step: '03',
                  title: 'Scan, track & export',
                  description: 'Use any phone as a scanner. Check-ins sync in real time across all devices. Export full attendance sheets to CSV or Excel when done.',
                  icon: <ScanLine className="w-7 h-7 text-green-400" />,
                  color: 'border-green-500/30 bg-green-500/5',
                  glow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeIn}
                  className={`relative flex flex-col items-center text-center p-8 rounded-3xl border backdrop-blur-sm ${item.color} ${item.glow}`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#0a0a1a] border border-white/10 flex items-center justify-center mb-6 shadow-lg">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold tracking-[0.2em] text-gray-500 mb-3 uppercase">{item.step}</span>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <motion.div
            {...fadeIn}
            className="mt-20 bg-gradient-to-r from-[#00d4ff]/10 via-[#7c3aed]/10 to-[#00d4ff]/10 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-sm"
          >
            <BarChart3 className="w-10 h-10 text-[#7c3aed] mx-auto mb-4" />
            <h3 className="text-2xl lg:text-3xl font-bold mb-3">Ready to run your first event?</h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">Join organizers who have already switched to friction-free check-ins.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-[0_0_30px_rgba(124,58,237,0.4)] group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#060611] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
              <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">NexAttend</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">Secure, private, lightning-fast event check-ins. No hardware. No apps. Just your phone.</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/events" className="hover:text-white transition-colors">Explore Events</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Manager Portal</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Features</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2"><QrCode className="w-3.5 h-3.5" /> QR Tickets</li>
              <li className="flex items-center gap-2"><ScanLine className="w-3.5 h-3.5" /> Live Scanner</li>
              <li className="flex items-center gap-2"><Download className="w-3.5 h-3.5" /> CSV / Excel Export</li>
              <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> No Biometrics</li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Trust</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> No biometric data</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> No third-party tracking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Encrypted passwords</li>
              <li className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-[#00d4ff]" /> Unlimited attendees</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 py-6 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600">
            <p>© {new Date().getFullYear()} NexAttend Events. All rights reserved.</p>
            <p>Powered by Team NexAttend &mdash; Built with ❤️</p>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
