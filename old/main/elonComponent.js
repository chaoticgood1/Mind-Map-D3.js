class ElonComponent {
  constructor() {
    this.textManager = new TextManager();
    this.initEventListeners();
  }

  init(json) {
    this.textManager.globalConnection = this.globalConnection;
    let ec = this;
    return new Promise(function(resolve, reject) {
      let margin = {
        top: 20,
        right: 90,
        bottom: 30,
        left: 90
      }
  
      let width = $(document).width();
      let height = $(document).height();
  
      let treeContainer = d3.select('#tree-container')
        .append('svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('id', 'svg')
        .append('g')
        .attr('transform', "translate("
          + width * 0.5 + "," + height * 0.5 + ")");
  
      let root;
  
      let treemap = d3.tree()
        .nodeSize([30, 140]);
  
      root = d3.hierarchy(json, function(d) {
        return d.children; 
      });
      root.x0 = height / 2;
      root.y0 = 0;
      
      ec.treeContainer = treeContainer;
      ec.treemap = treemap;
      ec.root = root;
      // Event.dispatch(Event.MAIN_ROOT, {root: root});
      resolve(root);
    });
  }

  initEventListeners() {
    window.addEventListener(Event.UPDATE_TREE, (e) => {
      let source = e.detail.source;
      let root = e.detail.root;

      if (source == undefined)
        source = this.root;

      if (root == undefined) {
        root = this.root;
      }

      this.update(source, root);
      if (e.detail.dispatchAfter == undefined)
        Event.dispatch(Event.UPDATE_TREE_AFTER, {});
    });
    window.addEventListener(Event.REPLACE_ROOT, (e) => {
      this.source = e.detail.source;
      this.root = e.detail.root;
      Event.dispatch(Event.UPDATE_TREE, {
        source: this.source,
        root: this.root
      });
    })
  }

  update(source, root) {
    let treeContainer = this.treeContainer;
    let treemap = this.treemap;

    // Assigns the x and y position for the nodes
    var treeData = treemap(root);
  
    // Compute the new tree layout.
    var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);
    // console.log(links);
  
    // Normalize for fixed-depth.
    nodes.forEach(function(d) {
      // d.x = d.height * 180;
      // d.y = d.depth * 120;
    });
  
    // ****************** Nodes section ***************************
    let duration = 750;
    // Update the nodes...
    let node = initNodes(treeContainer, nodes, root);
    let nodeEnter = positionNewNodeInParentPreviousPosition(node, source);
    let width = 110;
    initCircle(nodeEnter, root, this);
    initNearestNodeDetectorCircle(nodeEnter, root, this);
    initTextArea(nodeEnter, this, width);

    let nodeUpdate = nodeEnter.merge(node);
    animateNodePosition(nodeUpdate, duration);
    updateCircleNode(nodeUpdate);
    updateTextNode(nodeUpdate, width, wrap, this);
    let nodeExit = removeExistingNodes(node, source, duration);
    exitCircle(nodeExit);
    exitText(nodeExit);

    let link = updateLinks(treeContainer, links, root);
    let linkEnter = enterLinkToParentPreviousPosition(link, source, diagonal);
    let linkUpdate = linkEnter.merge(link);
    linkTransitionBackToParentElementPosition(linkUpdate, duration);
    let linkExit = removeExitingLinks(link, duration, source, diagonal);
    nodes = storeOldPositionForTransition(nodes);

    return root;
  
    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
      return `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`;
    }
  
    function wrap(text, width, ec) {
      text.each(function () {
        var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          x = text.attr("x"),
          y = text.attr("y"),
          dy = 0.25, //parseFloat(text.attr("dy")),
          tspan1 = text.text(null)
                      .append("tspan")
                      .attr("class", "span-text")
                      .attr("x", x)
                      .attr("y", y)
                      .on('dblclick', (d) => {
                        ec.textManager.onOpenTextEdit(d);
                      })
                      .attr("dy", dy + "em");
        
        let tspan = tspan1;
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            ++lineNumber;
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan")
                        .attr("class", "span-text")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", lineHeight + "em")
                        .on('dblclick', (d) => {
                          ec.textManager.onOpenTextEdit(d);
                        })
                        .text(word);
          }
        }
  
        if (lineNumber > 0) 
          tspan1.attr("dy", (dy - (0.5 * lineNumber)) + "em");
      });
    }

    function initNodes(treeContainer, nodes, root) {
      let i = 0;
      return treeContainer.selectAll('g.node')
        .data(nodes, (d) => {
          return d.data.id;
        })
        .attr('background-color', d3.rgb('#151515'));
    }

    function positionNewNodeInParentPreviousPosition(node, source) {
      return node.enter().append('g')
      .attr('class', 'node')
      // .attr('id', function(d) {
      //   return "g-" + d.id;
      // })
      .attr("transform", function(d) {
        //NOTE: Have to set later for animation
        if (source.y0 != undefined) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
        }
        return "translate(" + 0 + "," + 0 + ")";
      })
    }

    function initCircle(nodeEnter, root, ec) {
      nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });
    }

    function initNearestNodeDetectorCircle(nodeEnter, root, ec) {
      nodeEnter.append("circle")
      .attr('class', 'detectorCircle')
      .attr("r", 20)
      .attr("opacity", 0.2) // change this to zero to hide the target area
      .style("fill", "red")
      .style("display", "none")
      .attr('pointer-events', 'mouseover')
      .on("mouseover", function(d) {
        ec.globalConnection.selectedData = d;
      })
      .on("mouseout", function(d) {
        ec.globalConnection.selectedData = undefined;
      });
    }

    function initTextArea(nodeEnter, ec, width) {
      let height = 25;
      initRect(nodeEnter, ec, width, height);
      initLabels(nodeEnter, ec, width);

      function initRect(nodeEnter, ec, width, height) {
        nodeEnter.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 13)
        .attr("y", function(d) {
          return height * -0.5;
        })
        .attr('class', 'text-rect')
        .on('dblclick', function(d) {
          ec.textManager.onOpenTextEdit(d);
        });
      }
  
      function initLabels(nodeEnter, ec, width) {
        nodeEnter.append('text')
        .attr('class', 'text-wrap')
        .attr("dy", ".35em")
        .attr("x", function(d) {
          return 15;
        })
        .attr("text-anchor", function(d) {
          return "start";
        })
        .on('dblclick', function(d) {
          ec.textManager.onOpenTextEdit(d);
        })
        .text(function(d) { return d.data.text; })
        .style("fill", "white")
        .call(wrap, width, ec);
      }
    }

    function animateNodePosition(nodeUpdate, duration) {
      nodeUpdate.transition()
      .duration(duration)
      .attr("transform", function(d) { 
          return "translate(" + d.y + "," + d.x + ")";
      });
    }

    function updateCircleNode(nodeUpdate) {
      nodeUpdate.select('circle.node')
      .attr('r', 10)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      })
      .attr('cursor', 'pointer');
    }

    function updateTextNode(nodeUpdate, width, wrapFn, ec) {
      nodeUpdate.selectAll('.text-wrap')
      .data(nodes, (d) => {
        return d.data.id;
      })
      .text(function(d) {
        return d.data.text; 
        // return d.data.id + ": " + d.data.text;
      })
      .call(wrapFn, width, ec);
    }

    function removeExistingNodes(node, source, duration) {
      return node.exit()
      .transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();
    }

    function exitCircle(nodeExit) {
      nodeExit.select('circle')
      .attr('r', 1e-6);
    }

    function exitText(nodeExit) {
      nodeExit.select('text')
      .style('fill-opacity', 1e-6);
    }

    function updateLinks(treeContainer, links, root) {
      return treeContainer.selectAll('path.link')
      .data(links, function(d) { 
        // if (root.new != undefined)
        //   return d.data.id + "-" + root.new;
        return d.data.id; 
      });
    }

    function enterLinkToParentPreviousPosition(link, source, diagonalFn) {
      return link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d) {
        //NOTE: Have to set later for animation
        if (source.y0 != undefined) {
          var o = {x: source.x0, y: source.y0}
          return diagonalFn(o, o);
        }
      });
    }

    function linkTransitionBackToParentElementPosition(linkUpdate, duration) {
      linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });
    }

    function removeExitingLinks(link, duration, source, diagonalFn) {
      return link.exit()
      .transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonalFn(o, o)
      })
      .remove();
    }

    function storeOldPositionForTransition(nodes) {
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
      return nodes;
    }
  }

}