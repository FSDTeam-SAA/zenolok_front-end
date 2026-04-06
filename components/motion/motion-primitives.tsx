"use client";

import * as React from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function AppMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.34, ease }}>
      {children}
    </MotionConfig>
  );
}

export function PageTransition({
  children,
  transitionKey,
  className,
}: {
  children: React.ReactNode;
  transitionKey: string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        className={cn(className)}
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 18, filter: "blur(10px)" }
        }
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 1, y: 0, filter: "blur(0px)" }
        }
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: -10, filter: "blur(8px)" }
        }
        transition={{
          duration: shouldReduceMotion ? 0.18 : 0.36,
          ease,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.18 : 0.32,
        ease,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  className,
  stagger = 0.07,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
            delayChildren: 0.04,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: shouldReduceMotion ? 0.16 : 0.3,
            ease,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
