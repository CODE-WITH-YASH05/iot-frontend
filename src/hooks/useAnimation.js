// src/hooks/useAnimation.js
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useFadeIn = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animation = gsap.fromTo(
      element,
      {
        y: options.y || 50,
        opacity: 0,
        scale: options.scale || 1,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: options.duration || 1,
        delay: options.delay || 0,
        ease: options.ease || "power3.out",
        scrollTrigger: {
          trigger: element,
          start: options.start || "top 80%",
          end: options.end || "bottom 20%",
          toggleActions: options.toggleActions || "play none none reverse",
        },
      },
    );

    return () => animation.kill();
  }, []);

  return ref;
};

export const useParallax = (speed = 0.5) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.to(element, {
      y: () => window.innerHeight * speed,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, [speed]);

  return ref;
};

export const useStaggerAnimation = (selector, options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const children = element.querySelectorAll(selector);

    gsap.fromTo(
      children,
      {
        y: options.y || 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: options.duration || 0.8,
        stagger: options.stagger || 0.1,
        ease: options.ease || "power3.out",
        scrollTrigger: {
          trigger: element,
          start: options.start || "top 80%",
        },
      },
    );
  }, [selector]);

  return ref;
};
