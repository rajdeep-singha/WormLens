// src/App.tsx
"use client";
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@components/layout/Header';
import { Footer } from '@components/layout/Footer';
import Home from '@pages/Home';
import Dashboard from '@pages/Dashboard';
import Wallet from '@pages/Wallet';
import Compare from '@pages/Compare';
import { TamboProvider } from "@tambo-ai/react";
import { MessageThreadCollapsible } from "@components/tambo/message-thread-collapsible";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});
const apiKey = import.meta.env.VITE_TAMBO_API_KEY;
if (!apiKey) {
  throw new Error('Missing Tambo API key!');
}
function AppLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-wh-bg-dark text-wh-text-primary">
      {/* Header is hidden on home page for immersive experience */}
      {!isHomePage && <Header />}
      
      <main className={isHomePage ? 'flex-1' : 'flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </main>
      
      {/* Footer is hidden on home page */}
      {!isHomePage && <Footer />}
    </div>
  );
}

function App() {
  return (
    
      
   <TamboProvider apiKey={import.meta.env.VITE_TAMBO_API_KEY!}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
         <MessageThreadCollapsible />
        {/* <MessageThreadCollapsible /> */}
      </BrowserRouter>
    </QueryClientProvider>
    </TamboProvider>
     
  );
}

export default App;
