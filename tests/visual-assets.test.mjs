import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {HOLES,courseSVG} from '../assets/course.mjs';
const root=new URL('../',import.meta.url);

test('each hole uses its own real local image and a distinct playable line',async()=>{
 const images=new Set(),lines=new Set();
 for(const h of HOLES){
  const svg=courseSVG(h.number),image=svg.match(/<image href="([^"]+)"/)[1],line=svg.match(/class="course-route" d="([^"]+)"/)[1];
  assert.ok(!images.has(image),'a repeated background would recreate the reported defect');images.add(image);lines.add(line);
  const buf=await readFile(new URL('.'+image,root));assert.equal(buf.toString('ascii',8,12),'WEBP');assert.ok(buf.length>10000,'a full landscape is required');
  assert.ok(svg.includes(h.name));assert.ok(svg.includes(String(h.meters)));assert.ok(svg.includes('pathLength="1"'));
 }
 assert.equal(images.size,18);assert.equal(lines.size,18);
});

test('all built routes ship the revised experience and resolve direct assets',async()=>{
 for(const route of ['','course/','visitors/','membership/','academy/','clubhouse/','contact/','privacy/','terms/']){
  const html=await readFile(new URL(route+'index.html',root),'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes('/assets/experience.css'));
  for(const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g))assert.ok((await stat(new URL('.'+match[1],root))).size>0,match[1]);
 }
});
