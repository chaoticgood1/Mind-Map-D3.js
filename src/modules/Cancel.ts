import { currentMode, Mode } from './drawer/LocalRegistry';

export const Cancel = {
  init() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        currentMode.set(Mode.None);
      }
    });
  },
};
