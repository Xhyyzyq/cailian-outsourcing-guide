const SYSTEM_NAMES = {mes:'MES',mag:'MAG',srm:'SRM',site:'现场 / 后道'};
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const anchor = (node,side) => side==='left'?[node.x,node.y+node.h/2]:side==='right'?[node.x+node.w,node.y+node.h/2]:side==='top'?[node.x+node.w/2,node.y]:[node.x+node.w/2,node.y+node.h];

function edgePoints(flow,edge) {
  const start=anchor(flow.nodes.find(n=>n.id===edge.from),edge.fromSide);
  const end=anchor(flow.nodes.find(n=>n.id===edge.to),edge.toSide);
  if(edge.via) return [start,...edge.via,end];
  if(start[0]===end[0] || start[1]===end[1]) return [start,end];
  return [start,[start[0],end[1]],end];
}
function graphNode(node) {
  if(node.kind==='decision') return `<div class="decision-node" style="left:${node.x}px;top:${node.y}px;width:${node.w}px;height:${node.h}px"><span>${escapeHtml(node.title)}</span></div>`;
  const element=node.href?'a':Number.isInteger(node.step)?'button':'div';
  const attrs=node.href?`href="${node.href}"`:Number.isInteger(node.step)?`type="button" data-show-step="${node.step}" aria-label="${escapeHtml(SYSTEM_NAMES[node.system])} · ${escapeHtml(node.title)}，查看操作详情"`:'';
  return `<${element} ${attrs} class="graph-node sys-${node.system} ${node.pending?'is-pending':''} ${node.kind||''}" data-node-id="${node.id}" style="left:${node.x}px;top:${node.y}px;width:${node.w}px;height:${node.h}px">
    <span class="node-heading"><span class="node-system">${SYSTEM_NAMES[node.system]}</span><span class="node-index">${Number.isInteger(node.step)?String(node.step+1).padStart(2,'0'): '↗'}${node.pending?' · 待核实':node.badge?' · '+node.badge:''}</span></span>
    <strong>${escapeHtml(node.title)}</strong><span class="node-menu">${escapeHtml(node.menu)}</span><span class="node-action">${escapeHtml(node.action)}</span><span class="node-meta">${escapeHtml(node.meta)}</span>
  </${element}>`;
}
function graphMarkup(key,instance='main') {
  const flow=FLOWS[key];
  const edges=flow.edges.map(edge=>{
    const points=edgePoints(flow,edge),start=points[0],end=points[points.length-1];
    const center=edge.labelAt || [(start[0]+end[0])/2,(start[1]+end[1])/2-10];
    return `<path class="flow-edge ${edge.pending?'pending-edge':''}" d="${points.map((p,i)=>`${i?'L':'M'}${p.join(' ')}`).join(' ')}" marker-end="url(#arrow-${edge.pending?'pending-':''}${instance})"/>${edge.label?`<text x="${center[0]}" y="${center[1]}" class="edge-label" text-anchor="middle">${escapeHtml(edge.label)}</text>`:''}`;
  }).join('');
  return `<section class="diagram-panel" data-flow-key="${key}"><div class="diagram-toolbar"><div><b>系统泳道图</b><span>点节点看操作 · 可左右滑动</span></div><div class="diagram-tools" aria-label="流程图查看工具"><button type="button" data-zoom="out" aria-label="缩小流程图">−</button><output class="zoom-value" aria-live="polite">100%</output><button type="button" data-zoom="in" aria-label="放大流程图">＋</button><button type="button" data-zoom="fit">适合窗口</button>${instance==='main'?'<button type="button" data-large-flow>大图 ↗</button>':''}</div></div>
    <div class="diagram-scroll" tabindex="0" role="region" aria-label="${escapeHtml(GUIDE[key.split('/')[0]].scenes[key.split('/')[1]].title)}流程图，可横向滚动"><div class="diagram-space"><div class="diagram-canvas" style="width:1120px;height:${flow.height}px">
    <div class="canvas-topline"><span>操作系统 / 责任方</span><span>跟随箭头流转 · 编号对应操作详情</span></div>
    ${flow.lanes.map(lane=>`<div class="swimlane sys-${lane.system}" style="top:${lane.y}px;height:${lane.h}px"><div class="lane-caption"><b>${lane.label}</b><span>${lane.sub}</span></div></div>`).join('')}
    <svg class="flow-connectors" width="1120" height="${flow.height}" viewBox="0 0 1120 ${flow.height}" aria-hidden="true"><defs><marker id="arrow-${instance}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L8 4 L0 8 Z" class="arrow-head"/></marker><marker id="arrow-pending-${instance}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L8 4 L0 8 Z" class="arrow-head-pending"/></marker></defs>${edges}</svg>
    ${flow.nodes.map(graphNode).join('')}</div></div></div>
    <div class="diagram-caption"><span class="legend-line"></span>已核实的流转 <span class="legend-line dashed"></span>待核实的交接 <span class="legend-diamond"></span>条件分支<span class="pan-tip">可缩放 · 左右滑动查看</span></div></section>`;
}
function scalePanel(panel,mode='initial') {
  const viewport=panel.querySelector('.diagram-scroll'),canvas=panel.querySelector('.diagram-canvas'),space=panel.querySelector('.diagram-space');
  if(!viewport || !canvas) return;
  const fit=Math.min(1.25,(viewport.clientWidth-2)/1120);
  const old=Number(panel.dataset.scale||1);
  const next=mode==='initial'?Math.max(.78,fit):mode==='fit'?fit:Math.max(.3,Math.min(2,old+(mode==='in'?.15:-.15)));
  panel.dataset.scale=String(next);
  canvas.style.transform=`scale(${next})`;
  space.style.width=`${1120*next}px`;
  space.style.height=`${FLOWS[panel.dataset.flowKey].height*next}px`;
  panel.querySelector('.zoom-value').textContent=`${Math.round(next*100)}%`;
  if(mode==='initial' && viewport.clientWidth<600) viewport.scrollLeft=120*next;
}
function initGraphs(){document.querySelectorAll('.diagram-panel').forEach(panel=>scalePanel(panel));}

function openLargeFlow(key) {
  const dialog=document.getElementById('flow-dialog');
  const [group,scene]=key.split('/');
  dialog.innerHTML=`<div class="large-flow-head"><h2>${GUIDE[group].scenes[scene].title}</h2><button type="button" data-close-flow>关闭大图 ×</button></div>${graphMarkup(key,'large')}`;
  dialog.showModal();
  scalePanel(dialog.querySelector('.diagram-panel'),'fit');
}
