class DragManager {
  constructor() {
  }

  init() {
    let currentPos = [];
    this.initEventListeners();

    d3.select('body')
      .call(d3.drag()
        .on('start', function() {
          let m = d3.mouse(this);
          currentPos[0] = m[0];
          currentPos[1] = m[1];
        })
        .on("drag", function() {
          dragScreen(this);
          Event.dispatch(Event.ON_DRAG, {});
        })
        .on("end", function() {

        })
      );
    
    this.initCircleNode();

    function dragScreen(owner) {
      let g = d3.select('g')
      let t = getTranslation(g);
      let diff = getDiffVar(currentPos, owner);

      let newX = t[0] + diff[0];
      let newY = t[1] + diff[1];
      g.attr('transform', `translate(${newX}, ${newY})`);


      function getDiffVar(currentPos, owner) {
        let m = d3.mouse(owner);
        let diff = getDiff(currentPos, m);
        currentPos[0] = m[0];
        currentPos[1] = m[1];
        return diff;
      }

      function getDiff(currentPos, mPos) {
        let xDiff = mPos[0] - currentPos[0];
        let yDiff = mPos[1] - currentPos[1];
        return [xDiff, yDiff];
      }
  
      function getTranslation(owner) {
        let transform = owner.attr('transform');
        var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttributeNS(null, "transform", transform);
        var matrix = g.transform.baseVal.consolidate().matrix;
        return [matrix.e, matrix.f];
      }
    }
  }

  initEventListeners() {
    window.addEventListener(Event.UPDATE_TREE_AFTER, (e) => {
      this.initCircleNode();
    });
  }

  initCircleNode() {
    let globalConnection = this.globalConnection;
    let dx = 0;
    let dy = 0;
    let activatedOnce = false;
    d3.selectAll('circle.node')
    .call(d3.drag()
      .on("start", function(d) {
        
      })
      .on("drag", function(d) {
        if (!activatedOnce) {
          activatedOnce = true;
          showDetectorCircle();
          disableTextPointerEvent(d, this);
          setDescendantsVisibility(d, false);
          d.selected = true;
          Event.dispatch(Event.ON_DRAG_UPDATE_ONCE, {selectedData: d});
        }

        setToMousePosition(d, this);
        
        function setToMousePosition(d, t) {
          let node = d3.select(t);
          dx += d3.event.dy;
          dy += d3.event.dx;
          node.attr("transform", `translate(${dy},${dx})`);
        }

        function showDetectorCircle() {
          d3.selectAll(".detectorCircle")
          .style("display", "block");
        }

        function disableTextPointerEvent(d, node) {
          d3.selectAll(".text-rect")
          .style("pointer-events", "none");
          d3.selectAll(".text-wrap")
          .style("pointer-events", "none");

          d3.select(node)
          .style("pointer-events", "none");
        }
      })
      .on("end", function(d) {
        activatedOnce = false;
        
        hideDetectorCircle();
        enableTextPointerEvent(d, this);
        setNewParent(d, this, globalConnection);
        setNodeDDescendantsVisibility(d, true);
        resetCirclePosition(this);

        function resetCirclePosition(dNode) {
          dx = 0;
          dy = 0;
          let e = d3.select(dNode);
          e.attr("transform", `translate(${dy},${dx})`);
        }

        function hideDetectorCircle() {
          d3.selectAll(".detectorCircle")
          .style("display", "none");
        }

        function enableTextPointerEvent(d, node) {
          d3.selectAll(".text-rect")
          .style("pointer-events", "auto");
          d3.selectAll(".text-wrap")
          .style("pointer-events", "auto");
          d3.select(node)
          .style("pointer-events", "auto");
        }

        function setNewParent(d, t, globalConnection) {
          let p = globalConnection.selectedData;
          if (p != undefined && p != d) {
            if (Node.siblings(p, d) && dy < 0) {
              Event.dispatch(Event.NODE_CHANGE_BREADTH_INDEX, {
                nodeToMove: d,
                nodeBasis: p
              })
            } else {
              if (p.data.id != d.data.parentId) {
                Event.dispatch(Event.APPEND_NODE, {
                  parent: p,
                  child: d
                });
              }
            }
          }
        }
      })
    );

    function setDescendantsVisibility(nodeD, visible) {
      setNodeDDescendantsVisibility(nodeD, visible);
      d3.selectAll(".detectorCircle")
      .style("display", function(d) {
        if (d.data.visible == undefined)
          return "block";

        if (d.data.visible)
          return "block";
        return "none";
      });
    }

    function setNodeDDescendantsVisibility(nodeD, visible) {
      let c = nodeD.children;
      if (c != undefined) {
        for (let i = 0; i < c.length; i++) {
          let child = c[i];
          child.data.visible = visible;
          setNodeDDescendantsVisibility(child, visible);
        }
      }
    }
  }
}