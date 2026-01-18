class Node {

  constructor(parent, id, name) {
  }

  static changeParent(node, parent) {
    node.parent = parent;
    if (parent.data.children == undefined)
      parent.data.children = [];
    parent.data.children.push(node.data);
  }

  static siblings(a, b) {
    return (a.data.parentId == b.data.parentId);
  }
}