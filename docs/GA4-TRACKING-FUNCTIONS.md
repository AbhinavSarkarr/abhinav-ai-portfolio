# GA4 Tracking Functions - Complete Documentation

**Location:** `src/hooks/useAnalytics.ts`
**Total Functions:** 56 (42 original + 14 new/enhanced)

---

## Table of Contents

1. [Execution Flow](#execution-flow)
2. [Page Load (Auto)](#1-page-load-auto)
3. [User Scrolls (Hybrid)](#2-user-scrolls-hybrid)
4. [User Interacts](#3-user-interacts)
   - [Project Tracking](#31-project-tracking)
   - [Client Tracking](#32-client-tracking)
   - [Recommendation Tracking](#33-recommendation-tracking)
   - [Conversion Tracking](#34-conversion-tracking)
   - [Skills & Content Tracking](#35-skills--content-tracking)
   - [Interaction Tracking](#36-interaction-tracking)
5. [Advanced Engagement Tracking (NEW)](#4-advanced-engagement-tracking-new)
6. [User Leaves (Auto)](#5-user-leaves-auto)
7. [Summary](#summary)

---

## Execution Flow

```
PAGE LOAD (AUTO)
    │
    ├── initGA4()
    ├── trackSessionStart()
    ├── identifyVisitorType()
    └── trackPageView()
          │
          ▼
USER SCROLLS (HYBRID)
    │
    ├── trackSectionView()
    ├── trackSectionEngagement()
    ├── trackSectionExit()
    ├── trackScrollDepth()
    └── trackCTAView()
          │
          ▼
USER INTERACTS (USER)
    │
    ├── Project Tracking
    ├── Client Tracking
    ├── Recommendation Tracking
    ├── Conversion Tracking
    ├── Skills & Content Tracking
    └── Interaction Tracking
          │
          ▼
ADVANCED TRACKING (NEW)
    │
    ├── trackEngagementScore()
    ├── trackProjectComparison()
    ├── trackSkillToProjectJourney()
    ├── trackHeatmapClick()
    ├── trackReadingPattern()
    ├── trackReturnVisitBehavior()
    └── trackTechStackInterest()
          │
          ▼
USER LEAVES (AUTO)
    │
    ├── trackExitIntent()
    └── trackSessionEnd()
```

---

## 1. Page Load (Auto)

These functions execute automatically when the page loads. No user action required.

### `initGA4()`

**Purpose:** Initializes Google Analytics 4

**What it does:**
- Injects GA4 script into `<head>`
- Creates `window.dataLayer` array
- Creates `window.gtag()` function
- Configures GA4 with your measurement ID

**Portfolio Role:**
This is the foundation - without it, nothing gets tracked. It's like turning on the lights before you can see anything.

---

### `trackSessionStart()`

**Purpose:** Records detailed information when a visitor arrives

**Why it matters for your portfolio:**
Understanding WHO visits your portfolio is crucial. Are they recruiters on mobile during lunch breaks? Developers on desktop late at night? This data shapes how you optimize your portfolio.

**Returned Data:**
```json
{
  "event": "session_start",

  "referrer": "https://linkedin.com/",
  "landing_page": "/",
  "utm_source": "linkedin",
  "utm_medium": "post",
  "utm_campaign": "jan_2026",

  "device_type": "mobile",
  "screen_width": 390,
  "screen_height": 844,

  "browser": "Chrome",
  "browser_version": "120.0",
  "operating_system": "Android",

  "language": "en-IN",
  "color_scheme": "dark",

  "visit_count": 3,
  "days_since_last_visit": 7,
  "is_returning": true,

  "day_of_week": "Tuesday",
  "hour_of_day": 14,
  "local_timezone": "Asia/Kolkata",

  "connection_type": "4g",
  "is_online": true
}
```

**Real Example:**
A recruiter from LinkedIn clicks your portfolio link from a post you shared. The tracking captures:
- They came from LinkedIn (you know your LinkedIn posts work!)
- They're on mobile (your portfolio better be mobile-friendly!)
- It's their 3rd visit (they're seriously interested!)
- They prefer dark mode (your dark theme is being used!)

---

### `identifyVisitorType()`

**Purpose:** Tags visitors as "new" or "returning"

**Why it matters:**
Returning visitors are gold. If someone comes back 3 times, they're likely a serious recruiter or potential client. You can track:
- How many visitors return?
- Do returning visitors click more projects?
- Do they eventually contact you?

---

### `trackPageView()`

**Purpose:** Records every page navigation with context

**Returned Data:**
```json
{
  "event": "page_view",

  "page_path": "/project/trading-bot",
  "page_title": "Trading Bot | Abhinav Sarkar",
  "page_location": "https://yoursite.com/project/trading-bot",

  "previous_page": "/",
  "page_type": "project",
  "page_number": 2,
  "time_on_previous_page": 45,
  "time_since_session_start": 45,
  "viewport_width": 1920,
  "viewport_height": 1080
}
```

**Portfolio Role:**
Tracks the journey through your portfolio:
- Home → Projects → Trading Bot → Contact
- Shows you which projects lead to contact form visits
- Reveals if people skip certain sections entirely

---

## 2. User Scrolls (Hybrid)

These functions trigger as the user scrolls. No click needed, but requires scroll action.

### `trackSectionView()`

**Purpose:** Records when a section becomes visible

**Returned Data:**
```json
{
  "event": "section_view",

  "section_id": "projects",
  "section_name": "Projects",
  "entry_direction": "down",
  "previous_section": "experience",
  "view_count": 1,
  "section_position": 5,
  "total_sections_viewed": 4
}
```

**Portfolio Role:**
Answers critical questions:
- Do visitors even see your Projects section?
- Do they scroll down from Experience to Projects?
- Or do they jump directly to Contact?

**Real Example:**
If 80% of visitors see your Hero and About sections but only 30% reach Projects, your page might be too long or the content above isn't compelling enough to keep them scrolling.

---

### `trackSectionEngagement()`

**Purpose:** Records ongoing engagement while viewing a section

**Returned Data:**
```json
{
  "event": "section_engagement",

  "section_id": "projects",
  "section_name": "Projects",
  "time_spent_seconds": 45,
  "scroll_depth_percent": 80,
  "section_position": 5,
  "view_count": 2
}
```

**Portfolio Role:**
Time spent = Interest level
- 5 seconds on Projects = Just scanning
- 45 seconds on Projects = Actually reading project descriptions
- 2+ minutes on Projects = Seriously evaluating your work

---

### `trackSectionExit()`

**Purpose:** Records when user leaves a section

**Returned Data:**
```json
{
  "event": "section_exit",

  "section_id": "projects",
  "section_name": "Projects",
  "time_spent_seconds": 60,
  "scroll_depth_percent": 100,
  "exit_direction": "down",
  "section_position": 5,
  "view_count": 1
}
```

**Portfolio Role:**
Understanding exit patterns:
- `exit_direction: "down"` = They continued to next section (good!)
- `exit_direction: "up"` = They went back (maybe confused or comparing)
- `scroll_depth: 100%` = They saw everything in that section

---

### `trackScrollDepth()` (Enhanced)

**Purpose:** Records scroll milestones with velocity and behavior analysis

**Returned Data:**
```json
{
  "event": "scroll_depth",

  "scroll_depth_percent": 50,
  "section_id": "projects",
  "scroll_velocity": 15,
  "time_to_reach_depth": 30,
  "is_bouncing": false,
  "scroll_direction": "down",
  "current_section": "projects"
}
```

**New Fields Explained:**
- `scroll_velocity`: How fast they're scrolling (high = skimming, low = reading)
- `time_to_reach_depth`: Slower = more engaged
- `is_bouncing`: Are they quickly scrolling without stopping?

**Portfolio Role:**
Distinguishes between:
- **Deep readers**: Slow scroll, pause on content
- **Skimmers**: Fast scroll, looking for something specific
- **Bouncers**: Rapid scroll, probably leaving soon

---

### `trackCTAView()` (Enhanced)

**Purpose:** Records when a Call-to-Action button becomes visible

**Returned Data:**
```json
{
  "event": "cta_view",

  "cta_name": "Download Resume",
  "cta_location": "hero",
  "viewport_position": "above_fold",
  "time_in_viewport": 5,
  "was_animated": true,
  "time_on_site": 30,
  "scroll_depth": 25
}
```

**Portfolio Role:**
Tracks if your CTAs are being seen:
- Is the "Download Resume" button visible when people land?
- How long do they see it before (hopefully) clicking?
- Are animated CTAs more noticeable?

---

## 3. User Interacts

These functions require specific user actions.

### 3.1 Project Tracking

#### `trackProjectView()` (Enhanced)

**Purpose:** Records when a project card appears in viewport

**Returned Data:**
```json
{
  "event": "project_view",

  "project_id": "trading-bot",
  "project_title": "AI Trading Bot",
  "project_category": "AI/ML",

  "is_first_view": true,
  "time_to_first_view": 45,
  "projects_viewed_before": 2,
  "position_in_list": 1,
  "was_scrolled_to": true,
  "was_recommended": false,
  "viewport_position": "below_fold"
}
```

**Portfolio Role:**
Shows which projects get noticed:
- First position projects get more views
- Time to first view shows how quickly people find projects
- Helps you decide project ordering

---

#### `trackProjectHoverStart()` & `trackProjectHoverEnd()` (NEW)

**Purpose:** Track hover behavior on project cards

**Portfolio Role:**
Hover time before click indicates interest level:
- Quick click (< 1 second) = Knew what they wanted
- Long hover (3-5 seconds) = Reading description, deciding
- Hover without click = Interesting but not compelling enough

---

#### `trackProjectClick()` (Enhanced)

**Purpose:** Records project card clicks with rich context

**Returned Data:**
```json
{
  "event": "project_click",

  "project_id": "trading-bot",
  "project_title": "AI Trading Bot",
  "project_category": "AI/ML",

  "hover_duration_seconds": 3,
  "position_in_list": 1,
  "was_recommended": false,
  "projects_viewed_before": 4,
  "projects_clicked_before": 1,
  "time_since_session_start": 120,
  "is_from_skill_click": true,
  "source_skill": "Python"
}
```

**Portfolio Role:**
Deep insights into what drives clicks:
- Do people click after reading (long hover) or impulsively?
- Which position gets most clicks?
- Do skill clicks lead to project exploration?

**Real Example:**
Someone clicks "Python" skill, then within 30 seconds clicks your Trading Bot project. This tells you: Python developers are interested in your trading work.

---

#### `trackCaseStudyOpen()` (Enhanced)

**Purpose:** Records when someone opens a project's detailed view

**Returned Data:**
```json
{
  "event": "case_study_open",

  "project_id": "trading-bot",
  "project_title": "AI Trading Bot",
  "project_category": "AI/ML",

  "referrer_section": "projects",
  "time_since_project_click": 2,
  "projects_viewed_in_session": 3,
  "sections_viewed_before": 5
}
```

**Portfolio Role:**
Opening a case study = serious interest. Track:
- Which projects get deep dives?
- Do they open case studies after seeing multiple projects?

---

#### `trackCaseStudyEngagement()` (Enhanced)

**Purpose:** Records how deeply someone reads a case study

**Returned Data:**
```json
{
  "event": "case_study_engagement",

  "project_id": "trading-bot",
  "project_title": "AI Trading Bot",
  "time_spent_seconds": 180,
  "scroll_depth_percent": 95,

  "sections_read": ["problem", "solution", "results"],
  "sections_read_count": 3,
  "images_viewed": 4,
  "completion_rate": 87,
  "is_deep_read": true
}
```

**Portfolio Role:**
`is_deep_read: true` = They spent 60+ seconds AND scrolled 75%+ = genuinely interested in your work.

---

### 3.2 Recommendation Tracking

#### `trackRecommendationShown()` (Enhanced)

**Purpose:** Records when project recommendations appear

**Returned Data:**
```json
{
  "event": "recommendation_shown",

  "recommended_project_id": "llm-chatbot",
  "recommended_project_title": "LLM Chatbot",
  "source_project_id": "trading-bot",
  "position": 1,

  "recommendation_algorithm": "category_match",
  "context_category": "AI/ML",
  "user_viewed_similar": true,
  "total_recommendations_shown": 3,
  "viewport_position": "below_fold",
  "is_above_fold": false
}
```

**Portfolio Role:**
Test recommendation effectiveness:
- Does "Similar Projects" actually work?
- Are category-based recommendations better than popularity-based?

---

#### `trackRecommendationClick()` (Enhanced)

**Purpose:** Records when someone clicks a recommendation

**Returned Data:**
```json
{
  "event": "recommendation_click",

  "recommended_project_id": "llm-chatbot",
  "source_project_id": "trading-bot",
  "position": 1,

  "time_since_shown": 5,
  "was_above_fold": true,
  "click_position_in_list": 1,
  "total_recommendations_shown": 3,
  "projects_viewed_before": 2
}
```

**Portfolio Role:**
Measures recommendation quality:
- First position clicked most? Optimize ordering
- Long time_since_shown? They considered it carefully
- High click rate? Your recommendations are relevant

---

### 3.3 Conversion Tracking

#### `trackContactFormStart()` (Enhanced)

**Purpose:** Records when someone begins filling the contact form

**Returned Data:**
```json
{
  "event": "contact_form_start",

  "trigger_action": "cta_click",
  "fields_visible": ["name", "email", "message"],
  "time_on_site_before_start": 180,
  "sections_viewed": 6,
  "projects_viewed": 3,
  "scroll_depth_at_start": 85
}
```

**Portfolio Role:**
Understanding what leads to contact:
- Did they view 3+ projects before contacting?
- How long did they spend on site before deciding to reach out?
- Which trigger (button click, scroll, nav) started it?

---

#### `trackContactFormSubmit()` (Enhanced)

**Purpose:** Records successful form submission

**Returned Data:**
```json
{
  "event": "contact_form_submit",

  "has_name": true,
  "has_email": true,
  "has_message": true,

  "message_length": 250,
  "time_to_submit": 45,
  "form_completion_rate": 100,
  "sections_viewed_before": 7,
  "projects_clicked_before": 4,
  "time_on_site": 300
}
```

**Portfolio Role:**
Your ultimate goal! Understand conversion patterns:
- Long messages (250+ chars) = detailed inquiry, likely serious
- Viewed 4+ projects = shopping around, knows what they want
- 5 minutes on site = took time to evaluate you

---

#### `trackResumeDownload()` (Enhanced)

**Purpose:** Records resume downloads with context

**Returned Data:**
```json
{
  "event": "resume_download",

  "download_source": "hero",
  "sections_viewed_before": 4,
  "projects_clicked_before": 2,
  "time_on_site_before_download": 90,
  "scroll_depth_at_download": 60,
  "current_section": "about",
  "is_first_visit": true
}
```

**Portfolio Role:**
Resume download = serious consideration for a role:
- Quick downloads (< 30s) = Recruiter with a job opening
- After browsing projects = They've done research
- From hero vs footer = Different intent levels

---

### 3.4 Skills & Content Tracking

#### `trackSkillClick()` (Enhanced)

**Purpose:** Records skill tag clicks with journey tracking

**Returned Data:**
```json
{
  "event": "skill_click",

  "skill_name": "TensorFlow",
  "skill_category": "Machine Learning",

  "skill_level": "advanced",
  "related_projects_count": 3,
  "was_in_viewport": true,
  "time_on_site": 120,
  "projects_viewed_before": 2,
  "sections_viewed": 4
}
```

**Portfolio Role:**
Shows what skills attract attention:
- Most clicked skills = Market demand
- Skills leading to project views = Your strongest areas
- Helps you prioritize which skills to showcase

**Real Example:**
If "LangChain" gets 3x more clicks than "Pandas", maybe highlight LangChain projects more prominently.

---

#### `trackCertificationClick()` (Enhanced)

**Purpose:** Records certification interest

**Returned Data:**
```json
{
  "event": "certification_click",

  "cert_title": "AWS ML Specialty",
  "cert_issuer": "Amazon",

  "cert_year": 2024,
  "is_expired": false,
  "cert_category": "cloud",
  "time_on_site": 150,
  "current_section": "about"
}
```

**Portfolio Role:**
Shows which credentials matter:
- AWS clicks > Azure clicks? Market preference
- Cloud certs vs ML certs? Industry demand
- Helps prioritize which certs to pursue

---

#### `trackPublicationClick()` (Enhanced)

**Purpose:** Records publication interest

**Returned Data:**
```json
{
  "event": "publication_click",

  "pub_title": "Neural Network Optimization",
  "pub_type": "conference",
  "pub_year": 2024,
  "co_authors_count": 3,
  "time_on_site": 200,
  "sections_viewed": 5
}
```

**Portfolio Role:**
For academic/research roles:
- Which papers attract attention?
- Conference vs journal preference?
- Recent papers more interesting?

---

### 3.5 Social & Outbound Tracking

#### `trackSocialClick()` (Enhanced)

**Purpose:** Records social media profile clicks

**Returned Data:**
```json
{
  "event": "social_click",

  "platform": "LinkedIn",
  "url": "https://linkedin.com/in/abhinavsarkar",

  "click_context": "footer",
  "time_on_site_before_click": 180,
  "sections_viewed": 6,
  "projects_viewed": 3,
  "is_returning_visitor": true
}
```

**Portfolio Role:**
Which platforms draw interest?
- LinkedIn clicks from recruiters
- GitHub clicks from developers
- Context shows where to place social links

---

## 4. Advanced Engagement Tracking (NEW)

These are sophisticated tracking functions for deep behavioral analysis.

### `trackEngagementScore()`

**Purpose:** Real-time engagement scoring (0-100 scale)

**Returned Data:**
```json
{
  "event": "engagement_score",

  "engagement_score": 72,
  "time_score": 25,
  "section_score": 17,
  "project_score": 15,
  "scroll_score": 10,
  "conversion_score": 5,

  "session_duration": 250,
  "sections_viewed": 7,
  "projects_clicked": 3,
  "max_scroll_depth": 85,
  "conversions": 1
}
```

**Score Breakdown:**
- **Time Score** (max 30): 1 point per 10 seconds, up to 5 minutes
- **Section Score** (max 20): 2.5 points per section viewed
- **Project Score** (max 20): 5 points per project clicked
- **Scroll Score** (max 15): Based on max scroll depth
- **Conversion Score** (max 15): 5 points per conversion action

**Portfolio Role:**
Single metric to identify high-value visitors:
- Score 75+ = Highly engaged, likely to convert
- Score 25-50 = Moderate interest
- Score < 25 = Bouncing or just browsing

---

### `trackProjectComparison()`

**Purpose:** Detects when users compare multiple similar projects

**Returned Data:**
```json
{
  "event": "project_comparison",

  "project_ids": ["trading-bot", "stock-predictor", "algo-trader"],
  "project_titles": ["Trading Bot", "Stock Predictor", "Algo Trader"],
  "shared_category": "FinTech",
  "comparison_count": 3,
  "time_between_views": 45,
  "session_duration": 180
}
```

**Portfolio Role:**
Users comparing projects = evaluating your expertise in an area:
- Multiple FinTech projects viewed? They need FinTech expertise
- Follow up with: "Looking for FinTech solutions?" popup

---

### `trackSkillToProjectJourney()`

**Purpose:** Tracks when skill clicks lead to project views

**Returned Data:**
```json
{
  "event": "skill_to_project_journey",

  "skill_name": "TensorFlow",
  "project_id": "image-classifier",
  "project_title": "Image Classifier",
  "project_category": "Computer Vision",

  "time_between_seconds": 8,
  "is_quick_journey": true,
  "sections_visited_between": 0
}
```

**Portfolio Role:**
Shows skill-to-project connections:
- Quick journey = They knew what they wanted
- Helps you tag projects with the right skills
- Validates your skill categorization

---

### `trackHeatmapClick()`

**Purpose:** Records click coordinates for layout optimization

**Returned Data:**
```json
{
  "event": "heatmap_click",

  "viewport_x": 75,
  "viewport_y": 30,
  "document_x": 75,
  "document_y": 15,
  "element_type": "button",
  "element_id": "download-resume",
  "current_section": "hero",
  "scroll_depth": 0,
  "device_type": "desktop"
}
```

**Portfolio Role:**
Visual click patterns:
- Where do most clicks happen?
- Are important buttons in high-click areas?
- Mobile vs desktop click zones

---

### `trackReadingPattern()`

**Purpose:** Classifies reading behavior

**Returned Data:**
```json
{
  "event": "reading_pattern",

  "section_id": "about",
  "section_name": "About",
  "reading_duration": 90,
  "scroll_events": 15,
  "scrolls_per_second": 0.17,
  "reading_pattern": "deep_read",
  "is_deep_read": true
}
```

**Pattern Classification:**
- **deep_read**: 60+ seconds, slow scroll = Actually reading
- **skimming**: 30-60 seconds, moderate scroll = Getting overview
- **scanning**: 10-30 seconds, fast scroll = Looking for something specific
- **bouncing**: < 10 seconds = Not interested

**Portfolio Role:**
Content quality indicator:
- Deep reads on About = Your story resonates
- Bouncing on Projects = Cards not compelling enough

---

### `trackReturnVisitBehavior()`

**Purpose:** Compares returning visitor behavior to previous visits

**Returned Data:**
```json
{
  "event": "return_visit_behavior",

  "visit_count": 3,
  "days_since_last_visit": 5,
  "current_sections_viewed": ["hero", "projects", "contact"],
  "current_projects_clicked": ["trading-bot"],
  "previous_sections_viewed": ["hero", "about", "projects"],
  "previous_projects_clicked": ["llm-chatbot"],
  "is_exploring_new_sections": true,
  "is_revisiting_projects": false,
  "time_on_site": 120
}
```

**Portfolio Role:**
Understand returning visitor intent:
- Visiting new sections = Still exploring
- Revisiting same projects = Deep interest in specific work
- Going straight to contact = Ready to reach out

---

### `trackTechStackInterest()`

**Purpose:** Aggregates technology interest across session

**Returned Data:**
```json
{
  "event": "tech_stack_interest",

  "top_technologies": ["Python", "TensorFlow", "LangChain", "AWS", "React"],
  "interest_counts": {
    "Python": 5,
    "TensorFlow": 4,
    "LangChain": 3,
    "AWS": 2,
    "React": 2
  },
  "total_tech_interactions": 16,
  "unique_technologies": 5,
  "projects_viewed": 4,
  "session_duration": 300
}
```

**Portfolio Role:**
Market demand signals:
- Most interacted techs = What visitors look for
- Helps prioritize which technologies to highlight
- Informs blog post topics and project focus

---

## 5. User Leaves (Auto)

### `trackExitIntent()` (Enhanced)

**Purpose:** Captures user behavior just before leaving

**Returned Data:**
```json
{
  "event": "exit_intent",

  "last_section": "projects",
  "time_on_page_seconds": 180,
  "scroll_depth_percent": 65,

  "mouse_exit_x": 95,
  "mouse_exit_y": 5,
  "exit_trigger": "mouse_leave",
  "final_section_time": 45,
  "was_idle": false,
  "idle_time_seconds": 0,
  "sections_viewed": 5,
  "projects_clicked": 2,
  "conversions_count": 0
}
```

**Exit Triggers:**
- `mouse_leave`: Mouse moved toward close/back
- `tab_blur`: Switched to another tab
- `idle`: No activity for 30+ seconds
- `back_button`: Used browser back

**Portfolio Role:**
Last chance insights:
- Left without converting but viewed 5 sections = Almost convinced
- Idle before exit = Got distracted, not a loss
- Quick exit = Immediate bounce

---

### `trackSessionEnd()` (Enhanced)

**Purpose:** Comprehensive session summary

**Returned Data:**
```json
{
  "event": "session_end",

  "session_duration_seconds": 300,
  "pages_viewed": 4,

  "max_scroll_depth": 85,
  "sections_viewed_count": 7,
  "sections_viewed_list": ["hero", "about", "experience", "projects", "skills", "publications", "contact"],
  "projects_viewed_count": 5,
  "projects_clicked_count": 3,
  "conversions_count": 1,

  "engagement_score": 78,
  "engagement_level": "very_high",

  "time_score": 30,
  "section_score": 17,
  "project_score": 15,
  "scroll_score": 13,
  "conversion_score": 5,

  "last_section": "contact",
  "total_visit_count": 2
}
```

**Engagement Levels:**
- **very_high** (75-100): Power visitors, likely to convert/return
- **high** (50-74): Seriously interested
- **medium** (25-49): Moderate interest
- **low** (0-24): Quick bounce or minimal engagement

**Portfolio Role:**
The ultimate session report card:
- High engagement + conversion = Success!
- High engagement + no conversion = Follow up opportunity
- Low engagement = Content/UX needs work

---

## Summary

| Phase | Count | Auto/User |
|-------|-------|-----------|
| **Page Load** | 4 | Auto |
| **User Scrolls** | 5 | Hybrid |
| **Project Tracking** | 7 | User |
| **Client Tracking** | 10 | User |
| **Recommendation Tracking** | 2 | User |
| **Conversion Tracking** | 5 | User |
| **Skills & Content** | 6 | User |
| **Interaction Tracking** | 6 | User |
| **Advanced Engagement (NEW)** | 9 | Mixed |
| **User Leaves** | 2 | Auto |
| **TOTAL** | **56** | - |

---

## Key Insights You Can Extract

### For Recruiters
- Which companies/domains do visitors come from?
- Which skills get the most attention?
- What's the typical journey before resume download?

### For Your Portfolio
- Which projects are most compelling?
- Where do visitors drop off?
- What content leads to conversions?

### For Market Research
- Which technologies are in demand?
- What project categories attract interest?
- How do engagement patterns differ by source?

---

*Last Updated: January 2026*
