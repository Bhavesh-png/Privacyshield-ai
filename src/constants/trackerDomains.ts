/**
 * Comprehensive ad network and tracker domain list.
 * Used both in declarativeNetRequest rules and content script filtering.
 */

// ============================================================
// Ad Networks
// ============================================================

export const AD_DOMAINS: string[] = [
  // Google Ads ecosystem
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'google-analytics.com',
  'googletagmanager.com',
  'googletagservices.com',
  'googleads.g.doubleclick.net',
  'pagead2.googlesyndication.com',
  'adservice.google.com',
  'adservice.google.co.uk',
  'tpc.googlesyndication.com',

  // Amazon Ads
  'amazon-adsystem.com',
  'media-amazon.com',
  'assoc-amazon.com',
  'amazonpay.com',

  // Meta / Facebook Ads
  'connect.facebook.net',
  'facebook.com/tr',
  'graph.facebook.com',
  'static.xx.fbcdn.net',
  'an.facebook.com',

  // Taboola
  'taboola.com',
  'trc.taboola.com',
  'cdn.taboola.com',

  // Outbrain
  'outbrain.com',
  'outbrainimg.com',
  'rec.smartadserver.com',

  // AppNexus / Xandr
  'adnxs.com',
  'adnxs-simple.com',

  // OpenX
  'openx.net',
  'openx.com',

  // Rubicon Project / Magnite
  'rubiconproject.com',
  'fastlane.rubiconproject.com',

  // Index Exchange
  'casalemedia.com',
  'indexww.com',

  // PubMatic
  'pubmatic.com',
  'ads.pubmatic.com',

  // MediaMath
  'mathtag.com',
  'mediamath.com',

  // TradeDesk
  'adsrvr.org',
  'thetradedesk.com',

  // Criteo
  'criteo.com',
  'criteo.net',
  'static.criteo.net',

  // Verizon Media / Yahoo
  'advertising.com',
  'oath.com',
  'yahoo-syndication.com',
  'yahooapis.com',

  // Moat
  'moat.com',
  'moatads.com',

  // Sharethrough
  'sharethrough.com',
  'native.sharethrough.com',

  // Conversant / ValueClick
  'dotomi.com',
  'conversantmedia.com',
  'fastclick.net',

  // AdColony
  'adcolony.com',

  // Sizmek
  'sizmek.com',

  // Integral Ad Science
  'integralads.com',
  'ias.com',

  // GumGum
  'gumgum.com',

  // Sovrn
  'lijit.com',
  'sovrn.com',

  // TripleLift
  'triplelift.com',

  // Yieldmo
  'yieldmo.com',

  // Undertone
  'undertone.com',
  'undertonenetworks.com',

  // 33Across
  '33across.com',

  // Kargo
  'kargo.com',

  // District M
  'districtm.net',
  'districtm.io',

  // Smart AdServer
  'smartadserver.com',
  'sascdn.com',

  // Oath/AOL ads
  'aolcdn.com',
  'advertising.com',

  // YouTube ads
  'youtube.com/api/stats/ads',
  'video-ad-stats.googlevideo.com',
  'pagead2.googlesyndication.com',

  // Spotify ads
  'apresolve.spotify.com',
  'audio-ak-spotify-com.akamaized.net',

  // Twitch ads
  'usher.twitchsvc.net',
  'twitchsvc.net',

  // Reddit ads
  'events.redditmedia.com',
  'redditmedia.com',
]

// ============================================================
// Analytics / Tracking domains
// ============================================================

export const TRACKER_DOMAINS: string[] = [
  // Google Analytics / GTM
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com',
  'googletagservices.com',
  'stats.g.doubleclick.net',

  // Facebook / Meta
  'facebook.com/tr',
  'connect.facebook.net',
  'graph.facebook.com',
  'an.facebook.com',
  'pixel.facebook.com',

  // TikTok
  'analytics.tiktok.com',
  'log.byteoversea.com',
  'mon.musical.ly',
  'analytics.musical.ly',

  // Hotjar
  'hotjar.com',
  'static.hotjar.com',
  'script.hotjar.com',

  // Mixpanel
  'mixpanel.com',
  'api.mixpanel.com',
  'cdn.mxpnl.com',

  // Segment
  'segment.com',
  'cdn.segment.com',
  'api.segment.io',

  // Adobe Analytics
  'omtrdc.net',
  '2o7.net',
  'adobedtm.com',
  'sc.omtrdc.net',

  // Microsoft Clarity / Bing
  'clarity.ms',
  'bat.bing.com',
  'c.clarity.ms',

  // Amplitude
  'amplitude.com',
  'api.amplitude.com',
  'cdn.amplitude.com',

  // Heap
  'heapanalytics.com',
  'cdn.heapanalytics.com',

  // FullStory
  'fullstory.com',
  'rs.fullstory.com',
  'edge.fullstory.com',

  // Intercom
  'intercom.io',
  'intercomcdn.com',
  'widget.intercom.io',

  // Zendesk
  'zendesk.com',
  'zdassets.com',

  // Snowplow
  'snowplow.io',

  // Kissmetrics
  'kissmetrics.com',
  'kissmetrics.io',

  // Woopra
  'woopra.com',

  // Lucky Orange
  'luckyorange.com',

  // Crazy Egg
  'crazyegg.com',

  // Mouseflow
  'mouseflow.com',
  'static.mouseflow.com',

  // UserTesting
  'usertesting.com',

  // Optimizely
  'optimizely.com',
  'cdn.optimizely.com',

  // VWO
  'vwo.com',
  'static.wingify.com',

  // Qualtrics
  'qualtrics.com',
  'iad1.qualtrics.com',

  // SurveyMonkey
  'surveymonkey.com',

  // BrightCove analytics
  'brightcove.com',

  // Scorecardresearch
  'scorecardresearch.com',
  'sb.scorecardresearch.com',

  // Comscore
  'comscore.com',
  'data.comscore.com',

  // Nielsen
  'imrworldwide.com',
  'secure-dcr.imrworldwide.com',

  // Quantcast
  'quantserve.com',
  'pixel.quantserve.com',

  // Chartbeat
  'chartbeat.com',
  'static.chartbeat.com',
  'ping.chartbeat.net',

  // Parse.ly
  'parsely.com',
  'pixel.parsely.com',

  // New Relic
  'newrelic.com',
  'nr-data.net',
  'js-agent.newrelic.com',

  // Sentry
  'sentry.io',

  // LogRocket
  'logrocket.com',
  'r.lr-in.com',

  // Twitter/X analytics
  'ads-twitter.com',
  'static.ads-twitter.com',
  't.co',

  // LinkedIn tracking
  'ads.linkedin.com',
  'dc.ads.linkedin.com',
  'analytics.pointdrive.linkedin.com',

  // Pinterest tag
  'ct.pinterest.com',
  'widgets.pinterest.com',

  // Snap / Snapchat pixel
  'sc-static.net',
  'tr.snapchat.com',

  // Reddit pixel
  'redd.it',
  'events.redditmedia.com',

  // Criteo events
  'events.criteo.com',
  'sslwidget.criteo.com',

  // Branch.io
  'branch.io',
  'api2.branch.io',

  // Adjust
  'adjust.com',
  'app.adjust.com',

  // AppsFlyer
  'appsflyer.com',
  'appsflyer.io',

  // Kochava
  'kochava.com',

  // mParticle
  'mparticle.com',

  // Braze / Appboy
  'braze.com',
  'appboy.com',
  'iad.appboy.com',

  // Customer.io
  'customer.io',
  'track.customer.io',

  // Klaviyo
  'klaviyo.com',
  'a.klaviyo.com',

  // HubSpot
  'hs-scripts.com',
  'hubspot.com',
  'hubapi.com',
  'js.hs-scripts.com',

  // Marketo
  'marketo.com',
  'mktoresp.com',

  // Drift
  'drift.com',
  'js.drift.com',
]

// ============================================================
// CSS selectors for cosmetic filtering (DOM element hiding)
// ============================================================

export const COSMETIC_SELECTORS: string[] = [
  // Generic ad classes
  '[class*="ad-banner"]',
  '[class*="ad-container"]',
  '[class*="ad-wrapper"]',
  '[class*="ad-unit"]',
  '[class*="advert"]',
  '[class*="advertisement"]',
  '[class*="advertising"]',
  '[class*="sponsored"]',
  '[class*="promo-"]',
  '[id*="ad-banner"]',
  '[id*="adcontainer"]',
  '[id*="advertisement"]',
  '[id*="google_ads"]',
  '[id*="dfp-"]',

  // Google
  '.google-auto-placed',
  '.adsbygoogle',
  '#googlemec',
  '.googleads',

  // YouTube
  '.ytp-ad-module',
  '.ytp-ad-overlay-container',
  '.ytp-ad-text-overlay',
  '#player-ads',
  'ytd-promoted-sparkles-web-renderer',
  'ytd-banner-promo-renderer',
  'ytd-ad-slot-renderer',
  'ytd-in-feed-ad-layout-renderer',
  'ytd-promoted-video-renderer',
  '.ytd-merch-shelf-renderer',

  // Facebook
  '[data-pagelet="RightRail"]',
  '[data-testid="marketplace_ad"]',
  '._5jmm[data-fort-id]',

  // Twitter/X
  '[data-testid="placementTracking"]',
  'article[tabindex="0"] [data-testid="ad-metadata"]',

  // Reddit
  '.promotedlink',
  '[data-testid="post-container"][data-promoted="true"]',
  'shreddit-ad-post',

  // Instagram
  '.EZdmt',
  '._6 article[role="presentation"]',

  // Twitch
  '.js-converted-ad',
  '[class*="ad-slot"]',
  '[data-a-target="top-nav-get-bits-button"]',

  // General popup/overlay
  '[class*="cookie-banner"]',
  '[id*="cookie-banner"]',
  '[class*="gdpr-banner"]',
  '[class*="consent-banner"]',
  '.newsletter-popup',
  '[class*="newsletter-modal"]',
  '#newsletter-popup',
  '.overlay-ad',
  '[class*="interstitial"]',
  '.sticky-ad',
  '[class*="floating-ad"]',
]

// ============================================================
// Tracking pixel patterns (URL patterns to block)
// ============================================================

export const TRACKING_PIXEL_PATTERNS: string[] = [
  '/pixel',
  '/tracker',
  '/tracking',
  '/beacon',
  '/collect',
  '/analytics',
  '/stats/',
  '/log/',
  '/ping/',
  '/event/',
  '1x1.gif',
  'pixel.gif',
  'beacon.gif',
  '/tr/',
  '/fb/',
  '/ga.js',
  '/analytics.js',
  '/gtm.js',
]
