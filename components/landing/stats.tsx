"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

const stats = [
  { label: "Happy Customers", value: 10000, suffix: "+" },
  { label: "Pets Delivered", value: 8500, suffix: "+" },
  { label: "5-Star Reviews", value: 4800, suffix: "+" },
  { label: "Years Experience", value: 15, suffix: "" },
]

function AnimatedCounter({
  value,
  suffix,
  isVisible,
}: {
  value: number
  suffix: string
  isVisible: boolean
}) {
  const [count, setCount] = useState(0)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!isVisible) return

    const obj = { val: 0 }
    gsap.to(obj, {
      val: value,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        setCount(Math.floor(obj.val))
      },
    })
  }, [isVisible, value])

  return (
    <span ref={counterRef}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export function Stats() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          setIsVisible(true)

          const ctx = gsap.context(() => {
            if (cardsRef.current) {
              const cards = cardsRef.current.children
              gsap.fromTo(
                cards,
                {
                  y: 80,
                  opacity: 0,
                  rotateY: -45,
                  scale: 0.7,
                  transformPerspective: 1000,
                },
                {
                  y: 0,
                  opacity: 1,
                  rotateY: 0,
                  scale: 1,
                  duration: 1,
                  stagger: 0.15,
                  ease: "back.out(1.4)",
                }
              )
            }
          }, sectionRef)

          return () => ctx.revert()
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-20 bg-primary text-primary-foreground"
      style={{ perspective: "1200px" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={cardsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          style={{ transformStyle: "preserve-3d" }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors duration-300"
              style={{ opacity: 0, transformStyle: "preserve-3d" }}
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  isVisible={isVisible}
                />
              </div>
              <div className="text-primary-foreground/80 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
