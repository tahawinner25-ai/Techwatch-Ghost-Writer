export interface TrendChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  baseline?: number;
  unit?: string;
}

export interface TrendChartData {
  id: string;
  title: string;
  description?: string;
  type: "bar" | "line" | "area" | "radar" | "pie";
  metricLabel: string;
  secondaryMetricLabel?: string;
  data: TrendChartPoint[];
  topicRef?: string;
}

export interface Innovation {
  category: string;
  title: string;
  summary: string;
  impact: string;
  keyMetricOrFact?: string;
  sourceRef?: string;
  diagramCode?: string;
  diagramTitle?: string;
  diagramType?: "flowchart" | "sequence" | "timeline" | "mindmap" | "comparison" | "architecture";
  trendChart?: TrendChartData;
}

export interface NewsDiagram {
  id: string;
  title: string;
  type: "flowchart" | "sequence" | "timeline" | "mindmap" | "comparison" | "architecture";
  mermaidCode: string;
  description: string;
  topicRef?: string;
}

export interface RejectionReason {
  topic: string;
  reason: string;
}

export interface FilteringReport {
  totalItemsAnalyzed: number;
  rejectedItemsCount: number;
  rejectionReasons: RejectionReason[];
}

export interface LinkClickMetric {
  title: string;
  url: string;
  clicks: number;
  clickSharePct: number;
  lastClickedAt?: number;
}

export interface HourlyOpenData {
  hour: string;
  opens: number;
}

export interface TelemetryEvent {
  id: string;
  newsletterId: string;
  type: "OPEN" | "READ_DWELL" | "LINK_CLICK" | "EXPORT_PDF" | "COPY_HTML" | "COPY_MARKDOWN" | "SCHEDULE" | "SOCIAL_VISIT";
  timestamp: number;
  label: string;
  url?: string;
  device?: "desktop" | "mobile" | "tablet";
  readingTimeSeconds?: number;
  details?: Record<string, any>;
}

export interface RealTimeTelemetryData {
  totalRealOpens: number;
  totalRealClicks: number;
  totalRealDwellSeconds: number;
  actualCtrPct: number;
  activeReadersCount: number;
  recentEvents: TelemetryEvent[];
  linkClicksMap: Record<string, number>;
  lastEventTimestamp: number;
}

export interface NewsletterPerformanceMetrics {
  recipientsCount: number;
  deliveredCount: number;
  deliveryRate: number; // % (e.g., 99.4)
  openCount: number;
  openRate: number; // % (e.g., 54.2)
  uniqueClicksCount: number;
  clickRate: number; // CTR % (e.g., 16.8)
  clickToOpenRate: number; // CTOR % (e.g., 31.0)
  unsubscribesCount: number;
  unsubscribeRate: number; // % (e.g., 0.12)
  avgReadingTimeSeconds: number; // (e.g., 145)
  engagementScore: number; // 0 to 100
  topPerformingTopic: string;
  benchmarkStatus: "OUTSTANDING" | "ABOVE_AVERAGE" | "AVERAGE" | "NEEDS_OPTIMIZATION";
  linksMetrics: LinkClickMetric[];
  hourlyOpens: HourlyOpenData[];
  deviceBreakdown: {
    desktopPct: number;
    mobilePct: number;
    tabletPct: number;
  };
  lastCalculatedAt: number;
  realTelemetry?: RealTimeTelemetryData;
}

export interface TechKeywordTrend {
  keyword: string;
  category: "AI & ML" | "Architecture & Infra" | "Languages & Runtime" | "Sécurité & Crypto" | "Données & DB";
  count30d: number;
  densityPct: number; // % share of total tech mentions over 30 days
  previousCount30d: number;
  deltaPct: number; // e.g. +145% vs -12%
  trend: "EMERGING" | "ACCELERATING" | "ESTABLISHED" | "WANING";
  sparkline: number[]; // 4 weekly distribution points [w1, w2, w3, w4]
  occurrencesInNewsletters: Array<{
    id: string;
    subject: string;
    dateStr: string;
  }>;
  description: string;
}

export interface NewsletterResult {
  subject: string;
  preheader: string;
  editorialIntro: string;
  filteringReport: FilteringReport;
  innovations: Innovation[];
  takeaway: string;
  dateStr: string;
  html: string;
  sources?: Array<{ title: string; url: string }>;
  diagrams?: NewsDiagram[];
  trendCharts?: TrendChartData[];
  topicDomain?: string;
  timestamp?: number;
  id?: string;
  tags?: string[];
  performanceMetrics?: NewsletterPerformanceMetrics;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface DriveExportOptions {
  fileName: string;
  format: "html" | "markdown";
  description?: string;
}

export interface ScheduledNewsletter {
  id: string;
  newsletter: NewsletterResult;
  scheduledFor: string; // ISO string e.g. "2026-08-25T09:00:00"
  targetRecipientsGroup?: string;
  status: "PENDING" | "SENT" | "CANCELLED";
  googleCalendarEventId?: string;
  googleCalendarEventLink?: string;
  createdAt: number;
  notes?: string;
}

export type TemplateTheme = "slate" | "indigo" | "editorial" | "terminal";
export type TargetAudience = "CTO & Ingénieurs Seniors" | "Tech Leads & Développeurs" | "Chercheurs & R&D" | "Architectes Solutions";

export type SocialPlatform = "x" | "instagram" | "facebook";

export interface GroundingSource {
  title?: string;
  url: string;
  snippet?: string;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  author: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  url: string; // Exact direct link to post or thread
  timestamp: string;
  metrics: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
  };
  mediaUrl?: string;
  mediaType?: "image" | "video";
  isRecommended: boolean;
  recommendationScore: number; // 0 to 100
  recommendationVerdict: "RECOMMENDED" | "HIGH_SIGNAL" | "NEUTRAL" | "MARKETING_NOISE" | "REJECTED";
  recommendationReason: string;
  technicalImpact?: string;
  extractedKeywords?: string[];
  groundingSources?: GroundingSource[];
  isVerifiedLink?: boolean;
  directPlatformSearch?: string;
  verifiedAuthorUrl?: string;
}

export interface SocialExtractionResult {
  query: string;
  platform: "all" | SocialPlatform;
  domainCategory?: string;
  totalFound: number;
  recommendedCount: number;
  posts: SocialPost[];
  summaryAnalysis: string;
  groundingWebQueries?: string[];
  searchTimestamp?: number;
}
