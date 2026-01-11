/**
 * UTM Redirect Component
 * Redirects short URLs to main page with hidden UTM parameters
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UTMRedirectProps {
  source: string;
  medium: string;
  campaign?: string;
}

export function UTMRedirect({ source, medium, campaign }: UTMRedirectProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('utm_source', source);
    params.set('utm_medium', medium);
    if (campaign) {
      params.set('utm_campaign', campaign);
    }

    // Redirect to home with UTM params
    navigate(`/?${params.toString()}`, { replace: true });
  }, [source, medium, campaign, navigate]);

  return null;
}

// ============================================
// LINKEDIN REDIRECTS
// ============================================
export const LinkedInProfileRedirect = () => (
  <UTMRedirect source="linkedin" medium="profile" />
);

export const LinkedInPostRedirect = () => (
  <UTMRedirect source="linkedin" medium="post" />
);

export const LinkedInMessageRedirect = () => (
  <UTMRedirect source="linkedin" medium="message" />
);

// ============================================
// TWITTER/X REDIRECTS
// ============================================
export const TwitterProfileRedirect = () => (
  <UTMRedirect source="twitter" medium="profile" />
);

export const TwitterPostRedirect = () => (
  <UTMRedirect source="twitter" medium="post" />
);

export const TwitterDMRedirect = () => (
  <UTMRedirect source="twitter" medium="dm" />
);

// ============================================
// GITHUB REDIRECTS
// ============================================
export const GitHubProfileRedirect = () => (
  <UTMRedirect source="github" medium="profile" />
);

export const GitHubReadmeRedirect = () => (
  <UTMRedirect source="github" medium="readme" />
);

export const GitHubRepoRedirect = () => (
  <UTMRedirect source="github" medium="repo" />
);

// ============================================
// EMAIL REDIRECTS
// ============================================
export const EmailSignatureRedirect = () => (
  <UTMRedirect source="email" medium="signature" />
);

export const EmailNewsletterRedirect = () => (
  <UTMRedirect source="email" medium="newsletter" />
);

export const EmailColdRedirect = () => (
  <UTMRedirect source="email" medium="cold-outreach" />
);

// ============================================
// RESUME/CV REDIRECTS
// ============================================
export const ResumeRedirect = () => (
  <UTMRedirect source="resume" medium="document" />
);

export const CoverLetterRedirect = () => (
  <UTMRedirect source="cover-letter" medium="document" />
);

// ============================================
// WHATSAPP REDIRECTS
// ============================================
export const WhatsAppDirectRedirect = () => (
  <UTMRedirect source="whatsapp" medium="direct" />
);

export const WhatsAppGroupRedirect = () => (
  <UTMRedirect source="whatsapp" medium="group" />
);

export const WhatsAppStatusRedirect = () => (
  <UTMRedirect source="whatsapp" medium="status" />
);

// ============================================
// OTHER PLATFORMS
// ============================================
export const DiscordRedirect = () => (
  <UTMRedirect source="discord" medium="server" />
);

export const RedditRedirect = () => (
  <UTMRedirect source="reddit" medium="post" />
);

export const MediumRedirect = () => (
  <UTMRedirect source="medium" medium="article" />
);

export const QRCodeRedirect = () => (
  <UTMRedirect source="qr" medium="scan" />
);

export default UTMRedirect;
