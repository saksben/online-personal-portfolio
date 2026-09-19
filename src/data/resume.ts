import type { ClassId } from "./characters";

export interface Experience {
  role: string;
  org: string;
  location?: string;
  /** e.g. "Jan 2022" */
  start: string;
  /** Omit for a current role. */
  end?: string;
  bullets: string[];
  /** Class pages this entry appears on (it always appears on /resume). */
  classes: ClassId[];
}

export interface Education {
  credential: string;
  institution?: string;
  year?: string;
}

export const resume = {
  headline: "Software Engineer",
  summary:
    "I was born and raised in the forests of Oregon and now live in the deserts of Arizona. I earned a bachelor's in Global Business and an MBA, then wanted more, so I also earned a bachelor's in Software Engineering. I started as a front-end developer with JavaScript and React / Next.js and have since widened into full-stack, data, AI, mobile and game development.",

  /**
   * TODO(ben): add real employment history. Nothing is invented here; the
   * "Field Experience" section on the class pages and /resume renders only
   * when this array has entries.
   */
  experience: [] as Experience[],

  /** TODO(ben): add institutions / graduation years if you want them shown. */
  education: [
    { credential: "Bachelor's in Software Engineering" },
    { credential: "Master of Business Administration (MBA)" },
    { credential: "Bachelor's in Global Business" },
  ] as Education[],
};
