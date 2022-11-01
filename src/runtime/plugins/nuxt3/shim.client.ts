import { featureDetectAndPolyfill } from "../../utils/shadowRootPolyfill";
import { defineNuxtPlugin } from "#imports";

featureDetectAndPolyfill();

export default defineNuxtPlugin(() => {});
