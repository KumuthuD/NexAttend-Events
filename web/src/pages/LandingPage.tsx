import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ClipboardList, QrCode, Download, CalendarPlus, UserCheck, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col font-sans overflow-x-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#7c3aed]/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00d4ff]/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Navbar */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto p-6 z-10">
        <div className="flex z-10 relative">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="NexAttend Logo" className="w-8 h-8 object-contain" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
              NexAttend Events
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-8 items-center text-sm font-medium">
          <Link to="/events" className="hover:text-[#00d4ff] transition-colors">Explore Events</Link>
          <Link to="/dashboard" className="hover:text-[#00d4ff] transition-colors">Dashboard</Link>
          <Link to="/login" className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">Login</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center z-10">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Seamless Event Check-In,<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
                Powered by QR
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Create events, register participants, scan QR codes, export attendance — all in one platform. No biometric data required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-xl font-medium text-lg shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-shadow">
                Get Started
              </Link>
              <Link to="/events" className="px-8 py-4 border border-white/20 bg-white/5 backdrop-blur rounded-xl font-medium text-lg hover:bg-white/10 transition-colors">
                Explore Events
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ClipboardList className="w-8 h-8 text-[#00d4ff]" />}
              title="Custom Registration Forms"
              description="Build dynamic forms with text, dropdowns, and checkboxes to collect exactly the info you need."
              delay={0.1}
            />
            <FeatureCard 
              icon={<QrCode className="w-8 h-8 text-[#7c3aed]" />}
              title="Instant QR Codes"
              description="Automatically generate and email unique QR codes to participants upon successful registration."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Download className="w-8 h-8 text-[#00d4ff]" />}
              title="One-Click Export"
              description="Download complete attendance sheets in CSV or Excel format right after your event ends."
              delay={0.3}
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid sm:grid-cols-4 gap-8 relative">
            <div className="hidden sm:block absolute top-6 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#00d4ff]/20 to-[#7c3aed]/20" />
            <Step number="1" icon={<CalendarPlus />} title="Create Event" desc="Set details and build your form" delay={0.1} />
            <Step number="2" icon={<UserCheck />} title="Share Link" desc="Participants register online" delay={0.2} />
            <Step number="3" icon={<QrCode />} title="Scan QR" desc="Scan tickets at the entrance" delay={0.3} />
            <Step number="4" icon={<CheckCircle2 />} title="Export Data" desc="Get your attendance list" delay={0.4} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>A sub-project by Team NexAttend</p>
          <p className="mt-2">© {new Date().getFullYear()} NexAttend Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md hover:bg-white/10 transition-colors"
  >
    <div className="bg-[#0a0a1a] w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg border border-white/5">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

const Step = ({ number, icon, title, desc, delay }: { number: string, icon: React.ReactNode, title: string, desc: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="flex flex-col items-center text-center relative z-10"
  >
    <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] rounded-full flex items-center justify-center text-xl font-bold font-mono mb-6 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
      {number}
    </div>
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full backdrop-blur-sm">
      <div className="text-gray-300 flex justify-center mb-4">
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-8 h-8 opacity-80' })}
      </div>
      <h4 className="font-semibold text-lg mb-2">{title}</h4>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  </motion.div>
);

export default LandingPage;
