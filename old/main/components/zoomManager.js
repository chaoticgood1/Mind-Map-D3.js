class ZoomManager {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener(Event.UPDATE_TREE_AFTER, (e) => {
      let zoom = d3.zoom().on("zoom", () => {
        console.log("zoom");
        // console.log(svg);
      });

      let svg = d3.select("svg");
      svg.call(zoom);
      
    });
  }
}