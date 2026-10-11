# Day 43 performance notes

## Day 45 performance budget and evidence

Day 45 targets: mobile Lighthouse LCP under 2.5 s, CLS under 0.1, `/menu`
First Load JS under 120 kB, largest delivered image under 150 kB, and
Lighthouse performance score at least 90.

| Measure | Before | Current evidence | Target/status |
| --- | --- | --- | --- |
| Mobile LCP (Moto G Power, Slow 4G) | 2.6 s, earlier supplied Lighthouse 13.4.1 home run | 2.5 s, later supplied Lighthouse 13.4.1 home run after image priority/quality changes; not a controlled Day 45 before/after pair | **Not met yet:** target is strictly under 2.5 s. Rerun after deployment using identical settings. |
| CLS | 0 in the supplied home Lighthouse runs | 0 | Met (< 0.1); recheck after deployment. |
| `/menu` First Load JS | Not captured in a comparable report | Not yet measured in browser transfer sizes for the Day 45 build | Pending: capture compressed first-load JS transfer total and reduce it below 120 kB if needed. |
| Largest delivered image | Home report showed 72.6 KiB for BBQ chicken pizza before q60; assets are served through `next/image` | Home report showed 62.1 KiB at q60 for the same 750px image variant | Met for that reported variant (< 150 kB); verify the largest image/request in the deployed run. |
| Lighthouse performance score | 93 in the earlier supplied home run | Not provided in the later report | Pending a same-condition deployed run (target >= 90). |

### Day 45 `/menu` Lighthouse baseline

A supplied Lighthouse 13.4.1 run for `http://127.0.0.1:3000/menu` on an
emulated Moto G Power with Slow 4G reported a performance score of 57, FCP
2.1 s, LCP 5.2 s, TBT 760 ms, CLS 0.062, and Speed Index 4.3 s. This is a
local baseline, not a deployed result.

The report identifies 1.8 s of LCP resource-load delay and says the LCP image
has no high fetch priority. Before this report, `CategoryBar` rendered the
initial menu `DishList` without `prioritizeFirst`, even though `DishList` and
`DishCard` already support priority for the first image. The initial
unfiltered menu list now marks that first image high priority; category-filtered
lists do not elevate a new image. Rebuild and rerun the same audit to measure
the change; no improved score or LCP is claimed yet.

The same report recorded 517 ms of unattributed forced reflow, 13 long tasks,
and 2.166 s of Style & Layout work. The report does not identify a source
location for the reflow, so use a Chrome Performance trace before changing
layout or interaction code to address it. The listed 13.5 KiB legacy-polyfill
finding is in Next.js's shared runtime chunk; do not remove framework
compatibility code without a supported configuration and browser-support
decision.

The supplied reports are historical measurements, not a controlled Day 45
before/after experiment. The current application already inherits Day 43 image
quality and priority changes. Do not present the values above as proof of a
new Day 45 performance gain. Capture a fresh baseline and final run on the
same deployed build/configuration, record the Lighthouse URL/device/throttling,
and fill the missing cells before claiming the Day 45 performance criterion
is complete. The separate soft-navigation readings (LCP 0.63 s, INP 32 ms,
CLS 0) are not full-navigation Lighthouse metrics.

The largest source asset is `public/images/beyaynet.png` (about 5.8 MiB);
the browser should receive a resized, optimized `next/image` response rather
than the source file. Keep the source and delivered-image measurements
distinct.

## Day 45 evidence still required

- Deploy the production build and put its real URL in `README.md`; do not use
  localhost for social-preview validation.
- Repeat matched Lighthouse runs on the deployed homepage and `/menu`, and
  record before/after LCP, CLS, score, and compressed `/menu` First Load JS.
- Verify the largest delivered image in the deployed network log is below
  150 kB and visually inspect image quality before further compression.
- Run and record the authorization attacks in `AUTH.md` against a real
  application session.
- The demo stores sessions and orders in process memory. Use durable shared
  storage before relying on auth or orders across deployed instances/restarts.

## Lighthouse measurements

Measured the committed Day 43 snapshot before the UI/performance changes and
the updated project after them. Both were production builds using Next.js
16.3.6, the Webpack builder, the same Chrome/Lighthouse 13.5 setup, and
Lighthouse's default mobile simulated throttling (150 ms RTT, 1,638.4 Kbps
throughput, and 4x CPU slowdown). Values are medians from three runs per
version; the baseline was extracted from the committed Day 43 revision.

| Metric | Before | After | Observed change |
| --- | ---: | ---: | --- |
| LCP | 3.095 s | 3.080 s | 0.015 s faster; effectively flat in this lab run. |
| CLS | 0.0082 | 0.0035 | Improved by 0.0046 (about 57%). |
| INP | Not reported | Not reported | Lighthouse lab runs do not report INP without real user interaction/field data. |
| Performance score | 0.94 | 0.94 | No score change. |

The meaningful measured change was CLS, consistent with the self-hosted font
and explicit image sizing reducing layout movement; these changes were applied
together, so this comparison cannot isolate each one's contribution. LCP and
the overall score did not materially improve. The committed baseline already
used `next/image` for dish cards, which limits the LCP gain attributable to
converting the remaining images. INP requires field data or a separate
interaction test and is not inferred from these runs.

### Additional Chrome Lighthouse run

A follow-up run supplied from Chrome Lighthouse 13.4.1 on an emulated Moto G
Power with Slow 4G reported a performance score of 93, FCP 0.9 s, LCP 2.6 s,
TBT 220 ms, CLS 0, and Speed Index 0.9 s. This is recorded separately rather
than combined with the three-run medians above because its Lighthouse version
and throttling/device configuration differ. INP was not provided.

The report identifies the next optimization opportunities: Lighthouse
estimates up to 100 KiB saved from image compression; render-blocking CSS has
an estimated 200 ms saving; and unused JavaScript estimates are 26 KiB (with
13 KiB of legacy polyfills/transforms). It also reports a 402 ms long task
and 44 ms of unattributed forced reflow. The first home special is prioritized
and should be verified in production output. These are audit diagnostics, not
guaranteed improvements.

The later report names `/_next/static/chunks/3f5yevxdnrp_d.js` for the legacy
JavaScript finding. In the production build, this is a shared Next.js client
runtime chunk included in the homepage's root bundle, not an application
component chunk. Its opening runtime module contains guarded compatibility
polyfills for methods including `Array.prototype.at`, `Array.prototype.flat`,
`Object.fromEntries`, and `Object.hasOwn`; the feature checks avoid replacing
native implementations when present. Lighthouse flags the bytes shipped for
older-browser compatibility, not 26 KiB of unused app code. No app-level
polyfill import or browserslist override has been added; removing framework
compatibility code without a supported Next.js option could break older
browsers and is not justified by this audit alone.

### Home image-delivery follow-up

A later Lighthouse 13.4.1 report for `/` on an emulated Moto G Power with Slow
4G estimated 100 KiB of image savings across the BBQ chicken pizza, Tibs, Doro
Wat, and pizza special images. It also flagged the LCP preload for missing
`fetchpriority=high`, estimated 640 ms from render-blocking CSS, and measured
112 ms of unattributed forced reflow. The image optimizer quality is now set
to 60 for dish cards, detail images, and cart thumbnails (with 75 still
allowed by Next.js); the prioritized dish images explicitly request high
fetch priority. A production HTML check before the explicit priority setting
found that Next.js emitted the image preload without a high-priority attribute.
The rebuilt production HTML now emits `fetchPriority="high"` on both the
homepage's first-special preload and the detail hero preload. Against the
production image optimizer at width 750, the four reported home images
totaled 205.1 KiB at quality 75 and 174.4 KiB at quality 60, a measured
30.7 KiB (15%) reduction for those response variants. This direct optimizer
check is not a repeat Lighthouse run; retest under the same conditions to
measure actual page transfer and LCP changes. The supplied diagnostic did
not include the overall score or core Web Vitals.

### Follow-up Lighthouse and soft-navigation metrics

A later Lighthouse 13.4.1 run on an emulated Moto G Power with Slow 4G
reported FCP 2.1 s, LCP 2.5 s, TBT 60 ms, CLS 0, and Speed Index 3.2 s.
The performance score and exact Lighthouse document URL were not included
with the supplied capture. Lighthouse now confirms `fetchpriority=high` is
applied to the discoverable LCP image and it is not lazy-loaded. The report
still estimates 66 KiB of image savings at quality 60, 620 ms from
render-blocking requests, 26 KiB from unused JavaScript (including 13 KiB of
legacy compatibility code in the shared Next.js runtime), and 121 ms of
unattributed forced reflow. These are estimated opportunities, not measured
regressions; do not lower image quality further or change framework runtime
code without a visual-quality check and a supported implementation.

The same capture separately reports Chrome local soft-navigation metrics of
LCP 0.63 s, CLS 0, and INP 32 ms. Its LCP element is
`p.page-module__Rf0uyG__demoAccounts`, which corresponds to the demo-account
text on the sign-in page, not the image LCP measured by the Lighthouse full
navigation. Keep these soft-navigation values separate from the full-load
Lighthouse metrics; the capture does not establish that they came from the
same route transition or measurement session.

### Menu route Lighthouse run

A separate supplied Lighthouse 13.4.1 run for `/menu`, also on an emulated
Moto G Power with Slow 4G throttling, reported a performance score of 75, FCP
2.1 s, LCP 4.7 s, TBT 170 ms, CLS 0, and Speed Index 5.0 s. Keep this result
separate from the home-page run: it measures a different route and has a
different page payload.

The primary concern is menu LCP, not layout shift or blocking time. Lighthouse
attributes 1.48 s to LCP resource load delay and 1.33 s to resource loading,
and says the LCP request should have `fetchpriority=high`; it is discoverable
in the initial document and is not lazy-loaded. The supplied report does not
include the LCP element's URL/name, so inspect that element in Lighthouse
before deciding which menu image should receive priority. The menu currently
does not prioritize an image in its initial dish list.

Other opportunities reported were 740 ms estimated savings from render-
blocking CSS, approximately 108 KiB estimated image savings (primarily
Kitfo, Tibs, and Margherita images), and 24 KiB estimated savings from unused
JavaScript. Lighthouse also measured 1.5 s of JavaScript execution, 4.2 s total
main-thread work, 16 long tasks, and 79 ms of forced reflow. These are
diagnostic leads rather than guaranteed gains; the report shows no CLS issue
and a TBT of 170 ms.

### Dish detail Lighthouse run

A supplied Chrome Lighthouse 13.4.1 run for `/menu/2` on an emulated Moto G
Power with Slow 4G reported a performance score of 80, FCP 2.1 s, LCP 4.6 s,
TBT 60 ms, CLS 0, and Speed Index 4.1 s. Chrome's local metric panel reported
an LCP of 0.76 s for the page image and CLS of 0; that local observation is
different from the throttled Lighthouse navigation and should not be compared
as though the test conditions were identical.

The Lighthouse LCP element selector was `img.page-module__vhIGBq__image`.
It is the dish-detail hero image rendered by `app/menu/[id]/page.js`; it was
discoverable in the initial document and was not lazy-loaded, but Lighthouse
said it should have `fetchpriority=high`. The detail hero image is now marked
`priority` so the framework can emit the high-priority preload. Re-run the
same production Lighthouse test to confirm the change improves the result.
Lighthouse also estimates 25 KiB of savings for the Tibs image, 820 ms for
render-blocking CSS, and 25 KiB of unused JavaScript; treat these as
investigation leads rather than guaranteed gains. INP was not reported.

To reproduce the build mode used for this comparison, run
`npm run build -- --webpack` followed by `npm run start`, then audit the
production server with Chrome Lighthouse using the same mobile throttling.
Do not use the development server.

## Changes affecting performance

- Dish cards and dish details use `next/image` with dimensions, responsive
  `sizes`, meaningful alt text, and quality 60. Cart thumbnails also use
  `next/image` at quality 60.
- The leading home-page special and the detail page's hero dish image are
  prioritized on their respective routes; menu listings, search results, and
  cart thumbnails remain eligible for lazy loading.
- A local Inter Latin variable font is loaded with `next/font/local` and served
  by the application; the bundled font's SIL Open Font License is in
  `app/fonts/OFL.txt`.
- The repository uses local dish images only, so no remote image host patterns
  are needed. It has no third-party scripts, so no `next/script` integration is
  appropriate.
- The public routes continue to render menu data on the server, and the existing
  pagination and search behavior is retained.
