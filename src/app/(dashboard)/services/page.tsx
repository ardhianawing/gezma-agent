'use client';

import { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  Zap,
} from 'lucide-react';
import {
  services,
  serviceCategories,
  faqs,
  contactInfo,
} from '@/data/mock-services';

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(s => s.category === activeCategory);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>

      {/* HEADER */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>Layanan</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
          Pusat bantuan dan layanan eksklusif untuk anggota GEZMA
        </p>
      </div>

      {/* QUICK CONTACT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { icon: MessageCircle, label: 'Live Chat', sublabel: 'Online 24/7', color: '#059669', bg: '#D1FAE5', action: 'Mulai Chat' },
          { icon: Phone, label: 'WhatsApp', sublabel: contactInfo.whatsapp, color: '#16A34A', bg: '#DCFCE7', action: 'Hubungi' },
          { icon: Mail, label: 'Email', sublabel: contactInfo.email, color: '#2563EB', bg: '#DBEAFE', action: 'Kirim Email' },
          { icon: Phone, label: 'Telepon', sublabel: contactInfo.phone, color: '#7C3AED', bg: '#EDE9FE', action: 'Telepon' },
        ].map((contact, index) => {
          const Icon = contact.icon;
          return (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = contact.color;
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', backgroundColor: contact.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
              }}>
                <Icon style={{ width: '22px', height: '22px', color: contact.color }} />
              </div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                {contact.label}
              </p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0' }}>
                {contact.sublabel}
              </p>
              <span style={{
                fontSize: '12px', fontWeight: '600', color: contact.color,
                display: 'inline-flex', alignItems: 'center', gap: '4px',
              }}>
                {contact.action}
                <ExternalLink style={{ width: '12px', height: '12px' }} />
              </span>
            </div>
          );
        })}
      </div>

      {/* SERVICES SECTION */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Layanan & Fitur
          </h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
                border: activeCategory === 'all' ? '2px solid #DC2626' : '1px solid #E5E7EB',
                backgroundColor: activeCategory === 'all' ? '#FEF2F2' : 'white',
                color: activeCategory === 'all' ? '#DC2626' : '#6B7280',
                cursor: 'pointer',
              }}
            >
              Semua
            </button>
            {serviceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
                  border: activeCategory === cat.id ? `2px solid ${cat.color}` : '1px solid #E5E7EB',
                  backgroundColor: activeCategory === cat.id ? cat.color + '12' : 'white',
                  color: activeCategory === cat.id ? cat.color : '#6B7280',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {filteredServices.map((service) => {
            const cat = serviceCategories.find(c => c.id === service.category);
            return (
              <div
                key={service.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Badges */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px' }}>
                  {service.isNew && (
                    <span style={{
                      fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: '#059669', color: 'white', textTransform: 'uppercase',
                    }}>
                      New
                    </span>
                  )}
                  {service.isPremium && (
                    <span style={{
                      fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: '#D97706', color: 'white', textTransform: 'uppercase',
                      display: 'inline-flex', alignItems: 'center', gap: '2px',
                    }}>
                      <Star style={{ width: '8px', height: '8px' }} /> Premium
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{service.icon}</div>

                <span style={{
                  fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                  backgroundColor: (cat?.color || '#6B7280') + '15',
                  color: cat?.color || '#6B7280',
                }}>
                  {cat?.label}
                </span>

                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '10px 0 8px 0' }}>
                  {service.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ + CONTACT INFO */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* FAQ */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>
            Pertanyaan Umum (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {faqs.map((faq) => (
              <div
                key={faq.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: expandedFaq === faq.id ? '#F9FAFB' : 'white',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span style={{
                      fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                      backgroundColor: '#F3F4F6', color: '#6B7280',
                    }}>
                      {faq.category}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {faq.question}
                    </span>
                  </div>
                  {expandedFaq === faq.id ? (
                    <ChevronUp style={{ width: '18px', height: '18px', color: '#9CA3AF', flexShrink: 0 }} />
                  ) : (
                    <ChevronDown style={{ width: '18px', height: '18px', color: '#9CA3AF', flexShrink: 0 }} />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div style={{ padding: '0 20px 16px 20px' }}>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: '1.6' }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info Card */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>
            Informasi Kontak
          </h2>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#DBEAFE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <MapPin style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', margin: '0 0 4px 0' }}>Alamat</p>
                  <p style={{ fontSize: '13px', color: '#111827', margin: 0, lineHeight: '1.5' }}>
                    {contactInfo.address}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#D1FAE5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Clock style={{ width: '18px', height: '18px', color: '#059669' }} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', margin: '0 0 4px 0' }}>Jam Operasional</p>
                  <p style={{ fontSize: '13px', color: '#111827', margin: 0 }}>
                    {contactInfo.operationalHours}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FEF3C7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Zap style={{ width: '18px', height: '18px', color: '#D97706' }} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', margin: '0 0 4px 0' }}>Response Time</p>
                  <p style={{ fontSize: '13px', color: '#111827', margin: 0 }}>
                    Live Chat: Instan<br />
                    Email: 1x24 jam kerja
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
              <button style={{
                width: '100%', padding: '12px', backgroundColor: '#DC2626', color: 'white',
                fontSize: '14px', fontWeight: '600', borderRadius: '8px', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <MessageCircle style={{ width: '18px', height: '18px' }} />
                Mulai Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
