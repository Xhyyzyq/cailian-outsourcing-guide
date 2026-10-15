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
  const attrs=node.href?`href="${node.href}"`:Number.isInteger(node.step)?`type="button" data-show-step="${node.step}" aria-haspopup="dialog" aria-label="${escapeHtml(SYSTEM_NAMES[node.system])} · ${escapeHtml(node.title)}，查看操作详情"`:'';
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

function openLargeFlow() {
  const dialog=document.getElementById('flow-dialog');
  dialog.innerHTML=`<div class="large-flow-head"><h2>${GUIDE[page].scenes[sceneId].title}</h2><button type="button" data-close-flow>关闭大图 ×</button></div>${graphMarkup(`${page}/${sceneId}`,'large')}`;
  dialog.showModal();
  scalePanel(dialog.querySelector('.diagram-panel'),'fit');
}
function overviewMaps() {
  const maps=[
    {group:'sewing',title:'缝制外发',sub:'从建单配货，到外厂完工与回货',status:'已确认主要链路',nodes:[['srm','加工商配置','新增 / 商品管理','setup'],['mag','建单与配货','创建委外缝制单','run'],['srm','接单 → 加工','整单接收 / 逐件完工','run/4'],['site','回厂 → 核对','现场入口待核实','run/6',true]]},
    {group:'printing',title:'打印外发',sub:'配置外印工厂，外厂领取批次生产',status:'已确认外厂门户',nodes:[['mes','配置工厂与款式','外发工厂 / 打印供应商','setup'],['mag','取批次、下文件','打印批次 → 下载','run'],['mag','打印开始 → 完成','开始打印 / 打印完成','run/4'],['site','后道 / 回厂','实际承接路线待核实','run/6',true]]},
    {group:'cutting',title:'转印与切割',sub:'SRM 工序流转；独立切割外发闭环待核实',status:'已确认工序流转',nodes:[['srm','打印转印完成','整张任务扫码推进','run/2'],['srm','切割完成','整张任务 → 待缝制','run/3'],['srm','缝制 → 生产完成','接单 / 完工逐件扫码','run/4'],['srm','物流交付','中转仓或直发','run/7']]}
  ];
  return `<div class="overview-legend">${Object.entries(SYSTEM_NAMES).map(([key,name])=>`<span class="system-key sys-${key}"><i></i>${name}</span>`).join('')}<span class="overview-hint">点节点进入对应流程</span></div><div class="overview-maps">${maps.map((map,i)=>`<section class="overview-map"><div class="map-heading"><div><span class="map-number">0${i+1}</span><h2>${map.title}</h2><span class="map-status">${map.status}</span></div><a href="#${map.group}/run">完整泳道图 ↗</a></div><p class="map-sub">${map.sub}</p><div class="mini-flow">${map.nodes.map((node,j)=>`${j?`<span class="mini-arrow ${node[4]?'pending':''}" aria-label="流向"><svg viewBox="0 0 48 20" aria-hidden="true"><path d="M1 10 H42 M34 3 L43 10 L34 17"/></svg></span>`:''}<a class="mini-node sys-${node[0]} ${node[4]?'is-pending':''}" href="#${map.group}/${node[3]}"><span class="node-system">${SYSTEM_NAMES[node[0]]}</span><strong>${node[1]}</strong><small>${node[2]}</small></a>`).join('')}</div><div class="map-scenes">${Object.entries(GUIDE[map.group].scenes).map(([id,scene])=>`<a href="#${map.group}/${id}">${scene.title} <span>↗</span></a>`).join('')}</div></section>`).join('')}</div>`;
}
