import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'

if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark')
const initialLanguage = localStorage.getItem('language') === 'ar' ? 'ar' : 'en'
document.documentElement.lang = initialLanguage
document.documentElement.dir = initialLanguage === 'ar' ? 'rtl' : 'ltr'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: (count, error) => !(error && 'status' in error && error.status === 403) && count < 1 },
    mutations: { retry: false },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter><App/></BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
