class LoadManager {

  constructor() {
    window.addEventListener(Event.LOAD_JSON_FILE, (e) => {
      this.getAsText((result) => {
        Event.dispatch(Event.LOAD_JSON_FILE_SUCCESSFUL, {json: JSON.parse(result)});
      });
    });
  }

  getAsText(fn) {
    let input = document.createElement('input');
    input.setAttribute("id", "inputFile");
    input.setAttribute("type", "file");
    let b = document.querySelector('body');
    b.append(input); 
    input.click();
    input.onchange = function (event) {
      let file = input.files[0];
      let fr = new FileReader();
      fr.onload = function (event) {
        fn(fr.result);
      }
      fr.readAsText(file);
      event.preventDefault();
      input.remove();
    }
  }
}