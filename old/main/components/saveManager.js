class SaveManager {

  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener(Event.LOAD_JSON_FILE_SUCCESSFUL, (e) => {
      this.json = e.detail.json;
    });
    window.addEventListener(Event.SAVE, (e) => {
      this.save(this.json);
    });
  }

  save(json) {
    let str = JSON.stringify(json, null, 2);
    download(str, "map.json", "text.json");

    function download(content, fileName, contentType) {
      let a = document.createElement("a");
      let file = new Blob([content], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    }
  }
}