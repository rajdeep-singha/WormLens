// src/pages/Home.tsx
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Globe, TrendingUp, Layers, BarChart3 } from 'lucide-react';
import  DotGrid  from '@components/ui/DotGrid';
import { GradientText } from '@components/ui/GradientText';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Cross-Chain Analytics',
      description: 'Real-time data from Ethereum, Polygon, Arbitrum, and Solana in one unified dashboard.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Best Rate Discovery',
      description: 'Find optimal lending and borrowing rates across Aave, Solend, and other protocols.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Risk Assessment',
      description: 'Comprehensive health factor analysis and liquidation risk monitoring.',
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Protocol Comparison',
      description: 'Side-by-side comparison of DeFi protocols with historical performance data.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'TVL Tracking',
      description: 'Monitor total value locked across chains and protocols in real-time.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Wormhole Powered',
      description: 'Leveraging Wormhole Queries for trustless cross-chain data aggregation.',
    },
  ];

  const stats = [
    { value: '$50B+', label: 'Total TVL Tracked' },
    { value: '4', label: 'Chains Supported' },
    { value: '10+', label: 'Protocols Integrated' },
    { value: 'Real-time', label: 'Data Updates' },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    },
  };

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  return (
    <div className="relative min-h-screen bg-wh-bg-dark overflow-hidden">
      {/* Dot Grid Background - Full Screen */}
      <DotGrid
        dotSize={5}
        gap={15}
        baseColor="#6F4FF2"
        activeColor="#A855F7"
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
      />

      {/* Radial gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,15,0.8)_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(111,79,242,0.15)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.1)_0%,transparent_50%)]" />

      {/* Floating Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-wh-gradient rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-wh-gradient p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <GradientText className="text-xl font-bold">
              WormLens
            </GradientText>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className="text-wh-text-secondary hover:text-wh-text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/wallet" 
              className="text-wh-text-secondary hover:text-wh-text-primary transition-colors"
            >
              Wallet
            </Link>
            <Link 
              to="/compare" 
              className="text-wh-text-secondary hover:text-wh-text-primary transition-colors"
            >
              Compare
            </Link>
          </nav>

          {/* CTA */}
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-wh-bg-card/50 border border-gray-700 hover:border-wh-primary-start/50 backdrop-blur-sm text-sm font-medium text-wh-text-primary transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Launch App
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wh-primary-start/10 border border-wh-primary-start/30 text-sm font-medium text-wh-primary-start backdrop-blur-sm">
              <Zap className="w-4 h-4" />
              Powered by Wormhole Queries
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            <span className="block text-wh-text-primary">Navigate the</span>
            <span className="block bg-gradient-to-r from-wh-primary-start via-purple-400 to-wh-primary-end bg-clip-text text-transparent">
              Multichain Universe
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-wh-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Your portal to cross-chain DeFi lending analytics. Compare rates, track positions, 
            and discover opportunities across multiple blockchains.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden shadow-glow-md hover:shadow-glow-lg transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-wh-gradient" />
              <div className="absolute inset-0 bg-wh-gradient-hover opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                Launch Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/wallet')}
              className="group px-8 py-4 rounded-xl font-semibold text-wh-text-primary bg-wh-bg-card/50 border border-gray-700 hover:border-wh-primary-start/50 hover:bg-wh-bg-card backdrop-blur-sm transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center gap-2">
                Track Wallet
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            variants={containerVariants}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                custom={index}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-wh-primary-start to-wh-primary-end bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-wh-text-muted mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-wh-text-muted"
          >
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-wh-text-muted/30 flex justify-center pt-2">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-wh-primary-start"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wh-text-primary mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-wh-text-secondary max-w-2xl mx-auto">
              Comprehensive tools to navigate the multichain DeFi landscape
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative p-6 rounded-2xl bg-wh-bg-card/50 border border-gray-800 hover:border-wh-primary-start/40 backdrop-blur-sm transition-all duration-300"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-wh-primary-start/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-wh-gradient flex items-center justify-center text-white mb-4 shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-wh-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-wh-text-secondary">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            variants={floatVariants}
            initial="initial"
            animate="animate"
            className="relative rounded-3xl p-[1px] overflow-hidden"
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-wh-primary-start via-purple-500 to-wh-primary-end animate-pulse" />
            
            <div className="relative rounded-3xl bg-wh-bg-dark p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-wh-text-primary mb-4">
                Ready to Explore?
              </h2>
              <p className="text-lg text-wh-text-secondary mb-8 max-w-xl mx-auto">
                Join the future of cross-chain DeFi analytics. Start comparing rates and tracking your positions now.
              </p>
              
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="group relative px-10 py-4 rounded-xl font-semibold text-white overflow-hidden shadow-glow-md hover:shadow-glow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-wh-gradient" />
                <div className="absolute inset-0 bg-wh-gradient-hover opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Footer spacing */}
      <div className="h-16" />
      
    </div>
    
  );
}
