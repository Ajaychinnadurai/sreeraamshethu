import { useState } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ClayCard from './ClayCard';

export default function ClayCarousel() {
  const testimonials = [
    {
      quote: "Shree Ramsethu Constructions & Interiors transformed our vision for the Metro-Transit Link into a breathtaking physical landmark. Their tactile-first design approach is unmatched in precision.",
      author: "Elena Rostova",
      role: "Infrastructure Director, Capital City Transit",
      avatarBg: "#152238"
    },
    {
      quote: "Working with the Shree Ramsethu Constructions & Interiors team was a masterclass in modern building design. The claymorphic software tools they gave us to track structural stress calculations were pure joy.",
      author: "Marcus Vance",
      role: "Chief Architect, Vance Developments",
      avatarBg: "#b89568"
    },
    {
      quote: "Environmental standards are easy to bypass, but Shree Ramsethu Constructions & Interiors embedded sustainability directly into the physical columns of our new commercial tower. Highly impressed.",
      author: "Dr. Sarah Chen",
      role: "VP of Sustainability, Eco-Towers Ltd",
      avatarBg: "#273e66"
    }
  ];

  const [index, setIndex] = useState(0);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      <div style={{ width: '100%', minHeight: '220px', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ClayCard
              variant="light"
              hoverLift={false}
              style={{
                position: 'relative',
                padding: '40px',
                textAlign: 'left',
                border: '1px solid var(--cream-200)',
                background: 'var(--white)',
                boxShadow: 'none'
              }}
            >
              {/* Quote Mark Icon */}
              <div
                style={{
                  color: 'var(--amber-500)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Quote size={32} fill="var(--amber-100)" stroke="none" />
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  lineHeight: '1.6',
                  color: 'var(--navy-900)',
                  fontStyle: 'italic',
                  marginBottom: '28px',
                  fontWeight: '300'
                }}
              >
                "{testimonials[index].quote}"
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '0px',
                    background: testimonials[index].avatarBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '500',
                    color: 'var(--white)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px'
                  }}
                >
                  {testimonials[index].author.charAt(0)}
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--navy-900)',
                      fontWeight: '700',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {testimonials[index].author.toUpperCase()}
                  </h4>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--gray-400)',
                      marginTop: '2px'
                    }}
                  >
                    {testimonials[index].role}
                  </p>
                </div>
              </div>
            </ClayCard>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Buttons (Thin Emaar-style Arrows) */}
      <div style={{ display: 'flex', gap: '24px', alignSelf: 'flex-end', marginTop: '10px' }}>
        <button
          onClick={handlePrev}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--navy-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
            opacity: 0.7
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>

        <button
          onClick={handleNext}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--navy-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
            opacity: 0.7
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
        >
          <ArrowRight size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
