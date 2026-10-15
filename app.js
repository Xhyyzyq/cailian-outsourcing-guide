const main = document.getElementById('main');
let page = 'overview', sceneId = '', selectedStep = -1;
const tag = (text, kind = '') => `<span class="tag ${kind}">${text}</span>`;
const header = (eyebrow, title, summary) => `<div class="page-head"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="intro">${summary}</p></div></div>`;
const sceneUrl = (group, id) => `#${group}/${id}`;
const totalScenes = Object.values(GUIDE).reduce((count, group) => count + Object.keys(group.scenes).length, 0);
const totalSteps = Object.values(GUIDE).flatMap(group => Object.values(group.scenes)).reduce((count, scene) => count + scene.steps.length, 0);

function overview() {
  return header('VISUAL WORKFLOW / 2026', '外发怎么走，一张图看清', '先看三条业务主线，再点进场景泳道图。节点写明系统、菜单和按钮，箭头串起前后交接。') +
    overviewMaps() + `<div class="bottom-note"><span class="symbol">i</span><p>共 ${totalScenes} 张场景流程图 · ${totalSteps} 个操作环节。虚线标注待核实的交接，具体说明可点击节点查看。<a href="#scope">查看核实范围</a></p></div>`;
}

function stepDetail(step, index, scene) {
  return `<details class="operation" id="operation-${index + 1}" ${selectedStep === index ? 'open' : ''}>
    <summary><span class="operation-number">${String(index+1).padStart(2,'0')}</span><span class="operation-name">${step.title}<small>${step.system} · ${step.role}</small></span>${step.pending ? tag('入口待核实','amber') : ''}<span class="expand-hint" aria-hidden="true">展开操作</span></summary>
    <div class="operation-body">
      <div class="path-box"><div class="field-label">进入哪个系统 / 菜单</div><p><strong>${step.system}</strong> → ${step.path}</p></div>
      <div class="operation-input"><div><span class="field-label">准备什么 / 扫什么</span><p>${step.input}</p></div><div><span class="field-label">点击什么</span><p><strong>${step.click}</strong></p></div></div>
      <div class="field-label">具体怎么做</div><ol class="action-list">${step.actions.map(action => `<li>${action}</li>`).join('')}</ol>
      <dl class="outcome-grid"><div><dt>系统结果 / 状态变化</dt><dd>${step.result}</dd></div><div><dt>下一环节交给谁</dt><dd>${step.handoff}</dd></div><div><dt>完成后检查什么</dt><dd>${step.check}</dd></div></dl>
      ${step.note ? `<div class="caution"><strong>${step.pending ? '尚未核实' : '操作提醒'}</strong>　${step.note}</div>` : ''}
      <p class="step-evidence">核对依据：${scene.evidence}</p>
    </div></details>`;
}

function workflow() {
  const group = GUIDE[page], scene = group.scenes[sceneId];
  return header(`${group.title} / 场景流程图`, scene.title, scene.cadence + ' · 按箭头查看前后流转，点击节点查看系统操作。') +
    `<nav class="scene-nav" aria-label="${group.title}场景">${Object.entries(group.scenes).map(([id, item]) => `<a href="${sceneUrl(page,id)}" ${id === sceneId ? 'aria-current="page"' : ''}>${item.title}</a>`).join('')}</nav>
    ${graphMarkup(`${page}/${sceneId}`)}
    <p class="flow-reading-note">${FLOWS[`${page}/${sceneId}`].note}</p>
    <details class="flow-context"><summary>开始前需要准备什么 · 流程结束条件</summary><div class="scene-context"><div><span class="field-label">开始前</span><p>${scene.before}</p></div><div><span class="field-label">完成到哪里</span><p>${scene.end}</p></div></div></details>
    <details class="manual-section"><summary>展开完整操作手册 <span>${scene.steps.length} 个环节的详细说明</span></summary><div class="operation-list">${scene.steps.map((step,index)=>stepDetail(step,index,scene)).join('')}</div></details>
    <p class="source-details">按已核对的代码与 SOP 整理。线上权限及待核实工位需现场确认。 <a class="inline-link" href="#scope">核实范围与版本</a></p>`;
}

function comparison() {
  const rows = [
    ['新增加工商 / 可做 SPU','SRM', PATHS.provider,'新增；商品管理 → 新增','#sewing/setup'],
    ['同步缝制加工商','MAG',PATHS.sewing,'更新加工商列表','#sewing/setup/4'],
    ['给某批货建缝制外发单','MAG',PATHS.sewing,'添加 / 创建委外缝制单','#sewing/run/1'],
    ['配货、交出裁片辅料','MAG',PATHS.sewing,'查看详情；品类尺码数量；标记配货；打印缝制单标签','#sewing/run/2'],
    ['加工商接收外发缝制单','SRM',PATHS.scan,'接单扫码：扫缝制任务单号','#sewing/run/4'],
    ['加工商完成外发缝制','SRM',PATHS.scan,'加工完成扫码：逐件扫唯一码','#sewing/run/5'],
    ['查加工完没、回货没','SRM',PATHS.process+' → 加工列表','按任务 / 唯一码查加工状态、是否回货和时间','#sewing/run/7'],
    ['少货 / 加工异常','SRM',PATHS.process+' → 待加工','未到货 / 异常重置，按原因选择','#sewing/abnormal'],
    ['裁片实物退回重派','MAG',PATHS.back,'创建退回单 → 添加回退缝制单 → 退回扫码 → 重新分配缝制单','#sewing/returns'],
    ['新增外印厂 / 获取入口','MES',PATHS.factory,'新增外发工厂；编辑；查看链接 / 复制链接','#printing/setup'],
    ['给款式选择打印工厂','MES',PATHS.style,'打印供应商（待排版状态前有效）','#printing/setup/4'],
    ['外厂取打印文件','MAG 外厂门户',PATHS.portal,'查询 → 展开批次 → 下载','#printing/run/3'],
    ['外厂记录打印开始 / 完工','MAG 外厂门户',PATHS.portal+' → 任务行','开始打印 / 打印完成','#printing/run/4'],
    ['记录转印、切割完成','SRM',PATHS.pool+' → 对应任务池','打印转印完成 / 切割完成：按整张任务单推进','#cutting/run/2'],
    ['SRM 任务池缝制接单 / 完工','SRM',PATHS.pool+' → 缝制任务池','缝制接单 → 扫唯一码 → 完成；缝制完成 → 扫唯一码','#cutting/run/4'],
    ['切割发现排版 / 设计问题','SRM',PATHS.pool+' → 切割任务池','重置到排版 / 重置到设计','#cutting/reset'],
    ['生产完成后交中转仓','SRM','物流管理 → 中转仓 → 待发货','勾选商品 → 生成发货单 → 确认发货','#cutting/run/7']
  ];
  return header('QUICK REFERENCE','系统入口与按钮速查','按你当前要办的事定位；点击“查看完整流程”可看到前置条件和后续交接。')+
    `<div class="compare-wrap"><table><thead><tr><th>我要做什么</th><th>去哪个系统 / 菜单</th><th>点什么</th></tr></thead><tbody>${rows.map(row=>`<tr><td><strong>${row[0]}</strong><a href="${row[4]}">查看完整流程 →</a></td><td>${tag(row[1])}<p>${row[2]}</p></td><td>${row[3]}</td></tr>`).join('')}</tbody></table></div>
    <div class="scope-box scan-rules"><h2>四类扫码，不能混用</h2><ul><li>MAG 缝制外发的 SRM“接单扫码”：扫缝制任务单。</li><li>该链路的“加工完成扫码”：扫单件商品唯一码。</li><li>SRM 生产任务池的“打印转印完成 / 切割完成”：任务单维度；扫其中一个唯一码也会推进整张任务。</li><li>SRM 缝制任务池的“缝制接单 / 缝制完成”：唯一码维度；接单需先加入清单，再点击“完成”。</li></ul></div>`;
}

function scope() {
  return header('EVIDENCE & SCOPE','已核对的操作与仍待补齐的环节','本页是根据代码与已有 SOP 整理的操作指引，不能代替生产环境的菜单权限、开关和现场验收。')+
    `<div class="scope-box"><h2>本次补充：2026 年 10 月 15 日</h2><p>将三类业务拆成 ${totalScenes} 个场景、${totalSteps} 个环节，逐项写明操作人、系统菜单、按钮、输入 / 扫码对象、结果及交接。首次配置、每批作业、异常处理和替代操作分别标注。</p><p>核对了缝制退回重派、MES 当前入口的“查看链接 / 复制链接”、打印的“开始打印 / 打印完成”、SRM 扫码的提交时机及中转仓发货入口。</p></div>
    <div class="scope-box"><h2>以下不能当成已确认的现场 SOP</h2><div class="scope-list"><div class="scope-item"><span>缝制正常回货</span><p>已查到回货回传逻辑和“是否回货 / 回货时间”，具体由哪个系统、哪个工位的按钮触发，尚待核实。“裁片回厂”属于裁片异常处理，不能代替正常成品回货。</p></div><div class="scope-item"><span>外印后道交接</span><p>打印完成后的转印、切割、跨系统承接及回厂，需按工厂实际路线确认。不能把 MAG 外厂门户和 SRM 任务池画成已经验证的自动串联。</p></div><div class="scope-item"><span>独立切割外发</span><p>已确认 SRM 切割工序流转；尚未确认“选择切割加工商 → 独立外发单 → 接单 → 回货”的完整闭环。</p></div><div class="scope-item"><span>线上权限与开关</span><p>加工商 / 工厂是否启用、允许哪些打印模式、是否开启自动分配、账号能否看到按钮，仍需在对应线上账号检查。款式编辑表单的最终提交按钮文案、异常解除入口也需现场补齐。</p></div><div class="scope-item"><span>物流后续</span><p>核对了中转仓“生成发货单 / 确认发货”和直发各作业菜单。仓库接收、直发各工位的详细 SOP、结算付款不属于本次已完整核实的外发链路。</p></div></div></div>
    <div class="scope-box"><h2>几个容易误解的状态</h2><ul><li>创建任务 ≠ 实物已交出；打印标签 ≠ 已出库。</li><li>加工完成 ≠ 已回货；裁片退回 ≠ 正常成品回厂。</li><li>下载文件 ≠ 开始打印 ≠ 打印完成。</li><li>切割完成是当前页面的整任务操作，不是单件完成。</li><li>扫码加入列表 ≠ 提交成功；SRM 缝制接单要再点“完成”。</li><li>MES“外发工厂管理”管理打印外发；缝制加工商仍在 SRM 维护。</li></ul></div>
    <div class="scope-box"><h2>代码依据</h2><p>本次复核使用本机保存的远端提交快照，未修改业务系统工作区，也未逐项执行生产环境操作。快照不是已验证的生产部署版本。</p><div class="scope-evidence">MAG：39855afbc4 · 2026-10-14<br>MAG 前端：006beea0f4 · 2026-10-14<br>MES 前端：951ab08a69 · 2026-10-14<br>SRM 前端：5dc423f7a5 · 2026-08-24<br>SRM 后端：b5da9fc65d · 2026-09-28<br>MAG API：328fcdeded · 2026-10-15</div><p>主要依据：SewingTask / SewingTaskBack / MobileScan / ExternalProcessList / PrintFactories / StyleForm / PrintBatchForFactory / PrintPool / ScanMark / ScanTable / SendProxy 以及相关后端服务与 SOP。</p><p>MAG 的“生成复合外发批次”按已有证据是“本厂打印＋外发综合缝制”建批，不能据此认定为独立面料复合委外模块。</p></div>`;
}

function syncExpandButton() {
  const items = [...document.querySelectorAll('.operation')];
  const allOpen = items.length > 0 && items.every(item => item.open);
  const button = document.getElementById('toggle-details');
  if (button) {
    button.textContent = allOpen ? '收起全部详细步骤' : '展开全部详细步骤';
    button.setAttribute('aria-expanded', String(allOpen));
  }
}

function showStep(index) {
  const scene=GUIDE[page]?.scenes[sceneId], step=scene?.steps[index];
  if(!step) return;
  selectedStep=index;
  history.replaceState(null,'',`#${page}/${sceneId}/${index+1}`);
  const dialog=document.getElementById('step-dialog');
  dialog.innerHTML=`<div class="step-dialog-head"><div><p class="eyebrow">节点 ${String(index+1).padStart(2,'0')} / ${step.system}</p><h2 id="step-dialog-title">${step.title}</h2><p>${step.role}</p></div><button type="button" data-close-step aria-label="关闭操作详情">×</button></div>${stepDetail(step,index,scene).replace(/id="operation-\d+"/, '')}<div class="step-dialog-foot"><span>说明页仅展示流程，不会执行业务操作</span><button type="button" data-close-step>返回流程图</button></div>`;
  const detail=dialog.querySelector('details');
  detail.open=true;
  detail.querySelector('summary').hidden=true;
  if(!dialog.open) dialog.showModal();
  dialog.scrollTop=0;
}
function resetStepUrl() {
  selectedStep=-1;
  if(GUIDE[page]) history.replaceState(null,'',`#${page}/${sceneId}`);
}
function closeStep() {
  resetStepUrl();
  document.getElementById('step-dialog').close();
}

function render() {
  const [requested, requestedScene, requestedStep] = location.hash.slice(1).split('/');
  page = ['overview','comparison','scope',...Object.keys(GUIDE)].includes(requested) ? requested : 'overview';
  const group = GUIDE[page];
  sceneId = group ? (group.scenes[requestedScene] ? requestedScene : group.defaultScene) : '';
  const rawStep = group && /^\d+$/.test(requestedScene || '') ? requestedScene : requestedStep;
  const scene = group?.scenes[sceneId];
  selectedStep = scene && rawStep ? Math.max(0,Math.min(scene.steps.length-1,Number(rawStep)-1)) : -1;
  if (!Number.isFinite(selectedStep)) selectedStep = -1;
  document.querySelectorAll('.sidebar [data-page]').forEach(link => {
    if (link.dataset.page === page) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
  main.innerHTML = group ? workflow() : page === 'comparison' ? comparison() : page === 'scope' ? scope() : overview();
  document.title = `${scene?.title || ({overview:'场景总览',comparison:'入口速查',scope:'核实范围'}[page])} · 外发业务指南`;
  document.querySelectorAll('.operation').forEach(detail => detail.addEventListener('toggle',syncExpandButton));
  initGraphs();
  if (selectedStep >= 0) showStep(selectedStep);
  else window.scrollTo(0,0);
}

document.getElementById('step-dialog').addEventListener('cancel',resetStepUrl);
window.addEventListener('resize',()=>document.querySelectorAll('.diagram-panel').forEach(panel=>scalePanel(panel,'initial')));
document.addEventListener('click', event => {
  if (event.target.closest('.skip')) {
    event.preventDefault();
    main.focus();
    main.scrollIntoView({block:'start'});
    return;
  }
  const button = event.target.closest('button');
  if (!button) return;
  if (button.id === 'print-page') {
    window.print();
  } else if (button.id === 'toggle-details') {
    const details = [...document.querySelectorAll('.operation')];
    const open = !details.every(detail => detail.open);
    details.forEach(detail => detail.open = open);
    syncExpandButton();
  } else if (button.hasAttribute('data-close-step')) {
    closeStep();
  } else if (button.hasAttribute('data-zoom')) {
    scalePanel(button.closest('.diagram-panel'),button.dataset.zoom);
  } else if (button.hasAttribute('data-large-flow')) {
    openLargeFlow();
  } else if (button.hasAttribute('data-close-flow')) {
    document.getElementById('flow-dialog').close();
  } else if (button.hasAttribute('data-show-step')) {
    showStep(Number(button.dataset.showStep));
  }
});
window.addEventListener('beforeprint',()=>document.querySelectorAll('.diagram-panel').forEach(panel=>{
  const ratio=Math.min(.88,480/FLOWS[panel.dataset.flowKey].height);
  panel.querySelector('.diagram-canvas').style.transform=`scale(${ratio})`;
  panel.querySelector('.diagram-space').style.width=`${1120*ratio}px`;
  panel.querySelector('.diagram-space').style.height=`${FLOWS[panel.dataset.flowKey].height*ratio}px`;
}));
window.addEventListener('afterprint',initGraphs);
window.addEventListener('hashchange', render);
render();
