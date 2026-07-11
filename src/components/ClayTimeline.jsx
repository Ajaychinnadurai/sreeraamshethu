
import { motion } from 'framer-motion';
import ClayCard from './ClayCard';

export default function ClayTimeline() {
  const steps = [
    {
      number: '01',
      title: 'Consultation & Feasibility',
      description: 'We explore project parameters, environmental impacts, zoning rules, and cost-benefit ratios to lay a rock-solid structural foundation.'
    },
    {
      number: '02',
      title: 'Tactile Modeling & Design',
      description: 'Utilizing next-generation building information modeling (BIM), we design architectural schematics with precision and strict compliance.'
    },
    {
      number: '03',
      title: 'Engineering & Construction',
      description: 'Our world-class engineers supervise and execute site works with structural excellence, premium materials, and green techniques.'
    },
    {
      number: '04',
      title: 'Validation & Handover',
      description: 'Rigorous pressure tests, compliance certifications, and hyperrealistic walkthrough check-offs guarantee flawless handover.'
    }
  ];

  return (
    <div style={{ position: 'relative', padding: '20px 0' }}>
      {/* Visual Line in center for desktop */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '40px',
          bottom: '40px',
          width: '1px',
          backgroundColor: 'var(--cream-200)',
          transform: 'translateX(-50%)',
          display: 'none'
        }}
        className="timeline-line"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {steps.map((step, idx) => {
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                width: '100%'
              }}
              className="timeline-item-container"
            >
              {/* Central Step Badge */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--white)',
                  border: '1px solid var(--amber-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--navy-900)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '600',
                  fontSize: '16px',
                  zIndex: 2,
                  marginBottom: '20px',
                  position: 'relative'
                }}
                className="timeline-badge"
              >
                {step.number}
              </div>

              {/* Step content card */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '550px'
                }}
                className="timeline-card-wrapper"
              >
                <ClayCard variant="light" hoverLift={false} style={{ padding: '30px', boxShadow: 'none' }}>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.1em',
                      color: 'var(--amber-500)',
                      marginBottom: '8px',
                      textTransform: 'uppercase'
                    }}
                  >
                    Phase {step.number}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      color: 'var(--navy-900)',
                      marginBottom: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      color: 'var(--gray-500)',
                      lineHeight: '1.6'
                    }}
                  >
                    {step.description}
                  </p>
                </ClayCard>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style>{`
        @media (min-width: 900px) {
          .timeline-line {
            display: block !important;
          }
          .timeline-item-container {
            flex-direction: row !important;
            justify-content: space-between !important;
          }
          .timeline-badge {
            position: absolute !important;
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) !important;
            margin-bottom: 0 !important;
          }
          .timeline-card-wrapper {
            width: 44% !important;
            max-width: none !important;
          }
          .timeline-item-container:nth-child(even) {
            flex-direction: row-reverse !important;
          }
        }
      `}</style>
    </div>
  );
}
