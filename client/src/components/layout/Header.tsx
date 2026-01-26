// src/components/layout/Header.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, TrendingUp } from 'lucide-react';
import { GradientText } from '@components/ui/GradientText';
import { Button } from '@components/ui/Button';
import clsx from 'clsx';

const navLinks = [
  { path: '/', label: 'Dashboard' },
  { path: '/wallet', label: 'Wallet' },
  { path: '/compare', label: 'Compare' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-wh-bg-dark/95 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-wh-gradient rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-wh-gradient p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <GradientText className="text-xl font-bold">
                Multichain Lending
              </GradientText>
              <span className="text-xs text-wh-text-muted -mt-1">
                Powered by Wormhole
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.path} to={link.path} className="relative px-4 py-2">
                  <span
                    className={clsx(
                      'transition-colors duration-200',
                      isActive
                        ? 'text-wh-text-primary'
                        : 'text-wh-text-secondary hover:text-wh-text-primary'
                    )}
                  >
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-wh-gradient"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://wormhole.com', '_blank')}
            >
              About Wormhole
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.open('https://github.com', '_blank')}
            >
              View on GitHub
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-wh-text-secondary hover:text-wh-text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-gray-800 bg-wh-bg-card"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'block px-4 py-3 rounded-wh transition-colors',
                    isActive
                      ? 'bg-wh-gradient text-white'
                      : 'text-wh-text-secondary hover:bg-wh-bg-card-hover hover:text-wh-text-primary'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 space-y-2">
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => {
                  window.open('https://wormhole.com', '_blank');
                  setMobileMenuOpen(false);
                }}
              >
                About Wormhole
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  window.open('https://github.com', '_blank');
                  setMobileMenuOpen(false);
                }}
              >
                View on GitHub
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}