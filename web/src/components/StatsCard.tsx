import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00d4ff]/10 to-[#7c3aed]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-opacity-20 transition-all" />
      
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-[#0a0a1a] p-3 rounded-xl shadow-lg border border-white/5 text-[#00d4ff]">
          {icon}
        </div>
        <h3 className="text-gray-400 font-medium">{label}</h3>
      </div>
      
      <div className="text-4xl font-bold">
        {value}
      </div>
    </motion.div>
  );
};

export default StatsCard;
