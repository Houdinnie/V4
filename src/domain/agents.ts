import { AgentConfig } from './types.ts';

export const AGENTS: Record<string, AgentConfig> = {
  ideator: {
    id: 'ideator',
    name: 'Ideator & Strategist',
    tagline: 'Startup validation & business planning',
    description: 'Master business model canvas, market sizing, and competitive moat analysis.',
    icon: 'Lightbulb',
    placeholder: 'Tell me about your business idea...',
    suggestedPrompts: [
      'Validate my idea for a SaaS in the legal space.',
      'How do I calculate SAM and SOM for an e-commerce brand?',
      'Suggest a business model for a luxury concierge app.'
    ],
    systemInstruction: 'You are the VentureMind Ideator & Strategist. You specialize in startup validation, business model design, and strategic planning. Focus on lean methodology, scalability, and defensibility.'
  },
  legal: {
    id: 'legal',
    name: 'Legal & Global Counsel',
    tagline: 'Entity formation & citizenship',
    description: 'Expert advice on Delaware C-Corps, Singapore holdcos, and multi-jurisdictional compliance.',
    icon: 'Gavel',
    placeholder: 'Ask about entity formation or compliance...',
    suggestedPrompts: [
      'Compare Delaware C-Corp vs. Singapore Pte Ltd.',
      'What are the requirements for a Cayman holding company?',
      'Explain the basics of a SAFE agreement.'
    ],
    systemInstruction: 'You are the VentureMind Legal & Global Counsel. You provide high-level educational information on international entity formation, corporate law, and citizenship-by-investment. Note: You are an AI, not a lawyer.'
  },
  nomad: {
    id: 'nomad',
    name: 'Nomad Navigator',
    tagline: 'Offshore banking & global finance',
    description: 'Unlock access to international banking, multi-currency accounts, and payment rails.',
    icon: 'Globe',
    placeholder: 'Ask about offshore banking or nomad finance...',
    suggestedPrompts: [
      'Best countries for a digital nomad banking setup.',
      'How to open a business bank account as a non-resident?',
      'Compare Wise vs. Mercury for international founders.'
    ],
    systemInstruction: 'You are the VentureMind Nomad Navigator. You help digital nomads and global founders navigate international finance, offshore banking, and payment systems.'
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury Optimizer',
    tagline: 'Jet deals & travel hacking',
    description: 'Exclusive insights on empty-leg private jets, first-class upgrades, and membership clubs.',
    icon: 'Plane',
    placeholder: 'Ask about luxury travel hacks...',
    suggestedPrompts: [
      'How to find empty-leg private jet deals?',
      'Best luxury travel memberships for frequent flyers.',
      'Tips for business class upgrades on long-haul flights.'
    ],
    systemInstruction: 'You are the VentureMind Luxury Optimizer. You specialize in maximizing luxury travel experiences, finding elite deals, and navigating the world of private aviation and premium hospitality.'
  },
  hotel: {
    id: 'hotel',
    name: 'Hotel Concierge',
    tagline: 'Luxury hospitality & negotiations',
    description: 'Negotiate extended stays and unlock hidden perks at the world’s best hotels.',
    icon: 'Hotel',
    placeholder: 'Which hotel or stay can I help with?',
    suggestedPrompts: [
      'How to negotiate a discount for a 3-month stay at an Aman?',
      'Compare Four Seasons vs. Rosewood perks.',
      'Top 5 digital nomad-friendly luxury hotels in Bali.'
    ],
    systemInstruction: 'You are the VentureMind Hotel Concierge. You provide expert advice on luxury hospitality, negotiating extended stays, and understanding high-end hotel ecosystems.'
  },
  fundraising: {
    id: 'fundraising',
    name: 'Fundraising & IR',
    tagline: 'Pitch coaching & term sheets',
    description: 'Get ready for your Pre-Seed, Seed, or Series A. Term sheet analysis and cap table modeling.',
    icon: 'TrendingUp',
    placeholder: 'Ask about pitch decks or term sheets...',
    suggestedPrompts: [
      'Review my pitch deck outline for a Seed round.',
      'What are standard liquidation preference terms?',
      'How to model a 15% option pool pre-money?'
    ],
    systemInstruction: 'You are the VentureMind Fundraising & IR expert. You coach founders on investor relations, pitch mastery, and the technicalities of venture capital term sheets.'
  },
  tax: {
    id: 'tax',
    name: 'Tax & Accounting',
    tagline: 'International tax strategy',
    description: 'Navigate global VAT/GST, crypto taxation, and tax-efficient residency programs.',
    icon: 'Calculator',
    placeholder: 'Ask about tax strategy or compliance...',
    suggestedPrompts: [
      'Explain the territorial tax system of Panama.',
      'How is crypto taxed in Portugal for nomads?',
      'VAT implications for selling digital products globally.'
    ],
    systemInstruction: 'You are the VentureMind Tax & Accounting strategist. You provide high-level insights into international tax efficiency, cross-border compliance, and modern asset classes. Not financial or tax advice.'
  },
  visa: {
    id: 'visa',
    name: 'Visa & Immigration',
    tagline: 'Digital nomad & golden visas',
    description: 'In-depth guide to UAE Golden Visas, Portugal D7/D8, and Caribbean passports.',
    icon: 'FileText',
    placeholder: 'Ask about visas or residency programs...',
    suggestedPrompts: [
      'Requirements for the UAE Golden Visa for founders.',
      'Compare Portugal D7 vs. D8 visa.',
      'Fastest way to get a Caribbean passport via investment.'
    ],
    systemInstruction: 'You are the VentureMind Visa & Immigration specialist. You guide users through the complexities of global residency, digital nomad visas, and citizenship programs.'
  },
  wealth: {
    id: 'wealth',
    name: 'Wealth & Investment',
    tagline: 'Portfolio & private equity',
    description: 'Insights on alternative assets, art investment, and wealth preservation strategies.',
    icon: 'Briefcase',
    placeholder: 'Ask about investments or wealth preservation...',
    suggestedPrompts: [
      'Explain the role of private equity in HNW portfolios.',
      'Diversification strategies using alternative assets.',
      'Basics of wealth preservation for sudden liquidity events.'
    ],
    systemInstruction: 'You are the VentureMind Wealth & Investment consultant. You focus on high-net-worth wealth management strategies, private equity basics, and alternative investment insights.'
  },
  branding: {
    id: 'branding',
    name: 'PR & Brand Builder',
    tagline: 'Press & founder branding',
    description: 'Build your personal brand. Advice on press releases and media appearance strategies.',
    icon: 'Megaphone',
    placeholder: 'How can I build my founder brand?',
    suggestedPrompts: [
      'Draft a press release for my product launch.',
      'How to land features in Forbes or TechCrunch?',
      'Best LinkedIn strategy for a B2B founder.'
    ],
    systemInstruction: 'You are the VentureMind PR & Brand Builder. You help founders craft compelling narratives, build authority, and navigate the media landscape.'
  }
};

export const AGENT_LIST = Object.values(AGENTS);
