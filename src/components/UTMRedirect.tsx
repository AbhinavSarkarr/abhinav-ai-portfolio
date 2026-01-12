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
// INSTAGRAM REDIRECTS
// ============================================
export const InstagramBioRedirect = () => (
  <UTMRedirect source="instagram" medium="bio" />
);

export const InstagramPostRedirect = () => (
  <UTMRedirect source="instagram" medium="post" />
);

export const InstagramStoryRedirect = () => (
  <UTMRedirect source="instagram" medium="story" />
);

export const InstagramDMRedirect = () => (
  <UTMRedirect source="instagram" medium="dm" />
);

export const InstagramReelRedirect = () => (
  <UTMRedirect source="instagram" medium="reel" />
);

// ============================================
// YOUTUBE REDIRECTS
// ============================================
export const YouTubeChannelRedirect = () => (
  <UTMRedirect source="youtube" medium="channel" />
);

export const YouTubeVideoRedirect = () => (
  <UTMRedirect source="youtube" medium="video-description" />
);

export const YouTubeCommentRedirect = () => (
  <UTMRedirect source="youtube" medium="comment" />
);

// ============================================
// TELEGRAM REDIRECTS
// ============================================
export const TelegramDirectRedirect = () => (
  <UTMRedirect source="telegram" medium="direct" />
);

export const TelegramGroupRedirect = () => (
  <UTMRedirect source="telegram" medium="group" />
);

export const TelegramChannelRedirect = () => (
  <UTMRedirect source="telegram" medium="channel" />
);

// ============================================
// FACEBOOK REDIRECTS
// ============================================
export const FacebookProfileRedirect = () => (
  <UTMRedirect source="facebook" medium="profile" />
);

export const FacebookPostRedirect = () => (
  <UTMRedirect source="facebook" medium="post" />
);

export const FacebookMessengerRedirect = () => (
  <UTMRedirect source="facebook" medium="messenger" />
);

// ============================================
// THREADS REDIRECTS
// ============================================
export const ThreadsProfileRedirect = () => (
  <UTMRedirect source="threads" medium="profile" />
);

export const ThreadsPostRedirect = () => (
  <UTMRedirect source="threads" medium="post" />
);

// ============================================
// KAGGLE REDIRECTS (Important for AI/ML)
// ============================================
export const KaggleProfileRedirect = () => (
  <UTMRedirect source="kaggle" medium="profile" />
);

export const KaggleNotebookRedirect = () => (
  <UTMRedirect source="kaggle" medium="notebook" />
);

export const KaggleDiscussionRedirect = () => (
  <UTMRedirect source="kaggle" medium="discussion" />
);

// ============================================
// STACK OVERFLOW REDIRECTS
// ============================================
export const StackOverflowProfileRedirect = () => (
  <UTMRedirect source="stackoverflow" medium="profile" />
);

export const StackOverflowAnswerRedirect = () => (
  <UTMRedirect source="stackoverflow" medium="answer" />
);

// ============================================
// DEVELOPER BLOGGING PLATFORMS
// ============================================
export const DevToRedirect = () => (
  <UTMRedirect source="devto" medium="article" />
);

export const HashnodeRedirect = () => (
  <UTMRedirect source="hashnode" medium="article" />
);

// ============================================
// TECH COMMUNITIES
// ============================================
export const HackerNewsRedirect = () => (
  <UTMRedirect source="hackernews" medium="post" />
);

export const ProductHuntRedirect = () => (
  <UTMRedirect source="producthunt" medium="launch" />
);

// ============================================
// CODING PLATFORMS
// ============================================
export const LeetCodeRedirect = () => (
  <UTMRedirect source="leetcode" medium="profile" />
);

export const HackerRankRedirect = () => (
  <UTMRedirect source="hackerrank" medium="profile" />
);

// ============================================
// DESIGN PLATFORMS
// ============================================
export const BehanceRedirect = () => (
  <UTMRedirect source="behance" medium="profile" />
);

export const DribbbleRedirect = () => (
  <UTMRedirect source="dribbble" medium="profile" />
);

// ============================================
// WORK/COLLABORATION PLATFORMS
// ============================================
export const SlackRedirect = () => (
  <UTMRedirect source="slack" medium="workspace" />
);

export const SlackDMRedirect = () => (
  <UTMRedirect source="slack" medium="dm" />
);

export const NotionRedirect = () => (
  <UTMRedirect source="notion" medium="page" />
);

// ============================================
// OTHER PLATFORMS
// ============================================
export const DiscordRedirect = () => (
  <UTMRedirect source="discord" medium="server" />
);

export const DiscordDMRedirect = () => (
  <UTMRedirect source="discord" medium="dm" />
);

export const RedditRedirect = () => (
  <UTMRedirect source="reddit" medium="post" />
);

export const RedditCommentRedirect = () => (
  <UTMRedirect source="reddit" medium="comment" />
);

export const MediumRedirect = () => (
  <UTMRedirect source="medium" medium="article" />
);

export const QRCodeRedirect = () => (
  <UTMRedirect source="qr" medium="scan" />
);

// ============================================
// MISCELLANEOUS
// ============================================
export const PortfolioLinkRedirect = () => (
  <UTMRedirect source="portfolio" medium="link" />
);

export const ReferralRedirect = () => (
  <UTMRedirect source="referral" medium="friend" />
);

export const PresentationRedirect = () => (
  <UTMRedirect source="presentation" medium="slide" />
);

export const ConferenceRedirect = () => (
  <UTMRedirect source="conference" medium="event" />
);

export const MeetupRedirect = () => (
  <UTMRedirect source="meetup" medium="event" />
);

export default UTMRedirect;
