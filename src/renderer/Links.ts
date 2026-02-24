import { Data, HierarchyNode } from "../Data";
import * as d3 from 'd3';


export function init(
  root: HierarchyNode,
  gLink: d3.Selection<SVGGElement, unknown, null, undefined>,
  source: HierarchyNode | undefined
) {
  const links = root.links();
  const link = gLink.selectAll<SVGPathElement, d3.HierarchyLink<Data>>("path")
    .data(links, (d: any) => d.target.id);

  const diagonal = d3.linkHorizontal<any, any>().x(d => d.y).y(d => d.x);
  const linkEnter = link.enter().append("path")
    .attr("d", _d => {
      const sourceX = source?.x0 ?? source?.x ?? 0;
      const sourceY = source?.y0 ?? source?.y ?? 0;
      const o = { x: sourceX, y: sourceY };
      return diagonal({ source: o, target: o });
    });

  link.merge(linkEnter).transition().duration(750).attr("d", diagonal as any);

  link
    .exit()
    .transition()
    .duration(750)
    .remove()
    .attr("d", _d => {
      const sourceX = source?.x ?? 0;
      const sourceY = source?.y ?? 0;
      const o = { x: sourceX, y: sourceY };
      return diagonal({ source: o, target: o });
    });
}