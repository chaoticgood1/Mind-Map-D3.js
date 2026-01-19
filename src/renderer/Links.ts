import { Data, HierarchyNode } from "../Data";
import * as d3 from 'd3';


export function init(
  root: HierarchyNode,
  gLink: d3.Selection<SVGGElement, unknown, null, undefined>,
  source: HierarchyNode,
  transition: d3.Transition<SVGSVGElement, unknown, null, undefined>
) {
  const links = root.links();
  const link = gLink.selectAll<SVGPathElement, d3.HierarchyLink<Data>>("path")
    .data(links, (d: any) => d.target.id);

  const diagonal = d3.linkHorizontal<any, any>().x(d => d.y).y(d => d.x);
  const linkEnter = link.enter().append("path")
    .attr("d", _d => {
      const o = { x: source.x0 ?? source.x, y: source.y0 ?? source.y };
      return diagonal({ source: o, target: o });
    });

  link.merge(linkEnter).transition(transition).attr("d", diagonal as any);

  link
    .exit()
    .transition(transition)
    .remove()
    .attr("d", _d => {
      const o = { x: source.x, y: source.y };
      return diagonal({ source: o, target: o });
    });
}