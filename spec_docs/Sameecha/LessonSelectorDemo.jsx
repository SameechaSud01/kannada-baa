import React, { useState } from 'react';

// ── Palette ─────────────────────────────────────────────
const C = {
  bg: '#FBF5DC',
  cardBg: '#FFFFFF',
  borderSoft: '#EADFC4',
  borderLocked: '#D9D3BE',
  lockedFill: '#EFEADA',
  ink: '#1C1C1C',
  inkSoft: '#6A6A6A',
  inkMuted: '#A39E8B',
  green: '#27500A',
  greenMid: '#3B6D11',
  greenSoft: '#E7F1DA',
  goldDeep: '#BA7517',
  goldVerySoft: '#FBE6BA',
  red: '#A11D2F',
  cream: '#FAEEDA',
};

// ── ONE source of truth: lessons (shared across every game) ────
// Unlocks here apply everywhere. This is what the app's lesson
// model would expose.
const LESSONS = [
  { n: 1, glyph: 'ನ', theme: 'Greetings', unlocked: true  },
  { n: 2, glyph: 'ಸ', theme: 'Family',    unlocked: true  },
  { n: 3, glyph: 'ಊ', theme: 'Food',      unlocked: true  },
  { n: 4, glyph: 'ಪ', theme: 'Travel',    unlocked: true  },
  { n: 5, glyph: 'ಮ', theme: 'Weather',   unlocked: false },
  { n: 6, glyph: 'ಬ', theme: 'Numbers',   unlocked: false },
  { n: 7, glyph: 'ಕ', theme: 'Time',      unlocked: false },
  { n: 8, glyph: 'ರ', theme: 'Feelings',  unlocked: false },
];

// ── Game catalog: only what differs per game ────────────
const GAMES = {
  opposites: { title: 'Opposites', tagline: 'Pick the opposite of each word.' },
  matching:  { title: 'Matching',  tagline: 'Match Kannada words to their meanings.' },
  listen:    { title: 'Listen',    tagline: 'Hear the word, pick what you heard.' },
  spell:     { title: 'Spell It',  tagline: 'Type the Kannada word you see.' },
  speak:     { title: 'Say It',    tagline: 'Read the word aloud. We listen.' },
};

// ── Icons ───────────────────────────────────────────────
const LOCK = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// ── Reusable pill ───────────────────────────────────────
function LessonPill({ lesson, onTap }) {
  const [pressed, setPressed] = useState(false);
  const enabled = lesson.unlocked;

  return (
    <button
      onClick={enabled ? () => onTap(lesson) : undefined}
      onMouseDown={() => enabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => enabled && setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      disabled={!enabled}
      aria-label={`Lesson ${lesson.n}: ${lesson.theme}${enabled ? '' : ', locked'}`}
      style={{
        width: '100%',
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: enabled ? 'pointer' : 'not-allowed',
        fontFamily: 'inherit',
        transform: pressed ? 'scale(0.985)' : 'scale(1)',
        transition: 'transform 0.16s cubic-bezier(.2,.7,.3,1)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px',
        background: enabled ? C.cardBg : C.lockedFill,
        border: `1px solid ${enabled ? C.borderSoft : C.borderLocked}`,
        borderRadius: 16,
        boxShadow: enabled ? '0 2px 6px rgba(50,38,15,0.07)' : 'none',
        opacity: enabled ? 1 : 0.7,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: enabled ? C.goldVerySoft : '#E5DFCB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontSize: 22, fontWeight: 700,
          color: enabled ? C.ink : C.inkMuted,
        }}>
          {enabled ? lesson.glyph : ''}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{
            fontSize: 14.5, fontWeight: 800,
            color: enabled ? C.ink : C.inkMuted,
          }}>
            Lesson {lesson.n}
          </div>
          <div style={{
            fontSize: 12, marginTop: 1,
            color: enabled ? C.inkSoft : C.inkMuted,
          }}>
            {lesson.theme}
          </div>
        </div>
        {!enabled && (
          <div style={{ color: C.inkMuted, flexShrink: 0 }}>{LOCK}</div>
        )}
      </div>
    </button>
  );
}

// ── The reusable selector ──────────────────────────────
// Props: gameKey (which entry of GAMES), onSelectLesson(lesson),
//        onBack(). Lessons come from the shared model.
function LessonSelector({ gameKey, onSelectLesson, onBack }) {
  const game = GAMES[gameKey];
  const unlockedCount = LESSONS.filter(l => l.unlocked).length;

  return (
    <div style={{
      width: 380, maxWidth: '100%',
      background: C.bg,
      borderRadius: 28,
      padding: '26px 22px 32px',
      boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            width: 44, height: 44, borderRadius: 22,
            border: 'none', background: '#EDE6CF',
            color: C.red, fontSize: 20, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>←</button>
        <div style={{ flex: 1, fontSize: 26, fontWeight: 800, color: C.ink, lineHeight: 1.1 }}>
          {game.title}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 700, color: C.greenMid,
          background: C.greenSoft,
          padding: '6px 11px', borderRadius: 14,
        }}>
          {unlockedCount}/8
        </div>
      </div>

      {/* Game tagline (the only per-game visual differentiator) */}
      <div style={{
        fontSize: 13, color: C.goldDeep, fontWeight: 600,
        marginBottom: 14,
      }}>
        {game.tagline}
      </div>

      {/* Help copy (same on every game screen) */}
      <div style={{
        fontSize: 13, color: C.inkSoft,
        lineHeight: 1.5, marginBottom: 18,
      }}>
        Tap a lesson to play. Complete lessons in the Lessons tab to unlock more.
      </div>

      {/* Pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LESSONS.map(l => (
          <LessonPill key={l.n} lesson={l} onTap={onSelectLesson} />
        ))}
      </div>
    </div>
  );
}

// ── Demo wrapper: pick a game, see the selector ─────────
export default function LessonSelectorDemo() {
  const [gameKey, setGameKey] = useState('opposites');
  const [toast, setToast] = useState(null);

  function handleSelectLesson(lesson) {
    setToast(`Starting ${GAMES[gameKey].title} · Lesson ${lesson.n}: ${lesson.theme}…`);
    setTimeout(() => setToast(null), 1500);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1f1f1f',
      padding: '32px 24px',
      fontFamily: 'Georgia, "Noto Serif Kannada", serif',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ color: '#fff', fontSize: 19, fontWeight: 700, marginBottom: 6 }}>
          Reusable lesson selector
        </div>
        <div style={{ color: '#aaa', fontSize: 13, marginBottom: 22, lineHeight: 1.5 }}>
          One <code style={{ color: '#fff', background: '#333', padding: '2px 6px', borderRadius: 4 }}>{'<LessonSelector />'}</code>
          {' '}component, used by every game. Lessons + unlock state come from one shared model — change a lesson in the Lessons tab, every game updates. Pick a game below to swap screens.
        </div>

        {/* Game switcher */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
          marginBottom: 28, justifyContent: 'center',
        }}>
          {Object.entries(GAMES).map(([key, g]) => (
            <button
              key={key}
              onClick={() => setGameKey(key)}
              style={{
                background: gameKey === key ? C.green : '#2c2c2c',
                color: gameKey === key ? C.cream : '#ccc',
                border: gameKey === key ? `1px solid ${C.green}` : '1px solid #444',
                borderRadius: 16,
                padding: '7px 14px',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
              {g.title}
            </button>
          ))}
        </div>

        {/* The phone */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LessonSelector
            gameKey={gameKey}
            onSelectLesson={handleSelectLesson}
            onBack={() => setToast('Back tapped')}
          />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 30, left: '50%',
          transform: 'translateX(-50%)',
          background: C.green, color: C.cream,
          padding: '11px 20px', borderRadius: 24,
          fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          maxWidth: '90%', textAlign: 'center',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
