// src/components/AuditStepCard.tsx
import { motion } from "framer-motion";
import React from "react";

type AuditStepCardProps = {
  id: number;
  icon: string;      
  title: string;
  desc: string;
  delay?: number;
};

export default function AuditStepCard({
  id,
  icon,
  title,
  desc,
  delay = 0,
}: AuditStepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 duration-300 group"
    >
      <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full shadow animate-pulse">
        {id.toString().padStart(2, "0")}
      </div>

      <div
        className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner transition-transform duration-300 ease-out will-change-transform"
        onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
          const card = e.currentTarget;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          card.style.transform = `rotateX(${y / 30}deg) rotateY(${-x / 30}deg)`;
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.transform = "rotateX(0) rotateY(0)";
        }}
      >
        <img src={icon} alt={title} className="w-10 h-10" />
      </div>

      <h3 className="text-lg font-semibold mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}
