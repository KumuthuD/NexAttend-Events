import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col items-center justify-center px-6 overflow-hidden font-sans relative">
      {/* Background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#7c3aed]/15 blur-[140px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00d4ff]/10 blur-[140px] rounded-full mix-blend-screen pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 max-w-lg"
      >
        {/* 404 number */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-[10rem] font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] select-none mb-4"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          404
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-20 h-20 mx-auto mb-8 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center"
        >
          <Compass className="w-10 h-10 text-gray-400" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-400 text-lg mb-12 leading-relaxed">
          The page you're looking for has been moved, deleted, or never existed.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(124,58,237,0.3)]"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-8 py-4 border border-white/20 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors backdrop-blur-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
