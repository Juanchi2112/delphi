declare module "*.topo.json" {
  import type { Topology } from "topojson-specification";
  const value: Topology;
  export default value;
}
