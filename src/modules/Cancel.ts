import { currentMode, Mode } from './drawer';

export const Cancel = {
  init() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        currentMode.set(Mode.None);
      }
    });
  },
};
