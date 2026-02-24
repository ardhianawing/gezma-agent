'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const PILGRIM_GREEN = '#059669';
const PILGRIM_GREEN_LIGHT = '#ECFDF5';

export class PilgrimErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PilgrimErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: PILGRIM_GREEN_LIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            marginBottom: '20px',
          }}>
            {'\u26A0\uFE0F'}
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#0F172A',
            margin: '0 0 8px 0',
          }}>
            Terjadi Kesalahan
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#64748B',
            margin: '0 0 24px 0',
            maxWidth: '400px',
            lineHeight: 1.5,
          }}>
            Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi atau hubungi travel agent Anda jika masalah berlanjut.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 32px',
              backgroundColor: PILGRIM_GREEN,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
