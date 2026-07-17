import { domAnimation } from "motion/react";

/** Async entry for `LazyMotion` so the animation renderer stays out of the initial bundle. */
export default domAnimation;
