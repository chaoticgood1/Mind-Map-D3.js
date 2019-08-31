class Event {
  static UPDATE_TREE = 'UPDATE_TREE';
  static APPEND_NODE = 'APPEND_NODE';
  static APPEND_NODE_SUCCESS = 'APPEND_NODE_SUCCESS';
  static UPDATE_TREE_AFTER = "UPDATE_TREE_AFTER";
  static ON_DRAG_UPDATE_ONCE = "ON_DRAG_UPDATE_ONCE";
  static SAVE = "SAVE";
  static LOAD = "LOAD";

  constructor() {
    Object.freeze(this);
  }

  static dispatchEvent(type, detail) {
    window.dispatchEvent(new CustomEvent(type, {detail: detail}))
  }
}