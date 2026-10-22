export type AgentId = 'aanya-inbound' | 'aanya-website';

export interface AgentConfig {
  id: AgentId;
  name: string;
  role: string;
  channel: string;
  voiceName: string;
  avatarUrl: string;
  accentColor: string;
  greeting: string;
  systemInstruction: string;
  tools: any[];
}

export interface LeadProfile {
  leadId: string;
  name: string;
  phone: string;
  employmentType: 'salaried' | 'self-employed';
  requestedProduct: string;
  stalledStep?: string;
  maskedPan?: string;
  maskedAadhaar?: string;
  lastActive: string;
}

export interface DispositionLog {
  id: string;
  agentId: AgentId;
  leadId: string;
  dispositionValue: string;
  notes?: string;
  timestamp: string;
}

export interface EscalationTicket {
  ticketId: string;
  agentId: AgentId;
  leadId: string;
  customerName?: string;
  phone?: string;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
}

export interface CallbackRecord {
  id: string;
  agentId: AgentId;
  leadId: string;
  date: string;
  timeWindow: string;
  languagePref: string;
  scheduledAt: string;
}

export interface ApplicationLinkRecord {
  id: string;
  leadId: string;
  productType: string;
  secureUrl: string;
  sentAt: string;
}
