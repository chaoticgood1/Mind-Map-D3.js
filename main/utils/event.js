class Event {
  static UPDATE_TREE = 'UPDATE_TREE';
  static APPEND_NODE = 'APPEND_NODE';
  static DELETE_NODE = "DELETE_NODE";
  static DELETE_NODE_DATA = "DELETE_NODE_DATA";
  static APPEND_NODE_SUCCESS = 'APPEND_NODE_SUCCESS';
  static UPDATE_TREE_AFTER = "UPDATE_TREE_AFTER";
  static ON_DRAG_UPDATE_ONCE = "ON_DRAG_UPDATE_ONCE";
  static ON_DRAG = "ON_DRAG";
  static SAVE = "SAVE";
  static LOAD_DATA = "LOAD_DATA";
  static LOAD_JSON_FILE = "LOAD_JSON_FILE";
  static LOAD_JSON_FILE_SUCCESSFUL = "LOAD_JSON_FILE_SUCCESSFUL";
  static CANCEL_NODE_CREATION = "CANCEL_NODE_CREATION";
  static PROCESS_TEXT_INPUT = "PROCESS_TEXT_INPUT";
  static CREATE_CHILD_NODE = "CREATE_CHILD_NODE";
  static FOLD_DESCENDANTS = "FOLD_DESCENDANTS";
  static FOLD_ANCESTORS = "FOLD_ANCESTORS";
  static FOLD_ANCESTORS_VIEW = "FOLD_ANCESTORS_VIEW";
  static FOLD_ANCESTORS_ROOT = "FOLD_ANCESTORS_ROOT";
  static REMOVE_FOLD_DESCENDANTS = "REMOVE_FOLD_DESCENDANTS";
  static SELECTED_NODE = "SELECTED_NODE";
  static MAIN_ROOT = "MAIN_ROOT";
  static SHOW_NODE_MENU = "SHOW_NODE_MENU";

  static GET_NODE_REVISIONS = "GET_NODE_REVISIONS";
  static SELECTED_NODE_REVISIONS = "SELECTED_NODE_REVISIONS";

  static CHANGE_NODE_VERSION = "CHANGE_NODE_VERSION";
  static REPLACE_DATA = "REPLACE_DATA";
  static REPLACE_ROOT = "REPLACE_ROOT";
  static ADD_DATA = "ADD_DATA";
  static EDIT_DATA = "EDIT_DATA";
  static ADD_REVISION = "ADD_REVISION";
  static GET_LAST_NODE_ID = "GET_LAST_NODE_ID";
  static SET_LAST_NODE_ID = "SET_LAST_NODE_ID";
  
  static NODE_CHANGE_BREADTH_INDEX = "NODE_CHANGE_BREADTH_INDEX";

  static CIRCLE_UPDATE_LISTENER = "CIRCLE_UPDATE_LISTENER";

  constructor() {
    Object.freeze(this);
  }

  static dispatch(type, detail = {}) {
    window.dispatchEvent(new CustomEvent(type, {detail: detail}))
  }

  static disposeEvents() {
    window.removeEventListener(Event.LOAD_JSON_FILE);
    window.removeEventListener(Event.LOAD_JSON_FILE_SUCCESSFUL);
  }
}