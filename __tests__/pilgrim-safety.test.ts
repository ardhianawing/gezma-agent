import { describe, it, expect } from 'vitest';

// SOS contacts data (mirrors the component)
const SOS_CONTACTS = [
  { name: 'Ambulans Saudi', phone: '997', emoji: '\u{1F691}' },
  { name: 'Polisi Saudi', phone: '999', emoji: '\u{1F46E}' },
  { name: 'Pemadam Kebakaran', phone: '998', emoji: '\u{1F692}' },
  { name: 'KJRI Jeddah', phone: '+96612667602', emoji: '\u{1F1EE}\u{1F1E9}' },
  { name: 'KBRI Riyadh', phone: '+966114882800', emoji: '\u{1F1EE}\u{1F1E9}' },
  { name: 'Kemenag RI', phone: '1500225', emoji: '\u{1F4DE}' },
];

describe('Pilgrim Safety - SOS Contacts', () => {
  it('should have at least 5 emergency contacts', () => {
    expect(SOS_CONTACTS.length).toBeGreaterThanOrEqual(5);
  });

  it('should have all required fields for each contact', () => {
    for (const contact of SOS_CONTACTS) {
      expect(contact.name).toBeTruthy();
      expect(contact.phone).toBeTruthy();
      expect(contact.emoji).toBeTruthy();
    }
  });

  it('should have dialable phone numbers (no spaces)', () => {
    for (const contact of SOS_CONTACTS) {
      expect(contact.phone).not.toContain(' ');
    }
  });

  it('should include ambulance service', () => {
    const ambulance = SOS_CONTACTS.find(c => c.name.toLowerCase().includes('ambulans'));
    expect(ambulance).toBeDefined();
    expect(ambulance?.phone).toBe('997');
  });

  it('should include police service', () => {
    const police = SOS_CONTACTS.find(c => c.name.toLowerCase().includes('polisi'));
    expect(police).toBeDefined();
    expect(police?.phone).toBe('999');
  });

  it('should include Indonesian embassy/consulate', () => {
    const indo = SOS_CONTACTS.filter(c => c.name.includes('KBRI') || c.name.includes('KJRI'));
    expect(indo.length).toBeGreaterThanOrEqual(2);
  });

  it('should have valid international phone format for embassies', () => {
    const embassies = SOS_CONTACTS.filter(c => c.phone.startsWith('+'));
    expect(embassies.length).toBeGreaterThanOrEqual(2);
    for (const embassy of embassies) {
      expect(embassy.phone).toMatch(/^\+[0-9]+$/);
    }
  });
});
