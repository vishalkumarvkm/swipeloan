import { LeadProfile, DispositionLog, EscalationTicket, CallbackRecord, ApplicationLinkRecord, AgentId } from '../agents/types';

export const INITIAL_LEADS: LeadProfile[] = [
  {
    leadId: 'LEAD-9041',
    name: 'Rajesh Kumar',
    phone: '9876543210',
    employmentType: 'salaried',
    requestedProduct: 'Personal Loan',
    stalledStep: 'KYC Document Verification (PAN / Aadhaar)',
    maskedPan: 'ABCDE****F',
    maskedAadhaar: 'xxxx-xxxx-4417',
    lastActive: '10 mins ago'
  },
  {
    leadId: 'LEAD-8812',
    name: 'Priya Sharma',
    phone: '9123456789',
    employmentType: 'self-employed',
    requestedProduct: 'Business Loan',
    stalledStep: 'Bank Offer Comparison',
    maskedPan: 'PQRSW****G',
    maskedAadhaar: 'xxxx-xxxx-8812',
    lastActive: '1 hour ago'
  },
  {
    leadId: 'LEAD-7734',
    name: 'Amit Patel',
    phone: '9988776655',
    employmentType: 'salaried',
    requestedProduct: 'Instant Loan',
    stalledStep: 'App Download & Eligibility Check',
    maskedPan: 'XYZAB****K',
    maskedAadhaar: 'xxxx-xxxx-1290',
    lastActive: '30 mins ago'
  }
];

export interface CRMState {
  activeLead: LeadProfile;
  leads: LeadProfile[];
  dispositions: DispositionLog[];
  escalations: EscalationTicket[];
  callbacks: CallbackRecord[];
  applicationLinks: ApplicationLinkRecord[];
  toolLogs: { timestamp: string; toolName: string; agentId: AgentId; args: any; response: any }[];
}

let state: CRMState = {
  activeLead: INITIAL_LEADS[0],
  leads: INITIAL_LEADS,
  dispositions: [],
  escalations: [],
  callbacks: [],
  applicationLinks: [],
  toolLogs: []
};

type Listener = () => void;
const listeners = new Set<Listener>();

export const crmStore = {
  getState: (): CRMState => state,
  
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  setActiveLead: (leadId: string) => {
    const found = state.leads.find(l => l.leadId === leadId);
    if (found) {
      state = { ...state, activeLead: found };
      listeners.forEach(l => l());
    }
  },

  // Tool Call Handlers
  executeTool: (agentId: AgentId, name: string, args: any) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let response: any = { success: true };

    const currentLead = state.activeLead;
    const leadId = args.lead_id || currentLead.leadId;

    switch (name) {
      case 'lookup_lead':
        response = {
          success: true,
          lead: {
            lead_id: currentLead.leadId,
            name: currentLead.name,
            phone_masked: `******${currentLead.phone.slice(-4)}`,
            employment_type: currentLead.employmentType,
            requested_product: currentLead.requestedProduct,
            stalled_step: currentLead.stalledStep,
            masked_pan: currentLead.maskedPan,
            masked_aadhaar: currentLead.maskedAadhaar
          }
        };
        break;

      case 'capture_lead':
        const newLeadId = `LEAD-${Math.floor(1000 + Math.random() * 9000)}`;
        const capturedLead: LeadProfile = {
          leadId: newLeadId,
          name: args.name || 'Website Visitor',
          phone: args.mobile || '9999999999',
          employmentType: 'salaried',
          requestedProduct: args.loan_type || 'Personal Loan',
          stalledStep: 'Captured from Website Voice Assistant',
          lastActive: 'Just now'
        };
        state = {
          ...state,
          leads: [capturedLead, ...state.leads],
          activeLead: capturedLead
        };
        response = {
          success: true,
          lead_id: newLeadId,
          message: `Visitor details for ${args.name} saved successfully.`
        };
        break;

      case 'generate_application_link':
        const secureUrl = `https://swipeloan.in/app/apply?lead=${leadId}&product=${encodeURIComponent(args.product_type || currentLead.requestedProduct)}`;
        const linkRecord: ApplicationLinkRecord = {
          id: `LINK-${Date.now().toString().slice(-5)}`,
          leadId,
          productType: args.product_type || currentLead.requestedProduct,
          secureUrl,
          sentAt: timestamp
        };
        state = { ...state, applicationLinks: [linkRecord, ...state.applicationLinks] };
        response = {
          success: true,
          message: `Application link sent to caller via SMS to registered mobile number ending in ${currentLead.phone.slice(-4)}.`,
          secure_url_masked: `https://swipeloan.in/app/...`
        };
        break;

      case 'schedule_callback':
        const callbackRecord: CallbackRecord = {
          id: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
          agentId,
          leadId,
          date: args.date || 'Tomorrow',
          timeWindow: args.time_window || '10:00 AM - 12:00 PM',
          languagePref: args.language_pref || 'Hindi',
          scheduledAt: timestamp
        };
        state = { ...state, callbacks: [callbackRecord, ...state.callbacks] };
        response = {
          success: true,
          callback_id: callbackRecord.id,
          message: `Loan Specialist callback scheduled for ${callbackRecord.date} during ${callbackRecord.timeWindow}.`
        };
        break;

      case 'update_disposition':
        const dispositionLog: DispositionLog = {
          id: `DISP-${Date.now().toString().slice(-6)}`,
          agentId,
          leadId,
          dispositionValue: args.disposition_value,
          notes: args.notes || 'Call disposition recorded successfully',
          timestamp
        };
        state = { ...state, dispositions: [dispositionLog, ...state.dispositions] };
        response = {
          success: true,
          disposition_id: dispositionLog.id,
          logged_value: args.disposition_value
        };
        break;

      case 'record_consent':
        response = {
          success: true,
          consent_logged: true,
          type: args.consent_type,
          granted: args.granted
        };
        break;

      case 'create_escalation':
        const escalation: EscalationTicket = {
          ticketId: `ESC-${Math.floor(100000 + Math.random() * 900000)}`,
          agentId,
          leadId,
          customerName: currentLead.name,
          phone: currentLead.phone,
          reason: args.reason,
          priority: (args.priority as any) || 'HIGH',
          createdAt: timestamp,
          status: 'OPEN'
        };
        state = { ...state, escalations: [escalation, ...state.escalations] };
        response = {
          success: true,
          ticket_id: escalation.ticketId,
          message: `Escalation ticket ${escalation.ticketId} created and assigned to Senior Grievance Specialist.`
        };
        break;

      case 'check_calling_window':
        response = {
          success: true,
          allowed: true,
          calling_window: '09:00 AM - 07:00 PM IST',
          reason: 'Current timestamp is inside compliant calling hours.'
        };
        break;

      case 'log_call_attempt':
        response = {
          success: true,
          outcome_logged: args.outcome
        };
        break;

      default:
        response = { success: true, message: 'Tool executed successfully.' };
    }

    state.toolLogs = [{ timestamp, toolName: name, agentId, args, response }, ...state.toolLogs.slice(0, 49)];
    listeners.forEach(l => l());
    return response;
  }
};
