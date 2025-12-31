// Make TS happy for dynamic imports of these libs in this project.
// They still have real runtime code; we just treat their types as `any` here.
declare module "three";
declare module "three-stdlib";
