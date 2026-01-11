import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
