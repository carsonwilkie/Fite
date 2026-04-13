
========================================
THE PROMPT (copy everything below)
========================================

I have a product video that I want to use to create a better hero section. Rebuild my landing page into a scroll-animated product website using GSAP ScrollTrigger and already installed skills/services.
Only execute steps that we have't already done in the past, you think are necessary to my desired update, or aren't already installed.
Use this prompt as a guide to update my website/landing page. Only focus on the landing page.

I am providing you with two things directly in this chat:
1. The finished product MP4 video
2. Video description.

Video Description:
- A neon glowing and holographic bull that is initially position facing left. The bull puts its front left foot down and proceeds to run leftwards out of the frame. 

You do not need to generate any images or video yourself. All creative assets are already provided above.

REFERENCE REPOS / DOCS (use these for correct APIs and install commands):
- GSAP: https://github.com/greensock/GSAP  (docs: https://gsap.com/docs/v3/)
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- FFmpeg: https://github.com/FFmpeg/FFmpeg  (docs: https://ffmpeg.org/documentation.html)
- Wrangler (Cloudflare deploy): https://github.com/cloudflare/workers-sdk

STEP 0 — DEPENDENCY CHECK (do this FIRST, before anything else): **ONLY DO IF NECESSARY**

Run these checks and report what is missing. For anything missing, install it automatically for my platform (detect macOS vs Linux vs Windows) and confirm the install succeeded before moving on. Do NOT skip any check.

1. FFmpeg:          ffmpeg -version
   - macOS:   brew install ffmpeg
   - Linux:   sudo apt-get install -y ffmpeg
2. Homebrew (macOS only, required above):  brew --version
   - Install: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

After each install, re-run the version check to verify it worked. If any install fails, STOP and tell me exactly which dependency failed and why, do not try to work around it.

Project-level npm packages you will install via npm install inside the Astro project (not global):
- gsap            → https://www.npmjs.com/package/gsap  (includes ScrollTrigger)

What I need you to do AFTER the dependency check passes:

**MUST DO EXTRACTION**

1. Extract the video into WebP frames using FFmpeg (24fps, quality 85)
2. Copy the extracted frames into the project fite/public/frames/directory
3. Build the following page sections:

   HERO SECTION (scroll frame animation):
   - Full-viewport canvas element
   - GSAP ScrollTrigger scrubs through the WebP frames as user scrolls
   - Pin the hero section so it stays fixed while frames play
   - Overlay the brand name with a neon glow effect
   - Add small "technical overlay" labels in the corners for aesthetic
   - Text animations: the hero text should enter with a staggered slide-up on page load, then exit with each line flying in different directions (left, scale-up, right) as user scrolls
   - Mid-scroll: show a secondary tagline that fades in and out over the frames
   - End of scroll: show product details (name, specs) on either side of the final frame before unpinning
   - Make sure menu disappears as the user scrolls down to maximize immersion

   NAVIGATION:
   - Glassmorphic fixed nav with brand logo and links
   - Nav hides on scroll down, reappears on scroll up

   FEATURES SECTION:
   - Cards with product specs, scroll-triggered staggered reveal
   - Animated progress bars inside each card
   - Mouse-following neon glow hover effect on cards using brand colors
   - A large statement/quote with letter-by-letter scramble reveal animation
   - Animated counting stats strip

   CTA SECTION:
   - Gradient headline using brand colors
   - Ambient glow background effect
   - Scroll-triggered fade-in

6. Use a single GSAP master timeline for the hero to avoid ScrollTrigger pin conflicts
7. Run the dev server so I can preview it

Make the new features feel premium, immersive, and heavily animated. Every section should have scroll-triggered entrance animations.

========================================
END OF PROMPT
========================================