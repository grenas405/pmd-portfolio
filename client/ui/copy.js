/**
 * Copy-to-clipboard buttons: <button data-copy="text" data-copied="Confirmation">.
 * @param {Window} win
 * @param {Iterable<HTMLElement>} buttons
 * @param {(message: string) => void} toast
 */
export const wireCopyButtons = (win, buttons, toast) => {
  for (const button of buttons) {
    button.addEventListener("click", async () => {
      const text = button.dataset.copy ?? "";
      try {
        await win.navigator.clipboard.writeText(text);
        toast(button.dataset.copied ?? "Copied");
      } catch {
        // Clipboard can be blocked by browser settings; tell the visitor what to do instead.
        toast(`Couldn't copy. The address is ${text}`);
      }
    });
  }
};
