"use client";

import { ReactLenis } from "lenis/react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { SiSpacex } from "react-icons/si";
import { FiArrowRight, FiMapPin } from "react-icons/fi";
import { useRef } from "react";

export const SmoothScrollHero = () => {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <ReactLenis root>
        <Nav />
        <Hero />
        <Schedule />
      </ReactLenis>
    </div>
  );
};

const Nav = () => {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4 text-white backdrop-blur-md bg-zinc-950/40 border-b border-zinc-800/40">
      <div className="flex items-center gap-2">
        <SiSpacex className="text-3xl mix-blend-difference" />
        <span className="font-bold text-sm tracking-widest text-zinc-200">LUMEN FLIGHT</span>
      </div>
      <button
        onClick={() => {
          document.getElementById("launch-schedule")?.scrollIntoView({
            behavior: "smooth",
          });
        }}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        <span>LAUNCH SCHEDULE</span>
        <FiArrowRight className="text-sm" />
      </button>
    </nav>
  );
};

const SECTION_HEIGHT = 1500;

const Hero = () => {
  return (
    <div
      style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
      className="relative w-full"
    >
      <CenterImage />

      <ParallaxImages />

      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-zinc-950/0 to-zinc-950 pointer-events-none" />
    </div>
  );
};

const CenterImage = () => {
  const { scrollY } = useScroll();

  const clip1 = useTransform(scrollY, [0, 1500], [25, 0]);
  const clip2 = useTransform(scrollY, [0, 1500], [75, 100]);

  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  const backgroundSize = useTransform(
    scrollY,
    [0, SECTION_HEIGHT + 500],
    ["170%", "100%"]
  );
  const opacity = useTransform(
    scrollY,
    [SECTION_HEIGHT, SECTION_HEIGHT + 500],
    [1, 0]
  );

  return (
    <motion.div
      className="sticky top-0 h-screen w-full"
      style={{
        clipPath,
        backgroundSize,
        opacity,
        backgroundImage:
          "url(https://images.unsplash.com/photo-1517976487502-5f79f4277b5d?auto=format&fit=crop&w=1920&q=80)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

const ParallaxImages = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px]">
      <ParallaxImg
        src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80"
        alt="Space launch rocket ascent"
        start={-200}
        end={200}
        className="w-1/3 rounded-xl shadow-2xl border border-zinc-800/60"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
        alt="Earth orbital satellite view"
        start={200}
        end={-250}
        className="mx-auto w-2/3 rounded-xl shadow-2xl border border-zinc-800/60"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80"
        alt="Stellar cosmic trajectory"
        start={-200}
        end={200}
        className="ml-auto w-1/3 rounded-xl shadow-2xl border border-zinc-800/60"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80"
        alt="Orbiting deep space laboratory"
        start={0}
        end={-500}
        className="ml-24 w-5/12 rounded-xl shadow-2xl border border-zinc-800/60"
      />
    </div>
  );
};

interface ParallaxImgProps {
  className?: string;
  alt: string;
  src: string;
  start: number;
  end: number;
}

const ParallaxImg = ({ className, alt, src, start, end }: ParallaxImgProps) => {
  const ref = useRef<HTMLImageElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      ref={ref}
      style={{ transform, opacity }}
    />
  );
};

const Schedule = () => {
  return (
    <section
      id="launch-schedule"
      className="mx-auto max-w-5xl px-4 py-48 text-white relative z-10"
    >
      <motion.h1
        initial={{ y: 48, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75 }}
        className="mb-20 text-4xl font-black uppercase text-zinc-50 tracking-tight"
      >
        Launch Schedule & Milestones
      </motion.h1>
      <ScheduleItem title="NG-21 Space Cargo" date="Dec 9th" location="Florida Space Coast" />
      <ScheduleItem title="Starlink v2 Flight 14" date="Dec 20th" location="Starbase, Texas" />
      <ScheduleItem title="Orbital Constellation Alpha" date="Jan 13th" location="Cape Canaveral" />
      <ScheduleItem title="Turksat 6A Geosynchronous" date="Feb 22nd" location="Florida SLC-40" />
      <ScheduleItem title="NROL-186 National Security" date="Mar 1st" location="Vandenberg, California" />
      <ScheduleItem title="GOES-U Weather Satellite" date="Mar 8th" location="Kennedy Space Center" />
      <ScheduleItem title="ASTRA 1P Direct-to-Home" date="Apr 8th" location="Boca Chica, Texas" />
    </section>
  );
};

interface ScheduleItemProps {
  title: string;
  date: string;
  location: string;
}

const ScheduleItem = ({ title, date, location }: ScheduleItemProps) => {
  return (
    <motion.div
      initial={{ y: 48, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.75 }}
      className="mb-9 flex items-center justify-between border-b border-zinc-800/80 px-3 pb-9 hover:border-zinc-700 transition-colors"
    >
      <div>
        <p className="mb-1.5 text-xl font-medium text-zinc-100">{title}</p>
        <p className="text-sm font-mono tracking-wider uppercase text-zinc-400">{date}</p>
      </div>
      <div className="flex items-center gap-2 text-end text-sm uppercase text-zinc-400">
        <p>{location}</p>
        <FiMapPin className="text-zinc-500" />
      </div>
    </motion.div>
  );
};

export default SmoothScrollHero;

