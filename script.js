/**
 * ROMANTIC SURPRISE WEBSITE - CORE FOUNDATION & COMPONENT CONTROLLER
 * Vanilla ES6 JavaScript | Mobile-First & High Performance
 */

/* ==========================================================================
   1. GLOBAL CONFIGURATION & STATE
   ========================================================================== */
const MEDIA_CONFIG = {
  imagesCount: 42,         // Scanned total 42 images
  videosCount: 2,          // Scanned total 2 videos
  musicCount: 1,           // Scanned total 1 music file
  imageExtension: 'jpg',
  videoExtension: 'mp4',
  familyPhotoIndex: 30,    // Image index used as the final family photo (e.g. 31.jpg)
  fallbackColors: [
    ['#3a1c28', '#b76e79'],
    ['#1c183a', '#5f79a2'],
    ['#2d1c3a', '#8e5fa2'],
    ['#3a2c1c', '#a2885f'],
    ['#1c3a23', '#5fa26b']
  ]
};

// Global State
const AppState = {
  isMusicPlaying: false,
  mediaManifest: { images: [], videos: [], music: [] },
  isTouchDevice: false,
  
  // Navigation & Intro Flow
  activePhotoIndex: 0,
  storyTimeoutIds: [],
  storyPhrases: [
    "Every picture tells a story...",
    "Every smile became a beautiful memory...",
    "Eight wonderful years...",
    "Filled with love."
  ],

  // Transitions
  currentSection: 'landing', // landing, story, gallery, video, surprise, finished

  // Fullscreen Viewer gestures & FLIP
  viewerScale: 1,
  viewerTranslateY: 0,
  isViewerZoomed: false,
  activeFlipCard: null,      // Bounding rect details for returning FLIP anims
  
  // Final Message Typings
  birthdayMessages: [
    { text: "❤️", type: "title" },
    { text: "HAPPY BIRTHDAY", type: "title" },
    { text: "KIRUBA", type: "title" },
    { text: "❤️", type: "title" },
    { text: "Eight beautiful years...", type: "body" },
    { text: "Countless unforgettable memories...", type: "body" },
    { text: "A lifetime of love...", type: "body" },
    { text: "And the greatest gift...", type: "body" },
    { text: "Your beautiful family.", type: "body" },
    { text: "Thank you for filling every day with love, laughter, kindness and happiness.", type: "long" },
    { text: "No matter where life takes us...", type: "body" },
    { text: "You will always be the heart of this beautiful story.", type: "body" },
    { text: "May this birthday bring you as much happiness as you have given to everyone around you.", type: "long" },
    { text: "Happy Birthday, Kiruba.", type: "body" },
    { text: "With all my love ❤️", type: "body" }
  ]
};

// Detect touch device
window.addEventListener('touchstart', function onFirstTouch() {
  AppState.isTouchDevice = true;
  document.body.classList.add('touch-device');
  window.removeEventListener('touchstart', onFirstTouch, false);
}, false);


/* ==========================================================================
   2. HIGH-PERFORMANCE CANVAS FX ENGINE (CONCURRENT PHYSICS)
   ========================================================================== */
const FXManager = (() => {
  let canvas, ctx;
  let width, height;
  let animationFrameId = null;
  let active = false;

  // Particle pools
  const bgParticles = [];
  const confettiParticles = [];
  const fireworkExplosions = [];
  const cursorSparkles = [];
  let celebrationRaysActive = false;
  let celebrationRayAngle = 0;

  const colors = {
    roseGold: 'rgba(183, 110, 121, ',
    roseGoldLight: 'rgba(224, 168, 153, ',
    gold: 'rgba(229, 193, 88, ',
    pinkGlow: 'rgba(255, 183, 197, ',
    plum: 'rgba(20, 11, 16, '
  };

  class DustParticle {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + 10;
      this.size = Math.random() * 2 + 0.5;
      this.speed = Math.random() * 0.5 + 0.1;
      this.alpha = Math.random() * 0.5 + 0.15;
      this.oscillationSpeed = Math.random() * 0.02 + 0.005;
      this.angle = Math.random() * Math.PI * 2;
    }

    update() {
      this.y -= this.speed;
      this.angle += this.oscillationSpeed;
      this.x += Math.sin(this.angle) * 0.15;

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = colors.roseGoldLight + this.alpha + ')';
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(255, 183, 197, 0.4)';
      ctx.fill();
    }
  }

  class FloatingHeart {
    constructor() {
      this.reset();
      this.y = height + Math.random() * 100;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + 50;
      this.size = Math.random() * 8 + 6;
      this.speed = Math.random() * 0.6 + 0.3;
      this.alpha = Math.random() * 0.25 + 0.1;
      this.scale = 1;
      this.rotation = (Math.random() - 0.5) * 0.3;
      this.swingSpeed = Math.random() * 0.015 + 0.005;
      this.swingAngle = Math.random() * Math.PI;
    }

    update() {
      this.y -= this.speed;
      this.swingAngle += this.swingSpeed;
      this.x += Math.sin(this.swingAngle) * 0.25;

      if (this.y < -50) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.scale, this.scale);
      ctx.beginPath();
      
      const topCurveHeight = this.size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, topCurveHeight, 0, this.size);
      ctx.bezierCurveTo(this.size, topCurveHeight, this.size/2, -this.size/2, 0, topCurveHeight);
      
      ctx.closePath();
      ctx.fillStyle = colors.roseGold + this.alpha + ')';
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(183, 110, 121, 0.3)';
      ctx.fill();
      ctx.restore();
    }
  }

  class Confetti {
    constructor(x, y, isGoldOnly = false) {
      this.x = x || width / 2;
      this.y = y || -20;
      this.size = Math.random() * 6 + 6;
      this.color = this.getRandomColor(isGoldOnly);
      this.speedX = (Math.random() - 0.5) * 7;
      this.speedY = Math.random() * 5 + 3;
      this.gravity = 0.13;
      this.drag = 0.98;
      this.rotationX = Math.random() * Math.PI;
      this.rotationY = Math.random() * Math.PI;
      this.rotationSpeedX = (Math.random() - 0.5) * 0.15;
      this.rotationSpeedY = (Math.random() - 0.5) * 0.15;
      this.alpha = 1;
    }

    getRandomColor(isGoldOnly) {
      if (isGoldOnly) {
        const golds = ['#d4af37', '#e5c158', '#ffd700', '#ebd3be', '#c5a059'];
        return golds[Math.floor(Math.random() * golds.length)];
      }
      const palette = [
        colors.roseGold + '1)',
        colors.roseGoldLight + '1)',
        colors.gold + '1)',
        'rgba(255, 183, 197, 1)',
        'rgba(255, 255, 255, 0.9)'
      ];
      return palette[Math.floor(Math.random() * palette.length)];
    }

    update() {
      this.speedX *= this.drag;
      this.speedY = (this.speedY + this.gravity) * this.drag;
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotationX += this.rotationSpeedX;
      this.rotationY += this.rotationSpeedY;

      if (this.y > height) {
        this.alpha -= 0.02;
      }
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotationX);
      ctx.scale(Math.sin(this.rotationY), 1);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  class FireworkSpark {
    constructor(x, y, hue) {
      this.x = x;
      this.y = y;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 5 + 1.8;
      this.friction = 0.94;
      this.gravity = 0.08;
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.008;
      this.hue = hue;
    }

    update() {
      this.speed *= this.friction;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed + this.gravity;
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.random() * 1.8 + 0.8, 0, Math.PI * 2);
      let colorStr = colors.roseGoldLight;
      if (this.hue === 1) colorStr = colors.gold;
      if (this.hue === 2) colorStr = colors.pinkGlow;
      
      ctx.fillStyle = colorStr + this.alpha + ')';
      ctx.shadowBlur = 6;
      ctx.shadowColor = colorStr + '0.6)';
      ctx.fill();
    }
  }

  class Sparkle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 3 + 1.2;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.speedY = (Math.random() - 0.5) * 1.5;
      this.alpha = 1;
      this.decay = Math.random() * 0.03 + 0.02;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.beginPath();
      
      ctx.moveTo(0, -this.size);
      ctx.quadraticCurveTo(0, 0, this.size, 0);
      ctx.quadraticCurveTo(0, 0, 0, this.size);
      ctx.quadraticCurveTo(0, 0, -this.size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -this.size);
      
      ctx.fillStyle = colors.gold + this.alpha + ')';
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(229, 193, 88, 0.6)';
      ctx.fill();
      ctx.restore();
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function init() {
    canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    resize();
    window.addEventListener('resize', resize);

    const particleCount = Math.min(30, Math.floor((width * height) / 30000));
    for (let i = 0; i < particleCount; i++) {
      bgParticles.push(new DustParticle());
    }

    for (let i = 0; i < 4; i++) {
      bgParticles.push(new FloatingHeart());
    }

    active = true;
    loop();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        active = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        active = true;
        loop();
      }
    });
  }

  function loop() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);

    // Light sun rays rendering if celebration state active
    if (celebrationRaysActive) {
      drawCelebrationRays();
    }

    // 1. Dust
    bgParticles.forEach(p => {
      p.update();
      p.draw();
    });

    // 2. Confetti
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.update();
      if (p.alpha <= 0) {
        confettiParticles.splice(i, 1);
      } else {
        p.draw();
      }
    }

    // 3. Fireworks
    for (let i = fireworkExplosions.length - 1; i >= 0; i--) {
      const spark = fireworkExplosions[i];
      spark.update();
      if (spark.alpha <= 0) {
        fireworkExplosions.splice(i, 1);
      } else {
        spark.draw();
      }
    }

    // 4. Sparkles
    for (let i = cursorSparkles.length - 1; i >= 0; i--) {
      const sp = cursorSparkles[i];
      sp.update();
      if (sp.alpha <= 0) {
        cursorSparkles.splice(i, 1);
      } else {
        sp.draw();
      }
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  function drawCelebrationRays() {
    celebrationRayAngle += 0.0015;
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(celebrationRayAngle);
    
    const rayCount = 24;
    const maxRadius = Math.max(width, height);
    for (let i = 0; i < rayCount; i++) {
      const angle1 = (i / rayCount) * Math.PI * 2;
      const angle2 = ((i + 0.4) / rayCount) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxRadius, angle1, angle2);
      ctx.closePath();
      
      ctx.fillStyle = 'rgba(229, 193, 88, 0.015)';
      ctx.fill();
    }
    ctx.restore();
  }

  function triggerConfetti(startX, startY, isGoldOnly = false) {
    const x = startX || Math.random() * width;
    const y = startY || (height * 0.2);
    const count = 55;
    for (let i = 0; i < count; i++) {
      confettiParticles.push(new Confetti(x + (Math.random() - 0.5) * 30, y, isGoldOnly));
    }
  }

  function triggerFirework(startX, startY) {
    const x = startX || Math.random() * width * 0.6 + width * 0.2;
    const y = startY || Math.random() * height * 0.4 + height * 0.15;
    const count = 85;
    const hue = Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      fireworkExplosions.push(new FireworkSpark(x, y, hue));
    }
  }

  function triggerHeartsBurst(startX, startY) {
    const x = startX || width / 2;
    const y = startY || height / 2;
    const count = 12;
    for (let i = 0; i < count; i++) {
      const heart = new FloatingHeart();
      heart.x = x + (Math.random() - 0.5) * 40;
      heart.y = y + (Math.random() - 0.5) * 40;
      heart.speed = Math.random() * 2.5 + 1.2;
      heart.alpha = Math.random() * 0.6 + 0.35;
      heart.scale = Math.random() * 0.8 + 0.6;
      bgParticles.push(heart);
    }
  }

  function spawnSparkle(x, y) {
    cursorSparkles.push(new Sparkle(x, y));
  }

  function setCelebrationRays(isActive) {
    celebrationRaysActive = isActive;
  }

  return {
    init,
    triggerConfetti,
    triggerFirework,
    triggerHeartsBurst,
    spawnSparkle,
    setCelebrationRays
  };
})();


/* ==========================================================================
   3. TOAST NOTIFICATION MODULE
   ========================================================================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast glass-card`;
  
  let icon = '✨';
  if (type === 'love') icon = '❤️';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 2800);
}


/* ==========================================================================
   4. SEAMLESS BACKGROUND MUSIC & VOLUME PERSISTENCE
   ========================================================================== */
const AudioManager = (() => {
  let bgMusic, toggleBtn, volumeSlider;
  let playIcon, muteIcon;

  function init() {
    bgMusic = document.getElementById('bg-music-element');
    toggleBtn = document.getElementById('music-toggle-btn');
    volumeSlider = document.getElementById('volume-slider');

    if (!bgMusic || !toggleBtn) return;

    playIcon = toggleBtn.querySelector('.icon-music-playing');
    muteIcon = toggleBtn.querySelector('.icon-music-muted');

    const storedVolume = localStorage.getItem('musicVolume');
    if (storedVolume !== null) {
      const vol = parseFloat(storedVolume);
      bgMusic.volume = vol;
      if (volumeSlider) volumeSlider.value = vol;
    } else {
      bgMusic.volume = 0.6;
      if (volumeSlider) volumeSlider.value = 0.6;
    }

    toggleBtn.addEventListener('click', toggleMute);

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        bgMusic.volume = val;
        localStorage.setItem('musicVolume', val);
        
        if (val === 0) {
          bgMusic.muted = true;
          playIcon.classList.add('hidden');
          muteIcon.classList.remove('hidden');
        } else {
          bgMusic.muted = false;
          playIcon.classList.remove('hidden');
          muteIcon.classList.add('hidden');
        }
      });
    }
  }

  function start() {
    bgMusic.play()
      .then(() => {
        AppState.isMusicPlaying = true;
        playIcon.classList.remove('hidden');
        muteIcon.classList.add('hidden');
        toggleBtn.classList.add('glow-pulse');
      })
      .catch((err) => {
        console.warn("Audio autoplay blocked by security protocols, awaiting tap:", err);
      });
  }

  function toggleMute() {
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        AppState.isMusicPlaying = true;
        playIcon.classList.remove('hidden');
        muteIcon.classList.add('hidden');
        toggleBtn.classList.add('glow-pulse');
        showToast("Music Unmuted", "love");
      });
    } else {
      bgMusic.pause();
      AppState.isMusicPlaying = false;
      playIcon.classList.add('hidden');
      muteIcon.classList.remove('hidden');
      toggleBtn.classList.remove('glow-pulse');
      showToast("Music Muted", "warning");
    }
  }

  return {
    init,
    start
  };
})();


/* ==========================================================================
   5. OPENING EXPERIENCE FLOW (TAP TO BEGIN -> STORY SEQUENCE)
   ========================================================================== */
function initOpeningExperience() {
  const beginBtn = document.getElementById('begin-experience-btn');
  const landingScreen = document.getElementById('landing-screen');
  const storyScreen = document.getElementById('story-screen');
  const skipBtn = document.getElementById('skip-intro-btn');
  const skipOverlay = document.getElementById('story-skip-overlay');

  if (!beginBtn) return;

  beginBtn.addEventListener('click', () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen request blocked:", err);
      });
    }

    AudioManager.start();
    AppState.currentSection = 'story';

    landingScreen.classList.remove('active-screen');
    landingScreen.classList.add('fade-out');

    setTimeout(() => {
      landingScreen.classList.add('hidden');
      if (storyScreen) {
        storyScreen.classList.add('active-screen');
        startStoryIntroduction();
      }
    }, 800);
  });

  const triggerSkip = () => {
    endStoryIntroduction();
  };
  if (skipBtn) skipBtn.addEventListener('click', triggerSkip);
  if (skipOverlay) skipOverlay.addEventListener('click', triggerSkip);
}

function startStoryIntroduction() {
  AppState.storyTimeoutIds.forEach(id => clearTimeout(id));
  AppState.storyTimeoutIds = [];
  typeStoryPhrase(0);
}

function typeStoryPhrase(phraseIndex) {
  const container = document.getElementById('story-typewriter');
  if (!container) return;

  if (phraseIndex >= AppState.storyPhrases.length) {
    endStoryIntroduction();
    return;
  }

  const currentText = AppState.storyPhrases[phraseIndex];
  container.innerHTML = '';
  container.style.opacity = 1;

  const textSpan = document.createElement('span');
  const cursorSpan = document.createElement('span');
  cursorSpan.className = 'typewriter-cursor';
  container.appendChild(textSpan);
  container.appendChild(cursorSpan);

  let charIdx = 0;
  function typeChar() {
    if (charIdx < currentText.length) {
      textSpan.textContent += currentText.charAt(charIdx);
      charIdx++;
      const delay = 40 + Math.random() * 25;
      const typeTimer = setTimeout(typeChar, delay);
      AppState.storyTimeoutIds.push(typeTimer);
    } else {
      const delayBetween = phraseIndex === AppState.storyPhrases.length - 1 ? 1600 : 1800;
      const holdTimer = setTimeout(() => {
        container.style.opacity = 0;
        const nextTimer = setTimeout(() => {
          typeStoryPhrase(phraseIndex + 1);
        }, 400);
        AppState.storyTimeoutIds.push(nextTimer);
      }, delayBetween);
      AppState.storyTimeoutIds.push(holdTimer);
    }
  }

  typeChar();
}

function endStoryIntroduction() {
  AppState.storyTimeoutIds.forEach(id => clearTimeout(id));
  AppState.storyTimeoutIds = [];

  const storyScreen = document.getElementById('story-screen');
  const galleryScreen = document.getElementById('gallery-screen');
  const fab = document.getElementById('global-surprise-fab');

  if (!storyScreen) return;

  storyScreen.classList.remove('active-screen');
  storyScreen.style.opacity = 0;
  AppState.currentSection = 'gallery';

  setTimeout(() => {
    storyScreen.classList.add('hidden');
    if (galleryScreen) {
      galleryScreen.classList.add('active-screen');
      if (fab) fab.classList.remove('hidden');
      
      FXManager.triggerHeartsBurst();
      setTimeout(() => FXManager.triggerConfetti(), 300);
      
      document.querySelectorAll('#gallery-grid .gallery-card').forEach(card => {
        card.classList.add('revealed');
      });
    }
  }, 1000);
}


/* ==========================================================================
   6. DYNAMIC CINEMATIC TEXT PLAYER (UNIVERSAL SCREEN)
   ========================================================================== */
const CinematicTextPlayer = (() => {
  let screen, textTarget;
  let currentPhrases = [];
  let phraseIndex = 0;
  let onCompleteCallback = null;
  let delayDuration = 1800;

  function init() {
    screen = document.getElementById('cinematic-transition-screen');
    textTarget = document.getElementById('cinematic-transition-text');
  }

  function play(phrases, onComplete, delay = 1800) {
    if (!screen || !textTarget) return;

    currentPhrases = phrases;
    phraseIndex = 0;
    onCompleteCallback = onComplete;
    delayDuration = delay;

    // Reveal transition screen
    screen.classList.remove('hidden');
    screen.classList.add('active-screen');

    playNextPhrase();
  }

  function playNextPhrase() {
    if (phraseIndex >= currentPhrases.length) {
      // Done. Fade screen out
      screen.classList.remove('active-screen');
      setTimeout(() => {
        screen.classList.add('hidden');
        if (onCompleteCallback) onCompleteCallback();
      }, 800);
      return;
    }

    const phrase = currentPhrases[phraseIndex];
    textTarget.textContent = phrase;
    textTarget.style.opacity = 1;

    setTimeout(() => {
      textTarget.style.opacity = 0;
      setTimeout(() => {
        phraseIndex++;
        playNextPhrase();
      }, 600); // Wait for transition fade-out
    }, delayDuration);
  }

  return {
    init,
    play
  };
})();


/* ==========================================================================
   7. PHOTO GRID LOADER & FLIP ANIMATION TRANSITIONS
   ========================================================================== */
async function loadMediaManifest() {
  try {
    const res = await fetch('media-manifest.json');
    if (!res.ok) throw new Error('Manifest missing');
    const manifest = await res.json();
    AppState.mediaManifest = manifest;
    console.log("Successfully loaded media manifest:", manifest);
  } catch (err) {
    console.warn("Manifest loading error, fallback config counts:", err);
    AppState.mediaManifest.images = Array.from({ length: MEDIA_CONFIG.imagesCount }, (_, i) => `${i + 1}.${MEDIA_CONFIG.imageExtension}`);
    AppState.mediaManifest.videos = Array.from({ length: MEDIA_CONFIG.videosCount }, (_, i) => `${i + 1}.${MEDIA_CONFIG.videoExtension}`);
    AppState.mediaManifest.music = Array.from({ length: MEDIA_CONFIG.musicCount }, (_, i) => `${i + 1}.mp3`);
  }
}

function setupGalleryShowcase() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;

  galleryGrid.innerHTML = '';
  galleryGrid.removeAttribute('aria-busy');

  const images = AppState.mediaManifest.images || [];

  if (images.length === 0) {
    galleryGrid.innerHTML = '<div class="glass-card pad-md font-sans text-center" style="grid-column: 1/-1">No memory images added yet</div>';
    return;
  }

  images.forEach((imgFilename, i) => {
    const card = document.createElement('div');
    card.className = 'gallery-card reveal-on-scroll';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View photo memory ${i + 1}`);

    const img = new Image();
    img.alt = `Memory Photo ${i + 1}`;
    img.loading = 'lazy';
    
    const filePath = `images/${imgFilename}`;
    img.src = filePath;

    img.onerror = () => {
      img.src = generateFallbackPlaceholder('PHOTO MEMORY', i);
    };

    img.onload = () => {
      img.decode().then(() => {
        card.classList.add('loaded');
      }).catch(() => {
        card.classList.add('loaded');
      });
    };

    card.appendChild(img);
    galleryGrid.appendChild(card);

    // Click handler utilizing First-Last-Invert-Play (FLIP)
    const openCard = () => {
      AppState.activePhotoIndex = i;
      
      // Save card element and rect details for closing spring back transition
      AppState.activeFlipCard = card;
      FullscreenPhotoViewer.openWithFLIP(card);
    };

    card.addEventListener('click', openCard);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCard();
      }
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });
}


/* ==========================================================================
   8. FULLSCREEN PHOTO VIEWER (FLIP ZOOM + TOUCH GESTURES SYSTEM)
   ========================================================================== */
const FullscreenPhotoViewer = (() => {
  let viewer, slider, counter, closeBtn;
  let prevBtn, nextBtn;
  
  let startX = 0;
  let startY = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isDragging = false;
  let activeTouchMode = null; // swipe, drag-close, pinch
  let lastTap = 0;

  let initialPinchDist = 0;
  let initialScale = 1;

  function init() {
    viewer = document.getElementById('fullscreen-photo-viewer');
    slider = document.getElementById('photo-viewer-slider');
    counter = document.getElementById('photo-viewer-counter');
    closeBtn = document.getElementById('photo-viewer-close');
    prevBtn = document.getElementById('photo-viewer-prev');
    nextBtn = document.getElementById('photo-viewer-next');

    if (!viewer) return;

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    slider.addEventListener('touchstart', touchStart, { passive: true });
    slider.addEventListener('touchmove', touchMove, { passive: false });
    slider.addEventListener('touchend', touchEnd);

    window.addEventListener('keydown', (e) => {
      if (!viewer.classList.contains('active')) return;
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'Escape') close();
    });
  }

  function openWithFLIP(cardElement) {
    viewer.style.transition = 'none';
    viewer.style.opacity = 0;
    viewer.classList.add('active');
    document.body.style.overflow = 'hidden';

    buildSlides();
    updateCounter();
    
    // Calculate FLIP animation states
    const firstRect = cardElement.getBoundingClientRect();
    currentTranslate = -AppState.activePhotoIndex * window.innerWidth;
    prevTranslate = currentTranslate;
    slider.style.transform = `translateX(${currentTranslate}px)`;

    const img = getActiveImage();
    if (img) {
      img.style.opacity = 0;
      
      // Wait for DOM to render the centered fullscreen view to compute "Last" bounds
      requestAnimationFrame(() => {
        const lastRect = img.getBoundingClientRect();
        
        // Compute ratios
        const deltaX = (firstRect.left + firstRect.width / 2) - (lastRect.left + lastRect.width / 2);
        const deltaY = (firstRect.top + firstRect.height / 2) - (lastRect.top + lastRect.height / 2);
        const scale = firstRect.width / lastRect.width;

        // Apply Inverted transform directly to image
        img.style.transformOrigin = 'center center';
        img.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
        img.style.opacity = 1;
        
        // Fade in backdrop
        viewer.classList.add('flip-animating');
        viewer.style.transition = 'opacity 0.5s ease';
        viewer.style.opacity = 1;
        viewer.style.backgroundColor = 'rgba(6, 3, 5, 0.95)';

        // Force browser layout repaint
        img.offsetHeight;

        // Trigger spring animation transition
        img.classList.add('flip-transition');
        img.style.transform = 'none';

        img.addEventListener('transitionend', function handler() {
          img.classList.remove('flip-transition');
          viewer.classList.remove('flip-animating');
          img.removeEventListener('transitionend', handler);
        });
      });
    } else {
      viewer.style.opacity = 1;
    }
  }

  function close() {
    const img = getActiveImage();
    const card = AppState.activeFlipCard;

    if (img && card) {
      viewer.classList.add('flip-animating');
      
      // Calculate current grid coordinate dynamically (handles scrolling offsets)
      const targetRect = card.getBoundingClientRect();
      const currentRect = img.getBoundingClientRect();

      const deltaX = (targetRect.left + targetRect.width / 2) - (currentRect.left + currentRect.width / 2);
      const deltaY = (targetRect.top + targetRect.height / 2) - (currentRect.top + currentRect.height / 2);
      const scale = targetRect.width / currentRect.width;

      img.classList.add('flip-transition');
      img.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
      
      viewer.style.transition = 'opacity 0.45s ease';
      viewer.style.opacity = 0;

      img.addEventListener('transitionend', function handler() {
        img.classList.remove('flip-transition');
        viewer.classList.remove('flip-animating');
        viewer.classList.remove('active');
        document.body.style.overflow = '';
        viewer.style.backgroundColor = '';
        resetZoom();
        img.removeEventListener('transitionend', handler);
      });
    } else {
      viewer.classList.remove('active');
      document.body.style.overflow = '';
      resetZoom();
    }
  }

  function buildSlides() {
    slider.innerHTML = '';
    const images = AppState.mediaManifest.images || [];

    images.forEach((imgFilename, index) => {
      const slide = document.createElement('div');
      slide.className = 'viewer-slide';

      const img = new Image();
      const filePath = `images/${imgFilename}`;
      img.src = filePath;

      img.onerror = () => {
        img.src = generateFallbackPlaceholder('PHOTO MEMORY', index);
      };

      img.addEventListener('click', (e) => handleDoubleTap(e, img));

      slide.appendChild(img);
      slider.appendChild(slide);
    });
  }

  function showPrev() {
    if (AppState.activePhotoIndex > 0) {
      AppState.activePhotoIndex--;
      resetZoom();
      updateSliderPosition();
      updateCounter();
      // Sync active flip target card in grid
      syncFlipCardTarget();
    }
  }

  function showNext() {
    const images = AppState.mediaManifest.images || [];
    if (AppState.activePhotoIndex < images.length - 1) {
      AppState.activePhotoIndex++;
      resetZoom();
      updateSliderPosition();
      updateCounter();
      // Sync active flip target card in grid
      syncFlipCardTarget();
    }
  }

  function syncFlipCardTarget() {
    const cards = document.querySelectorAll('#gallery-grid .gallery-card');
    if (cards.length > 0 && cards[AppState.activePhotoIndex]) {
      AppState.activeFlipCard = cards[AppState.activePhotoIndex];
    }
  }

  function updateSliderPosition() {
    slider.classList.add('transitioning');
    currentTranslate = -AppState.activePhotoIndex * window.innerWidth;
    prevTranslate = currentTranslate;
    slider.style.transform = `translateX(${currentTranslate}px)`;
  }

  function updateCounter() {
    const total = AppState.mediaManifest.images ? AppState.mediaManifest.images.length : 0;
    counter.textContent = `${AppState.activePhotoIndex + 1} / ${total}`;
  }

  function resetZoom() {
    AppState.viewerScale = 1;
    AppState.viewerTranslateY = 0;
    AppState.isViewerZoomed = false;

    const img = getActiveImage();
    if (img) {
      img.style.transform = 'none';
    }
  }

  function getActiveImage() {
    const slides = slider.querySelectorAll('.viewer-slide');
    if (slides.length > 0 && slides[AppState.activePhotoIndex]) {
      return slides[AppState.activePhotoIndex].querySelector('img');
    }
    return null;
  }

  // --- TOUCH GESTURE DECODERS ---
  function touchStart(e) {
    slider.classList.remove('transitioning');
    const img = getActiveImage();
    if (img) img.classList.remove('spring-return');

    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    activeTouchMode = null;

    if (e.touches.length === 2) {
      activeTouchMode = 'pinch';
      initialPinchDist = getPinchDistance(e);
      initialScale = AppState.viewerScale;
    }
  }

  function touchMove(e) {
    if (!isDragging) return;

    const img = getActiveImage();
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX;
    const diffY = currentY - startY;

    if (e.touches.length === 2 && activeTouchMode === 'pinch') {
      e.preventDefault();
      const currentDist = getPinchDistance(e);
      const ratio = currentDist / initialPinchDist;
      AppState.viewerScale = Math.max(1, Math.min(3, initialScale * ratio));
      AppState.isViewerZoomed = AppState.viewerScale > 1.05;
      
      if (img) {
        img.style.transform = `scale(${AppState.viewerScale})`;
      }
      return;
    }

    if (e.touches.length === 1) {
      if (!activeTouchMode) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          activeTouchMode = 'swipe';
        } else {
          activeTouchMode = 'drag-close';
        }
      }

      if (activeTouchMode === 'swipe') {
        if (AppState.isViewerZoomed) return;
        const translate = prevTranslate + diffX;
        slider.style.transform = `translateX(${translate}px)`;
      }

      if (activeTouchMode === 'drag-close') {
        e.preventDefault();
        if (AppState.isViewerZoomed) return;

        AppState.viewerTranslateY = diffY;
        if (img) {
          const scaleFactor = 1 - Math.min(0.2, Math.abs(diffY) / 1000);
          img.style.transform = `translateY(${diffY}px) scale(${scaleFactor})`;
          
          const fadeRatio = 1 - Math.min(0.85, Math.abs(diffY) / 380);
          viewer.style.backgroundColor = `rgba(6, 3, 5, ${0.95 * fadeRatio})`;
        }
      }
    }
  }

  function touchEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    
    const img = getActiveImage();

    if (activeTouchMode === 'swipe') {
      const currentX = (e.changedTouches && e.changedTouches[0].clientX) || 0;
      const diffX = currentX - startX;
      slider.classList.add('transitioning');
      
      if (diffX < -70) {
        showNext();
      } else if (diffX > 70) {
        showPrev();
      } else {
        updateSliderPosition();
      }
    }

    if (activeTouchMode === 'drag-close') {
      const diffY = AppState.viewerTranslateY;
      
      if (diffY > 120) {
        // Drag down threshold exceeded, close
        close();
      } else {
        // Spring snap return
        if (img) {
          img.classList.add('spring-return');
          img.style.transform = 'translateY(0px) scale(1)';
          viewer.style.transition = 'background-color 0.4s';
          viewer.style.backgroundColor = 'rgba(6, 3, 5, 0.95)';
          
          setTimeout(() => {
            img.classList.remove('spring-return');
            viewer.style.transition = '';
          }, 400);
        }
      }
    }

    activeTouchMode = null;
  }

  function getPinchDistance(e) {
    return Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }

  function handleDoubleTap(e, img) {
    const now = new Date().getTime();
    const timeDiff = now - lastTap;
    if (timeDiff < 280 && timeDiff > 0) {
      e.stopPropagation();
      
      if (AppState.isViewerZoomed) {
        resetZoom();
      } else {
        AppState.viewerScale = 2.0;
        AppState.isViewerZoomed = true;
        img.classList.add('spring-return');
        img.style.transform = `scale(2.0)`;
        setTimeout(() => img.classList.remove('spring-return'), 400);
      }
    }
    lastTap = now;
  }

  return {
    init,
    openWithFLIP,
    close
  };
})();


/* ==========================================================================
   9. FLOW NAVIGATION & CINEMATIC TRANSITIONS (TO VIDEOS & SURPRISE)
   ========================================================================== */
function initSectionNavigation() {
  const btnGoToVideos = document.getElementById('btn-go-to-videos');
  const btnGoToSurprise = document.getElementById('btn-go-to-surprise');
  
  const galleryScreen = document.getElementById('gallery-screen');
  const videoScreen = document.getElementById('video-screen');
  const surpriseScreen = document.getElementById('surprise-screen');
  const fab = document.getElementById('global-surprise-fab');

  // A. Continue to Video Gallery Section
  if (btnGoToVideos) {
    btnGoToVideos.addEventListener('click', () => {
      FXManager.triggerHeartsBurst(window.innerWidth / 2, window.innerHeight * 0.85);
      
      // Fade gallery screen out
      if (galleryScreen) {
        galleryScreen.style.opacity = 0;
        if (fab) fab.classList.add('hidden');
      }

      setTimeout(() => {
        if (galleryScreen) galleryScreen.classList.remove('active-screen');
        
        AppState.currentSection = 'transition-1';
        
        // Play Cinematic transitions text sequences
        const phrases = [
          "Every picture captured a beautiful memory...",
          "But some memories deserved to move...",
          "So let's relive them once more..."
        ];

        CinematicTextPlayer.play(phrases, () => {
          AppState.currentSection = 'videos';
          if (videoScreen) {
            videoScreen.classList.add('active-screen');
            videoScreen.style.opacity = 1;
            setupVideoShowcase(); // Build videos grid
            
            // Re-reveal surprise burst fab
            if (fab) {
              fab.classList.remove('hidden');
            }
          }
        });

      }, 1000);
    });
  }

  // B. Continue to Final Surprise Pulsing heart Screen
  if (btnGoToSurprise) {
    btnGoToSurprise.addEventListener('click', () => {
      FXManager.triggerHeartsBurst(window.innerWidth / 2, window.innerHeight * 0.85);

      if (videoScreen) {
        videoScreen.style.opacity = 0;
        if (fab) fab.classList.add('hidden');
      }

      setTimeout(() => {
        if (videoScreen) videoScreen.classList.remove('active-screen');
        
        AppState.currentSection = 'transition-2';
        
        // Play Cinematic Transition 2 Phrases
        const phrases = [
          "Every smile...",
          "Every hug...",
          "Every little moment...",
          "Made these eight years unforgettable.",
          "You built not only a beautiful love...",
          "But also a beautiful family."
        ];

        CinematicTextPlayer.play(phrases, () => {
          AppState.currentSection = 'surprise';
          if (surpriseScreen) {
            surpriseScreen.classList.add('active-screen');
            surpriseScreen.style.opacity = 1;
            initSurpriseActivation(); // Active heart surprise triggers
          }
        }, 1900); // Slightly slower hold per line for emotional gravity

      }, 1000);
    });
  }
}


/* ==========================================================================
   10. VIDEO GALLERY LOADER & CUSTOM fullscreen PLAYER
   ========================================================================== */
function setupVideoShowcase() {
  const videoGrid = document.getElementById('video-grid');
  if (!videoGrid) return;

  videoGrid.innerHTML = '';
  videoGrid.removeAttribute('aria-busy');

  const videos = AppState.mediaManifest.videos || [];

  if (videos.length === 0) {
    videoGrid.innerHTML = '<div class="glass-card pad-md font-sans text-center" style="grid-column: 1/-1">No video memories added yet</div>';
    return;
  }

  videos.forEach((vidFilename, i) => {
    const card = document.createElement('div');
    card.className = 'video-card glass-card reveal-on-scroll';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Play video clip ${i + 1}`);

    // Generate consistent, high-quality, instant gradient thumbnail matching the theme
    const thumbnail = new Image();
    thumbnail.className = 'video-card-thumbnail';
    thumbnail.alt = `Video thumbnail ${i + 1}`;
    thumbnail.src = generateFallbackPlaceholder('VIDEO MEMORY', i, 400, 500);

    const playOverlay = document.createElement('div');
    playOverlay.className = 'video-play-overlay-badge';
    playOverlay.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    `;

    const titleShelf = document.createElement('div');
    titleShelf.className = 'video-card-title-shelf';
    titleShelf.textContent = `Memory Clip #${i + 1}`;

    card.appendChild(thumbnail);
    card.appendChild(playOverlay);
    card.appendChild(titleShelf);
    videoGrid.appendChild(card);

    // Open video play viewer
    const playVideo = () => {
      CustomVideoPlayer.open(`videos/${vidFilename}`);
    };
    card.addEventListener('click', playVideo);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playVideo();
      }
    });
  });

  // Re-observer cards reveal
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('#video-grid .reveal-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });
}

// Fullscreen Video Player Module (Custom controls + swipe down close)
const CustomVideoPlayer = (() => {
  let viewer, video, controls;
  let playBtn, playCenterBtn, muteBtn, fsBtn, timeDisplay;
  let seekContainer, seekTrack, seekProgress, seekHandle;
  let controlsTimeout = null;
  let isSeeking = false;

  // Swipe-close gestures variables
  let startY = 0;
  let isDragging = false;
  let translateVal = 0;

  function init() {
    viewer = document.getElementById('fullscreen-video-viewer');
    video = document.getElementById('custom-video-element');
    controls = document.getElementById('video-controls');
    
    if (!viewer || !video) return;

    playBtn = document.getElementById('video-play-btn');
    playCenterBtn = document.getElementById('video-center-play-btn');
    muteBtn = document.getElementById('video-mute-btn');
    fsBtn = document.getElementById('video-fs-btn');
    timeDisplay = document.getElementById('video-time-display');
    
    seekContainer = document.getElementById('video-seek-container');
    seekTrack = document.getElementById('video-seek-track');
    seekProgress = document.getElementById('video-seek-progress');
    seekHandle = document.getElementById('video-seek-handle');

    // Controls setup
    viewer.querySelector('.viewer-close-btn').addEventListener('click', close);
    
    playBtn.addEventListener('click', togglePlay);
    playCenterBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', () => {
      togglePlay();
      showControlsTemporarily();
    });

    muteBtn.addEventListener('click', toggleMute);
    fsBtn.addEventListener('click', toggleFullscreen);

    // Track slider dragging
    seekContainer.addEventListener('mousedown', startSeek);
    seekContainer.addEventListener('touchstart', startSeek, { passive: true });
    window.addEventListener('mousemove', seekMove);
    window.addEventListener('touchmove', seekMove, { passive: true });
    window.addEventListener('mouseup', endSeek);
    window.addEventListener('touchend', endSeek);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('durationchange', updateProgress);
    video.addEventListener('ended', () => {
      showPlayState(false);
      showControls();
    });

    // Touch Swipe down to close on viewport
    const viewport = document.getElementById('video-player-viewport');
    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return;
      isDragging = true;
      startY = e.touches[0].clientY;
      video.style.transition = 'none';
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const diffY = e.touches[0].clientY - startY;
      if (diffY > 0) {
        e.preventDefault(); // Lock browser bounces
        translateVal = diffY;
        
        // Translate and scale video
        const scale = 1 - Math.min(0.2, diffY / 1000);
        video.style.transform = `translateY(${diffY}px) scale(${scale})`;
        
        // Fade out backdrop
        const opacity = 1 - Math.min(0.85, diffY / 380);
        viewer.style.backgroundColor = `rgba(6, 3, 5, ${0.95 * opacity})`;
      }
    }, { passive: false });

    viewport.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      if (translateVal > 120) {
        close();
      } else {
        // Reset positioning spring snap
        video.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        video.style.transform = 'none';
        viewer.style.transition = 'background-color 0.4s';
        viewer.style.backgroundColor = 'rgba(6, 3, 5, 0.95)';
        
        setTimeout(() => {
          video.style.transition = '';
          viewer.style.transition = '';
        }, 400);
      }
      translateVal = 0;
    });

    viewer.addEventListener('mousemove', showControlsTemporarily);
    viewer.addEventListener('touchstart', showControlsTemporarily, { passive: true });
  }

  function open(srcPath) {
    const bgMusic = document.getElementById('bg-music-element');
    if (bgMusic && !bgMusic.paused) bgMusic.pause();

    viewer.classList.add('active');
    document.body.style.overflow = 'hidden';

    const source = video.querySelector('source');
    source.src = srcPath;
    video.load();

    video.play().then(() => {
      showPlayState(true);
      showControlsTemporarily();
    }).catch(err => {
      console.warn("Autoplay block, waiting interaction:", err);
      showPlayState(false);
      showControls();
    });
  }

  function close() {
    video.pause();
    
    // Resume background music safely
    const bgMusic = document.getElementById('bg-music-element');
    if (bgMusic && AppState.isMusicPlaying) {
      bgMusic.play().catch(e => console.log(e));
    }

    viewer.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset placements
    video.style.transform = '';
    viewer.style.backgroundColor = '';
  }

  function togglePlay() {
    if (video.paused || video.ended) {
      video.play().then(() => {
        showPlayState(true);
        showControlsTemporarily();
      });
    } else {
      video.pause();
      showPlayState(false);
      showControls();
    }
  }

  function showPlayState(isPlaying) {
    const playSvg = playBtn.querySelector('.icon-video-play');
    const pauseSvg = playBtn.querySelector('.icon-video-pause');

    if (isPlaying) {
      playSvg.classList.add('hidden');
      pauseSvg.classList.remove('hidden');
      playCenterBtn.style.opacity = '0';
      setTimeout(() => {
        if (isPlaying) playCenterBtn.classList.add('hidden');
      }, 300);
    } else {
      playCenterBtn.classList.remove('hidden');
      playCenterBtn.style.opacity = '1';
      playSvg.classList.remove('hidden');
      pauseSvg.classList.add('hidden');
    }
  }

  function toggleMute() {
    video.muted = !video.muted;
    const unmuteSvg = muteBtn.querySelector('.icon-video-unmuted');
    const muteSvg = muteBtn.querySelector('.icon-video-muted');

    if (video.muted) {
      unmuteSvg.classList.add('hidden');
      muteSvg.classList.remove('hidden');
      showToast("Muted Video");
    } else {
      unmuteSvg.classList.remove('hidden');
      muteSvg.classList.add('hidden');
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      viewer.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  function startSeek(e) {
    isSeeking = true;
    seekTo(e);
  }

  function seekMove(e) {
    if (!isSeeking) return;
    seekTo(e);
  }

  function endSeek() {
    isSeeking = false;
  }

  function seekTo(e) {
    const rect = seekTrack.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    let ratio = (clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio));

    seekProgress.style.width = `${ratio * 100}%`;
    seekHandle.style.left = `${ratio * 100}%`;

    if (video.duration) {
      video.currentTime = ratio * video.duration;
    }
  }

  function updateProgress() {
    if (isSeeking) return;

    const current = video.currentTime || 0;
    const total = video.duration || 0;
    const ratio = total > 0 ? current / total : 0;

    seekProgress.style.width = `${ratio * 100}%`;
    seekHandle.style.left = `${ratio * 100}%`;

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    timeDisplay.textContent = `${formatTime(current)} / ${formatTime(total)}`;
  }

  function showControlsTemporarily() {
    showControls();
    if (controlsTimeout) clearTimeout(controlsTimeout);
    
    if (!video.paused) {
      controlsTimeout = setTimeout(hideControls, 3000);
    }
  }

  function showControls() {
    controls.classList.add('visible');
  }

  function hideControls() {
    if (isSeeking) return;
    controls.classList.remove('visible');
  }

  return {
    init,
    open,
    close
  };
})();


/* ==========================================================================
   13. SCREEN 6: FINAL SURPRISE & PULSE HEART EVENTS
   ========================================================================== */
function initSurpriseActivation() {
  const triggerBtn = document.getElementById('trigger-surprise-btn');
  const heartWrapper = document.getElementById('heart-button-wrapper');
  
  if (!triggerBtn) return;

  triggerBtn.addEventListener('click', () => {
    // Hide pulsing heart trigger
    if (heartWrapper) {
      heartWrapper.style.opacity = 0;
      setTimeout(() => heartWrapper.classList.add('hidden'), 800);
    }

    // Trigger golden celebration engine effects
    triggerCelebrationSurprise();
  });
}

function triggerCelebrationSurprise() {
  // A. Fire continuous burst effects
  FXManager.setCelebrationRays(true);
  
  // Continuous heart, confetti, and firework cascades
  const duration = 5000;
  const end = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }
    FXManager.triggerConfetti(null, null, true); // Gold only confetti
    FXManager.triggerHeartsBurst();
    
    if (Math.random() < 0.4) {
      FXManager.triggerFirework();
    }
  }, 350);

  // Initial immediate massive blast
  FXManager.triggerConfetti(window.innerWidth / 2, window.innerHeight / 2, true);
  FXManager.triggerHeartsBurst(window.innerWidth / 2, window.innerHeight / 2);
  FXManager.triggerFirework(window.innerWidth / 2 - 100, window.innerHeight / 2 - 100);
  FXManager.triggerFirework(window.innerWidth / 2 + 100, window.innerHeight / 2 - 80);

  // B. Load birthday letter sequences
  setTimeout(() => {
    startFinalBirthdayGreeting();
  }, 1800);
}

function startFinalBirthdayGreeting() {
  const textContainer = document.getElementById('final-message-container');
  const scrollView = document.getElementById('message-scroller-view');
  
  if (!textContainer || !scrollView) return;

  textContainer.classList.remove('hidden');
  textContainer.classList.add('active-msg');
  scrollView.innerHTML = '';

  let lineIdx = 0;
  const messages = AppState.birthdayMessages;

  function revealNextLine() {
    if (lineIdx >= messages.length) {
      // Completed letter reading, fade out text and trigger Heart mosaic ending
      setTimeout(() => {
        textContainer.classList.remove('active-msg');
        setTimeout(() => {
          textContainer.classList.add('hidden');
          // Start heart flying photo mosaic
          startHeartPhotoMosaic();
        }, 1200);
      }, 3500); // Read time before fading final message
      return;
    }

    const item = messages[lineIdx];
    const p = document.createElement('p');
    p.className = 'final-msg-line';
    
    if (item.type === 'title') {
      p.className += ' birthday-main-title';
    } else if (item.type === 'long') {
      p.className += ' birthday-long-line';
    } else {
      p.className += ' birthday-body-line';
    }
    
    p.innerHTML = item.text;
    scrollView.appendChild(p);

    // Force layout update and reveal
    p.offsetHeight;
    p.classList.add('visible-line');

    // Auto scroll view as lines compile
    p.scrollIntoView({ behavior: 'smooth', block: 'end' });

    lineIdx++;
    // Type pauses: short pause for lines, longer pauses for sections
    let delay = 1600;
    if (item.type === 'long') delay = 3000;
    if (item.text === '❤️' || item.text === 'KIRUBA') delay = 1000;

    setTimeout(revealNextLine, delay);
  }

  revealNextLine();
}


/* ==========================================================================
   14. PHOTO MOSAIC FLY-IN & FAMILY PHOTO CROSSFADE
   ========================================================================== */
function startHeartPhotoMosaic() {
  const container = document.getElementById('mosaic-container');
  if (!container) return;

  container.classList.remove('hidden');
  container.classList.add('active-mosaic');
  container.innerHTML = '';

  const images = AppState.mediaManifest.images || [];
  if (images.length === 0) return;

  const total = images.length;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2 - 10;

  // Compute heart shape bounding scales based on screen sizes
  const scale = Math.min(screenWidth, screenHeight) * 0.024;
  
  // Dimensions of small photo tiles (48x64 on mobile, 72x96 on desktop)
  const isDesktop = window.innerWidth >= 600;
  const cardW = isDesktop ? 72 : 48;
  const cardH = isDesktop ? 96 : 64;

  const cardsList = [];

  images.forEach((imgFilename, i) => {
    const card = document.createElement('div');
    card.className = 'mosaic-photo-card';
    
    const img = new Image();
    img.src = `images/${imgFilename}`;
    img.onerror = () => { img.src = generateFallbackPlaceholder('PHOTO', i); };
    
    card.appendChild(img);
    container.appendChild(card);

    // Initial state: Random scatter off-screen
    const startAngle = Math.random() * Math.PI * 2;
    const startDist = Math.max(screenWidth, screenHeight) * 0.8;
    const initialX = centerX + Math.cos(startAngle) * startDist - (cardW / 2);
    const initialY = centerY + Math.sin(startAngle) * startDist - (cardH / 2);

    card.style.left = `${initialX}px`;
    card.style.top = `${initialY}px`;
    card.style.transform = `scale(0.2) rotate(${(Math.random() - 0.5) * 360}deg)`;
    card.style.opacity = 0;

    // Mathematical heart parametric targets
    const t = (i / total) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

    const targetX = centerX + x * scale - (cardW / 2);
    const targetY = centerY + y * scale - (cardH / 2);
    
    // Rotate to follow heart borders slightly
    const rotation = (t * 180 / Math.PI) - 90;

    cardsList.push({
      element: card,
      tx: targetX,
      ty: targetY,
      rot: rotation
    });
  });

  // Trigger fly-in animation frames
  setTimeout(() => {
    cardsList.forEach((item, index) => {
      // Cascading delays for a premium scattering effect
      setTimeout(() => {
        item.element.style.opacity = 1;
        item.element.style.left = `${item.tx}px`;
        item.element.style.top = `${item.ty}px`;
        item.element.style.transform = `scale(1) rotate(${item.rot}deg)`;
      }, index * 40);
    });
  }, 100);

  // C. Wait 6 seconds, fade to best family photo
  setTimeout(() => {
    fadeMosaicToFamilyPhoto();
  }, 7500);
}

function fadeMosaicToFamilyPhoto() {
  const mosaic = document.getElementById('mosaic-container');
  const familyPhoto = document.getElementById('final-family-photo-container');
  const familyPhotoImg = document.getElementById('final-family-photo-img');

  if (!familyPhoto || !familyPhotoImg) return;

  // Retrieve configurable family photo
  const images = AppState.mediaManifest.images || [];
  const familyPhotoName = images[MEDIA_CONFIG.familyPhotoIndex % images.length];
  familyPhotoImg.src = `images/${familyPhotoName}`;

  familyPhotoImg.onerror = () => {
    familyPhotoImg.src = generateFallbackPlaceholder('KIRUBA FAMILY', 30, 800, 600);
  };

  // Fade out mosaic & fade in family photo
  if (mosaic) {
    mosaic.style.opacity = 0;
  }

  familyPhoto.classList.remove('hidden');
  familyPhoto.classList.add('active-final');

  // Deactivate celebration sun rays to keep family photo reading clearly
  FXManager.setCelebrationRays(false);

  // Keep trigger fireworks ambient sparks loop running forever
  setInterval(() => {
    FXManager.triggerHeartsBurst(Math.random() * window.innerWidth, window.innerHeight + 10);
  }, 1000);

  console.log("SURPRISE EXPERIENCE COMPLETE! THANK YOU.");
}


/* ==========================================================================
   15. APPLICATION WIDGET INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  console.log("Loading Surprise Sequence Controller...");

  // Init canvas particles
  FXManager.init();

  // Load manifest & assets
  await loadMediaManifest();

  // Start modules
  AudioManager.init();
  CinematicTextPlayer.init();
  initOpeningExperience();
  setupGalleryShowcase();
  FullscreenPhotoViewer.init();
  CustomVideoPlayer.init();
  initSectionNavigation();

  // Floating particle touch triggers
  window.addEventListener('mousemove', (e) => {
    if (Math.random() < 0.28) {
      FXManager.spawnSparkle(e.clientX, e.clientY);
    }
  });
  window.addEventListener('touchmove', (e) => {
    if (Math.random() < 0.28) {
      const touch = e.touches[0];
      FXManager.spawnSparkle(touch.clientX, touch.clientY);
    }
  }, { passive: true });

  const fab = document.getElementById('global-surprise-fab');
  if (fab) {
    fab.addEventListener('click', (e) => {
      FXManager.triggerHeartsBurst(e.clientX, e.clientY);
      FXManager.triggerConfetti(e.clientX, e.clientY);
      showToast("Sparks dispatched! ❤️", "love");
    });
  }

  // Preloader progress tracks
  let progress = 0;
  const progressBar = document.getElementById('loader-progress-bar');
  const percentageText = document.getElementById('loader-percentage');
  const loadingScreen = document.getElementById('loading-screen');
  const appContainer = document.getElementById('app-container');

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 20) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      setTimeout(() => {
        if (loadingScreen) {
          loadingScreen.classList.add('fade-out');
          if (appContainer) {
            appContainer.classList.remove('hidden');
          }
        }
      }, 400);
    }
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (percentageText) percentageText.textContent = `${progress}%`;
  }, 65);
});
