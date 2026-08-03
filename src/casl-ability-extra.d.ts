// @casl/ability@7 ships types only behind its package.json "exports" map, which
// classical (moduleResolution: "node") TS resolution can't read. tsx's dev
// runtime also honors tsconfig "paths", so a paths-based redirect straight to
// the .d.ts file (the previous approach) gets required as JS at runtime and
// crashes. Declaring the module ambiently avoids both problems: TS never
// needs to resolve the bare specifier itself, and tsx has nothing to
// misresolve since the specifier is no longer in "paths".
declare module '@casl/ability' {
  export * from '@casl/ability/dist/types/index';
}

declare module '@casl/ability/extra' {
  export * from '@casl/ability/dist/types/extra/index';
}
