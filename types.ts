
export enum Mode {
  VIRAL = 'Viral',
  STORYTELLING = 'Storytelling',
  EDUCATIONAL = 'Educational',
  SALES = 'Sales',
  HUMOR = 'Humor',
  MINIMALIST = 'Minimalist',
  PROVOCATIVE = 'Provocative',
  EMPATHETIC = 'Empathetic',
  PROFESSIONAL = 'Professional',
  FOMO = 'FOMO Effect',
  UGC = 'UGC Style'
}

export enum Platform {
  INSTAGRAM = 'Instagram',
  TIKTOK = 'TikTok',
  LINKEDIN = 'LinkedIn',
  X = 'X',
  THREADS = 'Threads'
}

export enum ContentModality {
  PHOTO = 'Photo',
  VIDEO = 'Video'
}

export enum AccountType {
  PERSONAL = 'Personal',
  BUSINESS = 'Business',
  CREATOR = 'Creator'
}

export interface MagicEdit {
  title: string;
  description: string;
  visualPrompt: string; // The prompt to send to the image editor
  impact: string;
}

export interface CaptionOption {
  category: string;
  text: string;
  hashtags: string[];
  strategy: {
    hook: string;
    body: string;
    cta: string;
  };
  metrics: {
    visualImpact: number;
    hookStrength: number;
    retentionRate: number;
    viralScore: number;
  };
  analysis: {
    targetAudience: string;
    bestPostingTime: string;
    whyItWorks: string;
  };
  magicEditSuggestions: MagicEdit[];
}

export interface GenerationParams {
  image?: string; 
  idea?: string;
  accountType: AccountType;
  platform: Platform;
  modality: ContentModality;
  modes: Mode[];
  length: number; // 1-10
  language: string;
  emojiDensity: number; // 1-10
  communicationStyle?: string;
}
