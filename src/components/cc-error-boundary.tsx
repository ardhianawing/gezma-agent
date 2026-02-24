'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const CC_BLUE = '#2563EB';
const CC_BLUE_LIGHT = '#EFF6FF';

export class CCErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CCErrorBoundary caught:', error, errorInfo);
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
            backgroundColor: CC_BLUE_LIGHT,
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
            Terjadi Kesalahan Sistem
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#64748B',
            margin: '0 0 24px 0',
            maxWidth: '400px',
            lineHeight: 1.5,
          }}>
            Terjadi kesalahan pada Command Center. Silakan muat ulang halaman atau hubungi tim teknis jika masalah berlanjut.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 32px',
              backgroundColor: CC_BLUE,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Muat Ulang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
