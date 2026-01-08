'use client';

import gsap from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface AnimatedLogoProps {
    className?: string;
    onClick?: () => void;
    isMobile?: boolean;
}

export default function AnimatedLogo({ className = '', onClick, isMobile = false }: AnimatedLogoProps) {
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLAnchorElement>(null);
    const logoRef = useRef<HTMLImageElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const ctx = gsap.context(() => {
            // Initial Entrance Animation
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.fromTo(logoRef.current,
                { scale: 0, rotation: -180, opacity: 0 },
                { scale: 1, rotation: 0, opacity: 1, duration: 0.8 }
            )
                .fromTo(lettersRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.03, duration: 0.5 },
                    '-=0.4'
                );

        }, containerRef);

        return () => ctx.revert();
    }, [isMounted]);

    const handleMouseEnter = () => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Logo Icon Animation
            gsap.to(logoRef.current, {
                rotation: 360,
                duration: 0.6,
                ease: 'back.out(1.7)',
                overwrite: true
            });

            // Text Wave Animation
            gsap.to(lettersRef.current, {
                y: -3,
                stagger: {
                    each: 0.02,
                    yoyo: true,
                    repeat: 1
                },
                duration: 0.2,
                ease: 'power1.inOut',
                overwrite: true
            });

            // Color shimmer effect
            gsap.to(lettersRef.current, {
                color: '#E63946', // Primary red
                stagger: {
                    each: 0.02,
                    yoyo: true,
                    repeat: 1
                },
                duration: 0.2,
                overwrite: true,
                onComplete: () => {
                    gsap.to(lettersRef.current, { color: '#000000', duration: 0.2 });
                }
            });
        }, containerRef);
    };

    const handleMouseLeave = () => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            gsap.to(logoRef.current, {
                rotation: 0,
                duration: 0.4,
                ease: 'power2.out'
            });

            gsap.to(lettersRef.current, {
                y: 0,
                color: '#000000',
                duration: 0.3
            });
        }, containerRef);
    };

    const text = 'lee Threads';

    if (!isMounted) {
        return (
            <div className={`flex items-center justify-center gap-2 ${className}`}>
                <div className={`bg-gray-200 rounded-full animate-pulse ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                <div className={`bg-gray-200 rounded-md animate-pulse ${isMobile ? 'w-24 h-5' : 'w-32 h-8'}`} />
            </div>
        );
    }

    return (
        <Link
            href="/"
            ref={containerRef}
            className={`flex items-center justify-center gap-1 group ${className}`}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Image
                ref={logoRef}
                src="/glee_logo.png"
                alt="Glee Logo"
                width={isMobile ? 20 : 24}
                height={isMobile ? 20 : 24}
                className="object-contain"
            />
            <span
                ref={textRef}
                className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-extrabold flex overflow-hidden`}
                style={{ fontFamily: 'var(--font-figtree)' }}
            >
                {text.split('').map((char, i) => (
                    <span
                        key={i}
                        ref={el => { lettersRef.current[i] = el; }}
                        className="inline-block text-black"
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </span>
        </Link>
    );
}
