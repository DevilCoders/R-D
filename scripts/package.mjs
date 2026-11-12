import { cp, mkdir, rm } from "node:fs/promises";
const root=new URL("../",import.meta.url);
const dist=new URL("../dist/",import.meta.url);
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
for(const name of ["index.html","assets/","src/","concept/"]) await cp(new URL(name,root),new URL(name,dist),{recursive:true});
console.log("Static application, demo client assets, and concept archive packaged into dist/.");