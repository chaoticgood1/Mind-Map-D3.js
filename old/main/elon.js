
$(document).ready(() => {
  let elonComponent = new ElonComponent();
  let dragManager = new DragManager();
  let globalConnection = new GlobalConnection();
  let saveManager = new SaveManager();
  let foldDescendants = new FoldDescendants();
  let foldAncentors = new FoldAncentors();
  let appendNode = new AppendNode();
  
  let loadManager = new LoadManager();
  let nodeMenu = new NodeMenu();

  let controlDown = false;

  start();
  initEventListeners();

  let dataManager = new DataManager();

  function start() {
    elonComponent.globalConnection = globalConnection;
    dragManager.globalConnection = globalConnection;

    controlDown = false;
    document.onkeydown = function(ev) {
      // console.log(ev);
      switch (ev.key) {
        case "Enter": Event.dispatch(Event.PROCESS_TEXT_INPUT, {});
          ev.preventDefault();
          break;
        case "Tab": Event.dispatch(Event.CREATE_CHILD_NODE, {});
          ev.preventDefault();
          break;
        case "Delete": Event.dispatch(Event.DELETE_NODE, {});
          ev.preventDefault();
          break;
        case "Control": controlDown = true;
          break;
        case "c":
        case "C": if (controlDown) {
            console.log("Copy");
            Event.dispatch(Event.ON_COPY_NODE);
            controlDown = false;
            ev.preventDefault();
          }
          break;
        case "o":
        case "O": if (controlDown) {
            Event.dispatch(Event.LOAD_JSON_FILE, {});
            controlDown = false;
            ev.preventDefault();
          }
          break;
        case "s":
        case "S": if (controlDown) {
            Event.dispatch(Event.SAVE, {root: elonComponent.root});
            controlDown = false;
            ev.preventDefault();
          }
          break;
        case "F1": Event.dispatch(Event.FOLD_ANCESTORS, {});
          ev.preventDefault();
          break;
        case "Alt": Event.dispatch(Event.SHOW_NODE_MENU, {});
          break;
        default:
      }
    }

    document.onkeyup = function(ev) {
      switch (ev.key) {
        case "Control": controlDown = false;
          ev.preventDefault();
          break;
        default:
      }
    }

    jQuery('#svg').keydown(function() {
    });
    
  }

  function initEventListeners() {
    window.addEventListener(Event.LOAD_DATA_SUCCESSFUL, (e) => {
      d3.selectAll("svg > *").remove();
      $("#tree-container").empty();
      initComponent(e.detail.data);
    });
  }

  function initComponent(json) {
    elonComponent.init(json)
    .then((root) => {
      return elonComponent.update(root, root);
    })
    .then((root) => {
      Event.dispatch(Event.UPDATE_TREE_AFTER, {});
      dragManager.init();
      
      // Event.dispatch(Event.FOLD_ANCESTORS, {root: root, init: true});
      Event.dispatch(Event.FOLD_DESCENDANTS, {root: root, init: true});
      Event.dispatch(Event.UPDATE_TREE, {});
      // Event.dispatch(Event.FOLD_ANCESTORS, {root: root});
      // Event.dispatch(Event.FOLD_DESCENDANTS, {root: root});
    });
  }
});

