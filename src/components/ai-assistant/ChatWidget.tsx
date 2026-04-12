'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  'Apa itu GEZMA?',
  'Fitur apa saja yang tersedia?',
  'Bagaimana cara pakai Marketplace?',
  'Cara menghitung HPP?',
];

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Halo! Saya GEZMA Assistant. Saya siap membantu Anda dengan informasi seputar platform GEZMA, operasional travel umrah, regulasi, dan lainnya. Ada yang bisa saya bantu?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Mohon maaf, terjadi kesalahan. Silakan coba lagi dalam beberapa saat.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Mohon maaf, tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const resetChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Halo! Saya GEZMA Assistant. Saya siap membantu Anda dengan informasi seputar platform GEZMA, operasional travel umrah, regulasi, dan lainnya. Ada yang bisa saya bantu?',
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Chat Panel — slides in from the right, anchored below the header */}
      <div
        style={{
          position: 'fixed',
          top: '72px',
          right: '16px',
          width: '400px',
          height: 'calc(100vh - 88px)',
          maxHeight: '600px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 40,
          animation: 'chatSlideIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: 'white', margin: 0 }}>
                GEZMA Assistant
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: '2px 0 0 0' }}>
                Powered by AI
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={resetChat}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Reset chat"
            >
              <RefreshCw style={{ width: '16px', height: '16px', color: 'white' }} />
            </button>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X style={{ width: '18px', height: '18px', color: 'white' }} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#F9FAFB',
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: '10px',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: message.role === 'user' ? '#374151' : '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {message.role === 'user' ? (
                  <User style={{ width: '16px', height: '16px', color: 'white' }} />
                ) : (
                  <Bot style={{ width: '16px', height: '16px', color: 'white' }} />
                )}
              </div>

              {/* Bubble */}
              <div
                style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: message.role === 'user' ? '#374151' : 'white',
                  color: message.role === 'user' ? 'white' : '#111827',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  boxShadow: message.role === 'assistant' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.content}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot style={{ width: '16px', height: '16px', color: 'white' }} />
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Loader2
                  style={{
                    width: '16px',
                    height: '16px',
                    color: '#9CA3AF',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Mengetik...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions (only show when few messages) */}
        {messages.length <= 2 && !isLoading && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: 'white',
              flexShrink: 0,
            }}
          >
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', margin: '0 0 8px 0' }}>
              PERTANYAAN CEPAT
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: 'white',
                    fontSize: '12px',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                    e.currentTarget.style.borderColor = '#DC2626';
                    e.currentTarget.style.color = '#DC2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.color = '#374151';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '16px',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: 'white',
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan..."
            disabled={isLoading}
            style={{
              flex: 1,
              height: '44px',
              padding: '0 16px',
              borderRadius: '22px',
              border: '1px solid #E5E7EB',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: isLoading ? '#F9FAFB' : 'white',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: input.trim() && !isLoading ? '#DC2626' : '#E5E7EB',
              border: 'none',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s',
            }}
          >
            <Send
              style={{
                width: '18px',
                height: '18px',
                color: input.trim() && !isLoading ? 'white' : '#9CA3AF',
              }}
            />
          </button>
        </form>
      </div>

      {/* CSS for spinner + slide-in animations */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
