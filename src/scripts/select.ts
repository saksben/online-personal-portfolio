/**
 * Character-select behavior. The page is fully usable without this script
 * (every slot is a real link); this adds hover/focus/keyboard browsing, the
 * info panel and the signature transitions.
 */
import { characters } from "@/data/characters";
import { cleanupTransition, runTransition } from "./transitions";

const stage = document.querySelector<HTMLElement>("[data-stage]");
const choose = document.querySelector<HTMLAnchorElement>("#choose");

if (stage && choose) {
  const slots = Array.from(stage.querySelectorAll<HTMLLIElement>(".roster > li"));
  const panels = Array.from(stage.querySelectorAll<HTMLElement>("[data-panel]"));
  const chooseName = choose.querySelector<HTMLElement>("[data-choose-name]");
  const canHover = window.matchMedia("(hover: hover)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let active = 0;
  let busy = false;
  const prefetched = new Set<string>();

  const prefetch = (href: string) => {
    if (prefetched.has(href)) return;
    prefetched.add(href);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.append(link);
  };

  const setActive = (index: number) => {
    if (busy || index === active || !characters[index]) return;
    active = index;
    const character = characters[index];
    stage.dataset.active = character.id;
    slots.forEach((slot, i) => (slot.dataset.current = String(i === index)));
    panels.forEach((panel) => (panel.hidden = panel.dataset.panel !== character.id));
    choose.href = `/${character.id}/`;
    if (chooseName) chooseName.textContent = character.shortName;
    prefetch(choose.href);
  };

  const select = (index: number) => {
    if (busy) return;
    const character = characters[index];
    const slot = slots[index];
    setActive(index);
    busy = true;
    document.body.dataset.transition = character.id;
    slot.dataset.selected = "true";
    const href = `/${character.id}/`;

    const go = () => {
      try {
        sessionStorage.setItem("tx-enter", JSON.stringify({ c: character.id, t: Date.now() }));
      } catch {
        /* storage unavailable: the page just loads without the handoff fade */
      }
      window.location.href = href;
    };

    if (reduceMotion.matches) {
      go();
      return;
    }

    // Never leave the visitor stuck on an overlay if an animation misbehaves.
    const failsafe = window.setTimeout(go, 2500);
    runTransition({
      kind: character.transition,
      classId: character.id,
      stage,
      origin: slot.getBoundingClientRect(),
    })
      .catch(() => undefined)
      .finally(() => {
        window.clearTimeout(failsafe);
        go();
      });
  };

  slots.forEach((slot, i) => {
    const link = slot.querySelector<HTMLAnchorElement>("a.slot");
    slot.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") setActive(i);
    });
    link?.addEventListener("focus", () => setActive(i));
    link?.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      // On touch, the first tap previews a character; tapping the active one (or the button) chooses.
      if (!canHover.matches && i !== active) {
        setActive(i);
        return;
      }
      select(i);
    });
  });

  choose.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    select(active);
  });

  // On document so browsing works without first focusing a slot (e.g. after Back).
  document.addEventListener("keydown", (e) => {
    if (busy || e.altKey || e.ctrlKey || e.metaKey) return;
    let next = -1;
    if (e.key === "ArrowRight") next = (active + 1) % slots.length;
    else if (e.key === "ArrowLeft") next = (active - 1 + slots.length) % slots.length;
    else if (/^[1-9]$/.test(e.key) && Number(e.key) <= slots.length) next = Number(e.key) - 1;
    if (next < 0) return;
    e.preventDefault();
    slots[next].querySelector<HTMLAnchorElement>("a.slot")?.focus();
    setActive(next);
  });

  // Restored from the back/forward cache with the overlay still up: reset.
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    cleanupTransition();
    busy = false;
    delete document.body.dataset.transition;
    slots.forEach((slot) => delete slot.dataset.selected);
  });
}
