/**
 * Closes the small-screen menu popover after a link inside it is chosen.
 * @param {HTMLElement} menu
 */
export const wireMenu = (menu) => {
  menu.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a") : null;
    if (link && menu.matches(":popover-open")) menu.hidePopover();
  });
};
