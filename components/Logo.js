/**
 * Cropped icon-only extract of public/logo.svg — just the mesob + steam
 * illustration, no outer rings, no baked-in text. The full badge (with
 * its baked text) is reserved for the favicon, where it's shown large
 * enough to actually read; here the "Addis Eats" wordmark is real HTML
 * text instead, so it stays legible and theme-aware at any size.
 */
export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="130 40 260 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(256, 222) scale(0.81) translate(-256, -235)">
        <path d="M220 155 C215 135, 230 120, 222 98 C216 82, 226 70, 224 58" stroke="#e05a2b" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.85" />
        <path d="M256 148 C250 124, 266 108, 258 84 C252 66, 260 54, 256 42" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M292 155 C297 135, 282 120, 290 98 C296 82, 286 70, 288 58" stroke="#e05a2b" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.85" />
        <path d="M246 172 C246 164, 266 164, 266 172 L262 188 L250 188 Z" fill="#e05a2b" />
        <circle cx="256" cy="166" r="10" fill="#f59e0b" />
        <path d="M256 186 L230 220 C238 222, 274 222, 282 220 Z" fill="#e05a2b" />
        <path d="M224 226 L170 286 C210 296, 302 296, 342 286 L288 226 C272 230, 240 230, 224 226 Z" fill="#e05a2b" />
        <path d="M256 234 L264 246 L256 258 L248 246 Z" fill="#f59e0b" />
        <path d="M228 244 L235 254 L228 264 L221 254 Z" fill="#fbf8ff" opacity="0.9" />
        <path d="M284 244 L291 254 L284 264 L277 254 Z" fill="#fbf8ff" opacity="0.9" />
        <path d="M204 256 L210 265 L204 274 L198 265 Z" fill="#f59e0b" />
        <path d="M308 256 L314 265 L308 274 L302 265 Z" fill="#f59e0b" />
        <rect x="156" y="290" width="200" height="12" rx="6" fill="#f59e0b" />
        <rect x="168" y="292" width="176" height="8" rx="4" fill="#d04819" />
        <path d="M162 306 C170 348, 192 374, 256 374 C320 374, 342 348, 350 306 C314 316, 198 316, 162 306 Z" fill="#e05a2b" />
        <path d="M208 374 L196 394 C230 400, 282 400, 316 394 L304 374 C284 378, 228 378, 208 374 Z" fill="#d04819" />
        <path d="M226 322 L256 348 L286 322" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="256" cy="336" r="6" fill="#fbf8ff" />
        <path d="M124 230 C120 255, 126 280, 140 302" stroke="#e05a2b" strokeWidth="5" strokeLinecap="round" />
        <path d="M388 230 C392 255, 386 280, 372 302" stroke="#e05a2b" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}