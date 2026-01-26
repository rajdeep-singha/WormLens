// src/components/layout/Footer.tsx
import { Github, Twitter, Globe } from 'lucide-react';
import { GradientText } from '@components/ui/GradientText';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-wh-bg-dark mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <GradientText className="text-lg font-bold mb-3">
              Multichain Lending Analytics
            </GradientText>
            <p className="text-sm text-wh-text-secondary">
              Cross-chain lending rate comparison powered by Wormhole Queries.
              Compare rates, analyze positions, and find the best opportunities
              across Aave, Solend, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-wh-text-primary font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://wormhole.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wh-text-secondary hover:text-wh-primary-start transition-colors"
                >
                  Wormhole Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://aave.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wh-text-secondary hover:text-wh-primary-start transition-colors"
                >
                  Aave Protocol
                </a>
              </li>
              <li>
                <a
                  href="https://solend.fi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wh-text-secondary hover:text-wh-primary-start transition-colors"
                >
                  Solend Protocol
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-wh-text-primary font-semibold mb-3">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wh-text-secondary hover:text-wh-primary-start transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wh-text-secondary hover:text-wh-primary-start transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://wormhole.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wh-text-secondary hover:text-wh-primary-start transition-colors"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm text-wh-text-muted">
          <p>
            © {currentYear} Multichain Lending Analytics. Built with{' '}
            <span className="text-wh-primary-start">Wormhole Queries</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}



