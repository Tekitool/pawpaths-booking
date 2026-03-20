'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

const PAW_PATH =
    'M465.19,453.459c14.749,67.688-58.752,82.375-91.127,73.562s-98.41-10.281-98.41-10.281' +
    's-66.218,1.469-98.593,10.281c-32.375,8.874-105.937-5.875-91.249-73.562s79.438-64.75,' +
    '97.186-155.999c17.687-91.249,92.718-85.374,92.718-85.374s74.847-5.875,92.535,85.374' +
    'C385.875,388.709,450.502,385.771,465.19,453.459z ' +
    'M343.586,206.15c39.841,11.505,83.844-19.951,98.349-70.258c14.504-50.245-5.998-100.307,' +
    '-45.839-111.812c-39.842-11.506-83.844,19.951-98.349,70.258C283.243,144.583,303.745,194.645,343.586,206.15z ' +
    'M508.703,187.852c-38.372-15.668-85.496,10.894-105.264,59.363c-19.768,48.471-4.712,100.43,' +
    '33.66,116.035c38.372,15.606,85.496-10.894,105.264-59.364C562.131,255.416,547.076,203.519,508.703,187.852z ' +
    'M207.416,206.15c39.841-11.506,60.343-61.567,45.839-111.812s-58.568-81.702-98.349-70.196' +
    'c-39.78,11.505-60.343,61.566-45.839,111.812C123.572,186.199,167.575,217.655,207.416,206.15z ' +
    'M113.963,363.25c38.373-15.667,53.428-67.626,33.66-116.035s-66.892-75.031-105.264-59.363' +
    'C3.987,203.519-11.068,255.478,8.7,303.886C28.467,352.356,75.591,378.917,113.963,363.25z';

const PAW_SVG = `<svg viewBox="0 0 551.062 551.062" xmlns="http://www.w3.org/2000/svg"><path d="${PAW_PATH}"/></svg>`;

const NUM_SLOTS = 20;
const TRAIL     = 4;
const RADIUS    = 108;
const PAW_SIZE  = 18;
const CENTRE    = 130;
const STEP_MS   = 320;
const ZIGZAG    = 9;
const OPACITIES = [1, 0.60, 0.28, 0.08];
const SCALES    = [1, 0.92, 0.84, 0.74];

// Pre-compute slot positions once
const SLOTS = Array.from({ length: NUM_SLOTS }, (_, i) => {
    const angleDeg = (360 / NUM_SLOTS) * i - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const side     = i % 2 === 0 ? -1 : 1;
    const r        = RADIUS + side * ZIGZAG;
    return {
        cx:      CENTRE + r * Math.cos(angleRad),
        cy:      CENTRE + r * Math.sin(angleRad),
        faceDeg: angleDeg + 180 + side * 12,
        alt:     i % 2 === 1,
    };
});

export default function Loading() {
    const stageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        // Build paw DOM pool
        const pool: HTMLDivElement[] = [];
        for (let i = 0; i < TRAIL; i++) {
            const el = document.createElement('div');
            el.innerHTML = PAW_SVG;
            Object.assign(el.style, {
                position:        'absolute',
                width:           `${PAW_SIZE}px`,
                height:          `${PAW_SIZE}px`,
                left:            '0',
                top:             '0',
                transformOrigin: 'center center',
                opacity:         '0',
                pointerEvents:   'none',
                filter:          'drop-shadow(0 1px 3px rgba(80,50,31,.28))',
                willChange:      'transform, opacity',
            });
            // Alternate paw colours: dark brown / warm tan
            const svgEl = el.querySelector('svg');
            if (svgEl) svgEl.style.fill = i % 2 === 0 ? '#50321f' : '#C4956A';
            stage.appendChild(el);
            pool.push(el);
        }

        const trail: Array<{ el: HTMLDivElement; faceDeg: number }> = [];
        let cursor  = 0;
        let timerId: ReturnType<typeof setTimeout>;

        function applyStyle(el: HTMLDivElement, faceDeg: number, opacity: number, scale: number) {
            el.style.transition = 'opacity 0.28s ease, transform 0.22s cubic-bezier(.34,1.45,.64,1)';
            el.style.opacity    = String(opacity);
            el.style.transform  = `rotate(${faceDeg}deg) scale(${scale})`;
        }

        function tick() {
            const slot = SLOTS[cursor % NUM_SLOTS];
            const el   = pool[cursor % TRAIL];

            // Teleport paw to new position with no transition
            el.style.transition = 'none';
            el.style.left       = `${slot.cx - PAW_SIZE / 2}px`;
            el.style.top        = `${slot.cy - PAW_SIZE / 2}px`;
            el.style.opacity    = '0';
            el.style.transform  = `rotate(${slot.faceDeg}deg) scale(0.5)`;

            trail.unshift({ el, faceDeg: slot.faceDeg });
            if (trail.length > TRAIL) trail.pop();

            void el.offsetWidth; // force reflow before transition

            trail.forEach((item, age) => {
                applyStyle(item.el, item.faceDeg, OPACITIES[age] ?? 0, SCALES[age] ?? 0.5);
            });

            cursor++;
            timerId = setTimeout(tick, STEP_MS);
        }

        tick();

        return () => {
            clearTimeout(timerId);
            pool.forEach(el => el.parentNode?.removeChild(el));
        };
    }, []);

    return (
        <>
            <style>{`
                @keyframes pp-hub-glow {
                    0%, 100% { transform: translate(-50%, -50%) scale(1);    opacity: .5; }
                    50%      { transform: translate(-50%, -50%) scale(1.18); opacity: 1;  }
                }
                .pp-hub-glow {
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 130px; height: 130px;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(196,149,106,.20) 0%, transparent 70%);
                    animation: pp-hub-glow 2.4s ease-in-out infinite;
                    pointer-events: none;
                }
            `}</style>

            <div style={{
                minHeight:      '100vh',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                background:     '#ffffff',
            }}>
                <div ref={stageRef} style={{ position: 'relative', width: 260, height: 260 }}>

                    {/* Subtle glow ring */}
                    <div className="pp-hub-glow" aria-hidden="true" />

                    {/* Centre logo hub */}
                    <div style={{
                        position:     'absolute',
                        top: '50%', left: '50%',
                        transform:    'translate(-50%, -50%)',
                        width:        100,
                        height:       100,
                        background:   '#ffffff',
                        borderRadius: '50%',
                        boxShadow:    '0 0 0 7px rgba(80,50,31,.06), 0 6px 28px rgba(80,50,31,.14)',
                        display:      'flex',
                        alignItems:   'center',
                        justifyContent: 'center',
                        zIndex:       5,
                    }}>
                        <Image
                            src="/ppicon.svg"
                            alt="PawPaths"
                            width={58}
                            height={58}
                            priority
                        />
                    </div>

                    {/* Paw stamps are injected here by useEffect */}
                </div>
            </div>
        </>
    );
}
