import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface AnimationPreset {
  duration?: number
  delay?: number
  ease?: string
  y?: number
  x?: number
  opacity?: number
  scale?: number
  rotate?: number
}

export const presets = {
  fadeIn: {
    duration: 0.6,
    ease: 'power2.out',
    opacity: 0,
  } satisfies AnimationPreset,

  fadeInUp: {
    duration: 0.6,
    ease: 'power2.out',
    opacity: 0,
    y: 30,
  } satisfies AnimationPreset,

  fadeInDown: {
    duration: 0.6,
    ease: 'power2.out',
    opacity: 0,
    y: -30,
  } satisfies AnimationPreset,

  fadeInLeft: {
    duration: 0.6,
    ease: 'power2.out',
    opacity: 0,
    x: -30,
  } satisfies AnimationPreset,

  fadeInRight: {
    duration: 0.6,
    ease: 'power2.out',
    opacity: 0,
    x: 30,
  } satisfies AnimationPreset,

  scaleIn: {
    duration: 0.5,
    ease: 'back.out(1.7)',
    opacity: 0,
    scale: 0.8,
  } satisfies AnimationPreset,

  heroTitle: {
    duration: 1,
    ease: 'power3.out',
    y: 50,
    opacity: 0,
  } satisfies AnimationPreset,

  heroSubtitle: {
    duration: 0.8,
    delay: 0.3,
    ease: 'power2.out',
    y: 30,
    opacity: 0,
  } satisfies AnimationPreset,

  heroCta: {
    duration: 0.6,
    delay: 0.6,
    ease: 'power2.out',
    y: 20,
    opacity: 0,
  } satisfies AnimationPreset,

  staggerChildren: {
    duration: 0.5,
    ease: 'power2.out',
    opacity: 0,
    y: 20,
  } satisfies AnimationPreset,

  bounceIn: {
    duration: 0.6,
    ease: 'elastic.out(1, 0.5)',
    scale: 0,
  } satisfies AnimationPreset,
}

const motionQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

function prefersReducedMotion(): boolean {
  return motionQuery?.matches ?? false
}

export function useReducedMotion() {
  const reduced = useRef(prefersReducedMotion())

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => { reduced.current = e.matches }
    motionQuery?.addEventListener('change', handler)
    return () => motionQuery?.removeEventListener('change', handler)
  }, [])

  return reduced
}

export function useHeroTimeline(
  scope: React.RefObject<HTMLDivElement | null>,
  enabled = true,
) {
  const reduced = useReducedMotion()

  useGSAP(() => {
    if (!enabled || reduced.current) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.hero-title', { y: 60, opacity: 0, duration: 1 })
      .from('.hero-subtitle', { y: 40, opacity: 0, duration: 0.8 }, '-=0.4')
      .from('.hero-cta', { y: 30, opacity: 0, duration: 0.6 }, '-=0.3')
      .from('.hero-images > div', { y: 40, opacity: 0, duration: 0.6, stagger: 0.15 }, '-=0.2')

    return () => { tl.kill() }
  }, { scope, dependencies: [enabled] })
}

export function useScrollReveal(
  scope: React.RefObject<HTMLDivElement | null>,
  enabled = true,
) {
  const reduced = useReducedMotion()

  useGSAP(() => {
    if (!enabled || reduced.current) return

    const ctx = gsap.context(() => {
      const sections = scope.current?.querySelectorAll('[data-reveal]')
      if (!sections?.length) return

      sections.forEach((section) => {
        const children = section.querySelectorAll('[data-reveal-child]')
        if (children.length > 0) {
          gsap.from(children, {
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
          })
        } else {
          gsap.from(section, {
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            y: 40,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
          })
        }
      })
    }, scope)

    return () => ctx.revert()
  }, { scope, dependencies: [enabled] })
}

export function useStaggerAnimation(
  containerRef: React.RefObject<HTMLElement | null>,
  selector: string,
  preset: AnimationPreset = presets.staggerChildren,
  enabled = true,
) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!enabled || reduced.current || !containerRef.current) return

    const elements = containerRef.current.querySelectorAll(selector)
    if (!elements.length) return

    const ctx = gsap.context(() => {
      gsap.from(elements, {
        ...preset,
        stagger: 0.08,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [containerRef, selector, preset, enabled, reduced])
}

export function useCorrectAnimation(
  elementRef: React.RefObject<HTMLElement | null>,
  enabled = true,
) {
  const reduced = useReducedMotion()

  const animate = useCallback(() => {
    if (!enabled || reduced.current || !elementRef.current) return
    gsap.fromTo(elementRef.current,
      { scale: 0.5, opacity: 0, rotate: -10 },
      {
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: 0.4,
        ease: 'back.out(2)',
      },
    )
  }, [elementRef, enabled, reduced])

  return animate
}

export function useIncorrectAnimation(
  elementRef: React.RefObject<HTMLElement | null>,
  enabled = true,
) {
  const reduced = useReducedMotion()

  const animate = useCallback(() => {
    if (!enabled || reduced.current || !elementRef.current) return
    gsap.fromTo(elementRef.current,
      { x: -5, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      },
    )
  }, [elementRef, enabled, reduced])

  return animate
}

export async function triggerCelebration(
  element: HTMLElement | null,
) {
  if (!element || prefersReducedMotion()) return

  const tl = gsap.timeline()

  tl.to(element, {
    scale: 1.2,
    duration: 0.15,
    ease: 'power2.out',
  })
    .to(element, {
      scale: 1,
      duration: 0.15,
      ease: 'bounce.out',
    })

  const colors = ['#7D54FF', '#FFC83D', '#22C55E', '#FF7A59', '#5EC8FF']
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div')
    particle.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9999;
      width: 8px; height: 8px; border-radius: 50%;
      background: ${colors[i % colors.length]};
      left: ${element.getBoundingClientRect().left + element.offsetWidth / 2}px;
      top: ${element.getBoundingClientRect().top + element.offsetHeight / 2}px;
    `
    document.body.appendChild(particle)

    const angle = (i / 12) * 360
    const distance = 80 + Math.random() * 60
    gsap.to(particle, {
      x: Math.cos(angle * Math.PI / 180) * distance,
      y: Math.sin(angle * Math.PI / 180) * distance - 40,
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => particle.remove(),
    })
  }

  try {
    await tl.play()
  } catch {
    /* animation may be killed */
  }
}
