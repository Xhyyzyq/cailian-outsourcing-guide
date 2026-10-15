const workflows = {
  sewing: {
    number:'01', title:'缝制外发', eyebrow:'SEWING OUTSOURCING', summary:'SRM 管加工商和接单，MAG 管外发任务。接单扫整张任务单，加工完成按唯一码逐件记录。', badge:'有专门的外发协同链路',
    flow:['加工商配置','外发建单','裁片与辅料交接','接单加工','完成与回货'],
    steps:[
      {title:'配置加工商与可做款式',system:'SRM',role:'供应商管理人员',path:'委外加工管理 → 加工商列表 → 新增 / 商品管理',actions:['新增加工商，填写名称、编号、联系人、地址、加工内容及产能，并启用。','在加工商行点击 <strong>商品管理</strong>，添加可做的 SPU，配置产能、优先级和启停状态。','可维护打样实拍图；若下拉框没有目标 SPU，先刷新 SPU 基础数据。'],result:'加工商主档与 SPU 能力在 SRM 建立，供 MAG 同步和分配。',note:'只有加工商主档还不够。能否分到订单，还要看 SPU 是否匹配、是否启用、优先级及产能。'},
      {title:'同步加工商配置',system:'MAG',role:'工厂计划 / 外发管理人员',path:'工厂 → 外发缝制协同 → 更新加工商列表',actions:['点击 <strong>更新加工商列表</strong>。','检查加工商下拉列表中的名称、编号，以及目标款式的配置。','确认款式会进入对应的缝制外发链路。'],result:'MAG 获取 SRM 的加工商与款式能力，后续可在建单时选择加工商。',note:'此同步按全量刷新处理。SRM 是主维护端，不能把直接修改 MAG 数据表当作常规配置方式。'},
      {title:'创建外发缝制任务',system:'MAG',role:'工厂计划 / 外发管理人员',path:'工厂 → 外发缝制协同',actions:['方式一：输入 <strong>任务单号</strong>，选择加工商，点击 <strong>添加</strong>。','方式二：输入一批 <strong>yoycol 唯一码</strong>，选择加工商，点击 <strong>创建委外缝制单</strong>。','按配置也可走自动分配；「打印批次（自动）」中另有 <strong>生成缝制外发(SRM)</strong> 入口。'],result:'形成外发缝制任务及其唯一码明细，关联加工商。',note:'自动分配和建批能力存在，但当前线上是否自动运行，仍需核对配置与任务条件。'},
      {title:'配货、打印标签与交接',system:'MAG + 线下',role:'工厂配货 / 外发人员',path:'外发缝制协同 → 任务列表',actions:['点击 <strong>品类尺码数量</strong>，按任务核对裁片和辅料。','准备好实物后，操作 <strong>标记配货</strong>。','点击 <strong>打印缝制单标签</strong>，随裁片和辅料交给加工商。'],result:'任务、标签与实物对应，加工商可以用任务单标签接单。',note:'任务可以提前生成。实物交接要以裁片、辅料实际备齐为准；建单不等于已经发出货物。'},
      {title:'加工商扫码接单',system:'SRM',role:'缝制加工商',path:'加工扫描管理 → 加工扫描 → 接单扫码',actions:['使用对应加工商账号进入 <strong>接单扫码</strong>。','扫描 <strong>缝制任务单号</strong>。','确认系统提示接单成功，以及接收的唯一码数量。'],result:'SRM 从 MAG 取得任务明细，形成加工记录并记录接单时间。',note:'接单对象是整张缝制任务单。不要把这里的扫码对象和“加工完成扫码”的唯一码混用。'},
      {title:'逐件标记加工完成',system:'SRM → MAG',role:'缝制加工商',path:'加工扫描管理 → 加工扫描 → 加工完成扫码',actions:['加工完成后扫描 <strong>商品唯一码</strong>。','也可以到「委外加工管理 → 委外加工列表 → 待加工」，逐条点击 <strong>加工完成</strong>。','发生问题时，可按实际情况使用 <strong>异常重置</strong> 或 <strong>未到货</strong>。'],result:'SRM 记录加工完成时间与操作人，并调用 MAG 同步缝制完成。',note:'加工完成表示供应商已完成该件加工，并不代表实物已经回到工厂。'},
      {title:'回厂后核对回货记录',system:'分拣链路 → SRM',role:'回厂接收 / 分拣 / 外发管理人员',path:'委外加工管理 → 委外加工列表 → 加工列表',actions:['实物回厂后进入现有接收、分拣及后续履约流程。','在加工列表核对 <strong>是否回货、回货时间</strong>，并对照加工状态、接单和加工完成时间。','代码中存在分拣状态回传联动 SRM 标记回货的逻辑。'],result:'SRM 可分别记录“加工完成”和“已回货”，便于核对在外加工与回厂情况。',note:'具体哪个现场扫码工位触发回货回传尚待线上核实，本次不将其写成一个已确认的独立“回货扫码”按钮。',pending:true}
    ],
    notes:[['裁片退回怎么办？','MAG 另有「外发缝制裁片回退」页面，可关联原缝制单、登记退回唯一码并重新分配；任务详情中也有“裁片回厂”入口。'],['最容易看错的两个状态','“加工完成”和“已回货”是两件事。追踪外发时要一起看，不能用供应商完工时间代替回厂时间。']],
    source:'MAG SewingTask.vue、SewingTaskBack.vue、SewingFactoryDao.js；SRM MobileScan、ExternalProcessList、SrmConverterProductService；MAG API APIDao.js 的回货联动。'
  },
  printing:{number:'02',title:'打印外发',eyebrow:'EXTERNAL PRINTING',summary:'在 MES 维护外印工厂、给款式指定打印供应商；外厂通过专属门户查看批次、下载文件并反馈生产状态。',badge:'已有工厂配置与外厂门户',flow:['外印厂配置','款式分厂','生产文件生成','外厂下载打印','状态反馈'],
    steps:[
      {title:'新增外印工厂',system:'MES',role:'具备工厂管理权限的人员',path:'研发 → 配置 → 外发工厂管理 → 新增外发工厂',actions:['填写工厂名称、联系人及联系方式。','确认 <strong>启用工厂、可用于款式分配、生产文件自动上传 OSS</strong> 等配置。','保存工厂。符合启用及上传条件时，系统生成专属门户链接。'],result:'建立 MES 与 MAG 共用的打印工厂配置。',note:'此管理页目前管理“打印外发工厂”。缝制加工商仍在 SRM 的“加工商列表”中维护。'},
      {title:'配置外厂权限与模式',system:'MES',role:'工厂管理人员',path:'外发工厂管理 → 编辑外发工厂',actions:['按需开启 <strong>允许外厂生成打印批次</strong>。','按需开启 <strong>允许外厂 PC 加急建批</strong>。','配置外厂允许生成的打印模式：<strong>普通打印、二合一、一拆二</strong>。'],result:'决定外厂能够执行哪些建批动作和打印模式。',note:'新门户默认不允许外厂自行建批。能打开门户，不等于有“生成打印批次”的权限。'},
      {title:'款式选择打印供应商',system:'MES',role:'款式配置人员',path:'款式编辑 / 转款 → 打印供应商（待排版状态前有效）',actions:['在款式的 <strong>打印供应商</strong> 下拉框中选择目标外印厂。','核对工厂处于启用状态，且允许用于款式分配。','结合实际款式配置，确认后续订单应进入的打印链路。'],result:'符合条件的订单按款式上的打印供应商进入对应工厂的生产范围。',note:'页面标明“待排版状态前有效”。不能默认修改配置后，所有历史订单和在制批次都会自动改派。'},
      {title:'进入外厂门户、查看批次',system:'MAG 外厂门户',role:'外印工厂操作员',path:'工厂专属入口 → 打印批次',actions:['打开管理员提供的该工厂专属门户。','门户包含 <strong>打印批次、看图（状态修改）、订单列表</strong>。','在打印批次中查询任务；具备建批权限时，可点击 <strong>生成（工厂名）</strong>，由系统按配置处理对应模式。'],result:'在该工厂的业务范围中查看批次，并在授权范围内生成生产任务。',note:'未开启建批权限时，应查看已有批次；不要把没有“生成”按钮误判为系统没有外印功能。'},
      {title:'下载生产文件并生产',system:'MAG + 外厂',role:'外印工厂操作员',path:'打印批次 → 展开任务 → 下载',actions:['展开打印批次，查看任务及文件生成情况。','生产文件就绪后，点击 <strong>下载</strong>。','部分场景可使用 <strong>生成下载链接 / 重新生成下载链接</strong>。','核对任务对应的生产文件，交由外厂打印。'],result:'外厂获得对应任务的生产文件并开展打印。',note:'外印侧已查到多种打印模式的支持，但每个工厂具体启用了哪些模式，需要看其配置及实际部署。'},
      {title:'反馈状态、衔接下道工序',system:'MAG',role:'外印工厂 / 生产管理人员',path:'打印批次 / 看图（状态修改） / 订单列表',actions:['使用页面提供的 <strong>打印完成</strong> 等状态操作记录生产进展。','通过 <strong>订单列表</strong> 追踪对应订单。','完成后按该工厂实际生产路线进入后续转印、切割或其他环节。'],result:'打印任务的进度可在系统内查询，衔接后续履约。',note:'文件下载完成不等于打印完成。后续实物交接与回厂节点需要按工厂实际路线核对。'}
    ],notes:[['较新的变化','10 月 13 日的代码和发布记录已出现“外发工厂管理”。标准外印厂接入可通过页面配置；引入新的生产协议仍可能需要开发。'],['工厂配置与款式配置分开看','工厂配置决定可生成的模式和权限；款式配置决定订单分给哪个打印供应商。两者都要符合实际生产安排。']],source:'MES PrintFactories/index.tsx、StyleForm.tsx；MAG PrintFactoryPortal.vue、PrintBatchForFactory.vue；2026-10-13 print_factory_management_review.md。'
  },
  cutting:{number:'03',title:'转印与切割',eyebrow:'TRANSFER & CUTTING',summary:'SRM 已有工序任务池和扫码流转。它能记录切割进度；独立“切割外发派单—接单—回货”闭环，本次尚未确认。',badge:'工序流转已确认 · 独立外发待核实',pending:true,flow:['排版完成','打印 / 转印','待切割','切割完成','待缝制'],
    steps:[
      {title:'进入打印与转印任务池',system:'SRM',role:'供应商打印 / 转印人员',path:'订单管理 → 生产列表 → 打印&转印任务池',actions:['查看排版完成后进入的任务。','按需 <strong>看图、打印任务单、打印任务单二维码或唯一码</strong>。','按实际任务准备打印、转印生产。'],result:'任务信息与生产文件、标签对应，供打印和转印环节使用。'},
      {title:'标记打印转印完成',system:'SRM',role:'供应商打印 / 转印人员',path:'打印&转印任务池 → 打印转印完成',actions:['实物完成后，点击 <strong>打印转印完成</strong>。','扫描任务单，或扫描其中一个唯一码。','确认关联任务单及商品数量。'],result:'该任务单下商品整体进入“待切割”。',note:'这是任务单维度操作：扫一个唯一码，也会将它所在任务单内的全部唯一码标记为待切割。'},
      {title:'执行切割、标记完成',system:'SRM',role:'供应商切割人员',path:'订单管理 → 生产列表 → 切割任务池 → 切割完成',actions:['在切割任务池中查看待切割任务，必要时 <strong>打印任务单</strong>。','实物完成切割后，点击 <strong>切割完成</strong> 并扫码。','核对扫码结果中的任务单和商品数量。'],result:'整张任务单进入“待缝制”，交给下一道工序。',note:'关键规则：扫一个唯一码，会将其所属任务单的所有商品一起标记为待缝制。不能按“单件切割完成”理解。'},
      {title:'缝制接单与完成',system:'SRM',role:'供应商缝制人员',path:'订单管理 → 生产列表 → 缝制任务池',actions:['点击 <strong>缝制接单</strong>，按唯一码接收商品。','加工完成后使用 <strong>缝制完成</strong> 扫码。','继续生产完成及后续发货流程。'],result:'按唯一码推进缝制和生产完成状态。',note:'这里是 SRM 生产列表的工序流转。不要与“MAG 外发缝制协同 → SRM 加工扫描”的另一条链路混用。'},
      {title:'切割异常回退',system:'SRM',role:'生产异常处理人员',path:'切割任务池 → 重置到排版 / 重置到设计',actions:['需要重新排版时，使用 <strong>重置到排版</strong>，登记对应唯一码并填写备注。','需要重新设计时，使用 <strong>重置到设计</strong>，填写唯一码及原因。','根据异常实际原因，选择对应回退环节。'],result:'异常商品返回相应处理节点，避免直接继续后续工序。'}
    ],notes:[['“有切割任务池”能说明什么？','已确认能在供应商范围内记录转印、切割和缝制进度，并按任务单流转。MAG 另有厂内切割任务池。'],['独立切割外发仍需核实','未找到与缝制协同同等明确的“选择切割加工商 → 独立外发单 → 接单 → 回货”完整链路。仅有“切割供应商”字段不能证明已有该能力。']],source:'SRM OrderProducing/index.tsx、PrintPool.tsx、ScanMark/index.tsx；TypesettingTaskService.transferSign / cutSign / sewSign。切割完成接口按当前供应商范围处理，记录当前登录操作人的姓名。'
  }
};

const main=document.getElementById('main');
let page='overview';
let stepIndex=0;
const tag=(text,kind='')=>`<span class="tag ${kind}">${text}</span>`;
const header=(eyebrow,title,summary,badge='',pending=false)=>`<div class="page-head"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="intro">${summary}</p></div>${badge?`<div class="head-status">${tag(badge,pending?'amber':'')}</div>`:''}</div>`;
const source=(text)=>`<details class="source-details"><summary>查看本页依据</summary><p>${text}<br>基于保存的代码版本与 SOP 核对；线上权限、开关及部署情况仍需实测。<a class="inline-link" href="#scope">查看完整核实范围</a></p></details>`;

function overview(){
  return header('OPERATIONS GUIDE / 2026','外发业务，怎么看、怎么做','先选你要了解的环节。每一步都对应操作人、系统入口、具体动作与操作结果。')+
  `<div class="hero-note"><div><strong>缝制、打印已有专门功能。<br>切割已覆盖工序流转，独立外发仍待核实。</strong><p>三个环节分布在 MES、MAG、SRM，入口和扫码规则各不相同。</p></div><div class="hero-number">03<span>条流程说明</span></div></div>
  <div class="section-label"><h2>选择一条流程开始查看</h2><span>点击后按步骤浏览</span></div>
  <div class="overview-lanes">
    <a class="lane" href="#sewing"><div class="lane-title"><span class="lane-no">01</span><div><h3>缝制外发</h3><span class="small">SRM + MAG</span></div></div><div><div class="lane-path"><span>加工商配置</span><i>→</i><span>外发建单</span><i>→</i><span>接单加工</span><i>→</i><span>完成 / 回货</span></div><div class="lane-detail">有专门外发任务、加工商接单、异常处理与回货记录</div></div><div class="lane-action">查看 7 步<span>↗</span></div></a>
    <a class="lane" href="#printing"><div class="lane-title"><span class="lane-no">02</span><div><h3>打印外发</h3><span class="small">MES + MAG</span></div></div><div><div class="lane-path"><span>外印厂配置</span><i>→</i><span>款式分厂</span><i>→</i><span>下载生产文件</span><i>→</i><span>打印反馈</span></div><div class="lane-detail">通过工厂专属门户操作；外厂建批需要单独开启权限</div></div><div class="lane-action">查看 6 步<span>↗</span></div></a>
    <a class="lane" href="#cutting"><div class="lane-title"><span class="lane-no">03</span><div><h3>转印与切割</h3><span class="small">SRM 工序任务池</span></div></div><div><div class="lane-path"><span>打印转印完成</span><i>→</i><span>待切割</span><i>→</i><span>切割完成</span><i>→</i><span>待缝制</span></div><div class="lane-detail">按整张任务单推进；尚未确认独立切割加工商派单与回货闭环</div></div><div class="lane-action">查看 5 步<span>↗</span></div></a>
  </div><div class="bottom-note"><span class="symbol">i</span><p><strong>这是功能与操作说明，不是实时生产看板。</strong> 已核对前后端代码、SOP 与近期变更记录；现场启用情况和部分回货工位仍需核实。<a href="#scope">查看核实范围</a></p></div>`;
}

function workflow(key){const w=workflows[key];return header(w.eyebrow,w.title,w.summary,w.badge,w.pending)+
  `<div class="flow-intro" aria-label="业务流程">${w.flow.map((x,i)=>`${i?'<span class="arrow" aria-hidden="true">→</span>':''}<span class="node">${x}</span>`).join('')}</div>
  <div class="explorer"><div class="step-list"><div class="step-list-label">操作步骤 · 点击查看详情</div><div class="steps-scroll">${w.steps.map((s,i)=>`<button class="step-button" type="button" data-step="${i}" aria-pressed="${i===stepIndex}" aria-controls="step-panel"><span class="num">${String(i+1).padStart(2,'0')}</span><span><span class="step-title">${s.title}</span><span class="step-system">${s.system}</span></span></button>`).join('')}</div></div><section class="step-detail" id="step-panel" aria-live="polite"></section></div>
  <div class="notes-grid">${w.notes.map(n=>`<div class="note"><h3>${n[0]}</h3><p>${n[1]}</p></div>`).join('')}</div>${source(w.source)}`;}

function step(){const w=workflows[page],s=w.steps[stepIndex];document.getElementById('step-panel').innerHTML=
  `<div class="step-top">${tag(s.system,s.pending?'amber':'')}<span class="step-count">STEP ${String(stepIndex+1).padStart(2,'0')} / ${String(w.steps.length).padStart(2,'0')}</span></div><h2>${s.title}</h2><div class="role-line">操作人：${s.role}${s.pending?'　·　现场触发入口待核实':''}</div><div class="path-box"><div class="field-label">系统入口</div><p>${s.path}</p></div><div class="field-label">怎么操作</div><ol class="action-list">${s.actions.map(a=>`<li>${a}</li>`).join('')}</ol><div class="result"><div class="field-label">操作结果</div><p>${s.result}</p></div>${s.note?`<div class="caution"><strong>注意</strong>　${s.note}</div>`:''}<div class="step-nav"><button type="button" data-prev ${stepIndex===0?'disabled':''}>← 上一步</button><button type="button" class="next" data-next>${stepIndex===w.steps.length-1?'返回总览 ↗':'下一步 →'}</button></div>`;
  document.querySelectorAll('[data-step]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.step)===stepIndex)));
}

function comparison(){return header('QUICK REFERENCE','系统入口速查','知道自己要做什么时，直接找到对应系统和操作入口。')+
`<div class="compare-wrap"><table><thead><tr><th>我想做什么</th><th>到哪里操作</th><th>关键动作 / 注意点</th></tr></thead><tbody>
<tr><td><strong>新增缝制加工商</strong><a href="#sewing/1">进入步骤 →</a></td><td>SRM → 委外加工管理 → 加工商列表</td><td>建主档，再到“商品管理”配可做 SPU、优先级和产能。</td></tr>
<tr><td><strong>分配缝制外发任务</strong><a href="#sewing/3">进入步骤 →</a></td><td>MAG → 工厂 → 外发缝制协同</td><td>先同步加工商；按任务单或一批唯一码创建外发缝制单。</td></tr>
<tr><td><strong>供应商接单 / 完工</strong><a href="#sewing/5">进入步骤 →</a></td><td>SRM → 加工扫描管理 → 加工扫描</td><td>接单扫任务单；加工完成扫唯一码。</td></tr>
<tr><td><strong>查外发回货和异常</strong><a href="#sewing/7">进入步骤 →</a></td><td>SRM → 委外加工管理 → 委外加工列表</td><td>分别看加工状态和是否回货。现场回货触发工位待核实。</td></tr>
<tr><td><strong>新增打印外发工厂</strong><a href="#printing/1">进入步骤 →</a></td><td>MES → 研发 → 配置 → 外发工厂管理</td><td>建工厂、配规则和门户；默认未开启外厂自行建批。</td></tr>
<tr><td><strong>指定某款由谁打印</strong><a href="#printing/3">进入步骤 →</a></td><td>MES → 款式编辑 / 转款 → 打印供应商</td><td>页面注明“待排版状态前有效”，不能默认改派历史在制单。</td></tr>
<tr><td><strong>外印厂下载文件</strong><a href="#printing/5">进入步骤 →</a></td><td>MAG 外厂门户 → 打印批次 → 展开任务</td><td>生产文件就绪后下载；下载完成不等于打印完成。</td></tr>
<tr><td><strong>记录切割完成</strong><a href="#cutting/3">进入步骤 →</a></td><td>SRM → 订单管理 → 生产列表 → 切割任务池</td><td>点击“切割完成”并扫码，整张任务单进入待缝制。</td></tr>
</tbody></table></div><div class="bottom-note"><span class="symbol">i</span><p><strong>关于 MAG 的“生成复合外发批次”：</strong>已查到按钮实际按“本厂打印＋外发综合缝制”建批。当前证据不足以把它认定为独立的面料复合加工委外模块。</p></div>`;}

function scope(){return header('EVIDENCE & SCOPE','哪些确认了，哪些还要核实','将代码中存在的能力，与线上已启用、现场正在使用的流程分开看。')+
`<div class="scope-box"><h2>本次确认的内容</h2><ul><li>缝制外发的加工商、款式能力、任务、接单扫码、加工完成、回货记录及裁片回退入口。</li><li>MES 外发工厂管理与 MAG 外厂门户，以及外厂建批权限和生产文件下载能力。</li><li>SRM 打印转印、切割、缝制任务池，以及整张任务单推进的扫码规则。</li></ul></div>
<div class="scope-box"><h2>仍需线上 / 现场核实</h2><div class="scope-list"><div class="scope-item"><span>缝制外发</span><p>哪些加工商当前启用、可接哪些 SPU；自动分配是否运行；具体哪个现场扫码工位触发“已回货”。</p></div><div class="scope-item"><span>打印外发</span><p>哪些工厂已启用新门户、是否允许自行建批、开放哪些打印模式，以及款式配置的实际部署页面。</p></div><div class="scope-item"><span>切割外发</span><p>是否存在独立切割加工商的派单、交接、接单与回货闭环；实际切割是供应商自己做，还是再交给其他工厂。</p></div></div></div>
<div class="scope-box"><h2>证据与版本</h2><p>整理日期：2026 年 10 月 14 日。本页以本机保存的远端代码版本、已有 SOP 和近期变更记录为依据。当天 Git 远端连接超时，线上界面连接也未成功，因此未逐项验证生产部署、菜单权限和开关。</p><div class="scope-evidence">MAG：4a72210c9a · 2026-10-13<br>MAG 前端：388830656e · 2026-10-13<br>MES 前端：e2a6d07c21 · 2026-10-13<br>SRM 前端：5dc423f7a5 · 2026-08-24<br>SRM 后端：b5da9fc65d · 2026-09-28<br>MAG API：989776d083 · 2026-10-09</div><p>主要依据：SewingTask / MobileScan / ExternalProcessList；PrintFactories / PrintFactoryPortal / PrintBatchForFactory；OrderProducing / PrintPool / ScanMark；SrmConverterProductService / TypesettingTaskService / APIDao，以及外发相关 SOP。</p><p>本页只说明现有功能与流程，不连接业务系统，不展示实时订单，也不执行建单、接单或状态变更。</p></div>`;}

function render(){const [requested,stepStr]=location.hash.slice(1).split('/');page=['overview','comparison','scope',...Object.keys(workflows)].includes(requested)?requested:'overview';stepIndex=workflows[page]?Math.max(0,Math.min(workflows[page].steps.length-1,(parseInt(stepStr,10)||1)-1)):0;document.querySelectorAll('[data-page]').forEach(a=>{if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});main.innerHTML=workflows[page]?workflow(page):page==='comparison'?comparison():page==='scope'?scope():overview();if(workflows[page])step();document.title=`${workflows[page]?.title||({overview:'功能总览',comparison:'入口速查',scope:'核实范围'}[page])} · 外发业务指南`;}
document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.id==='print-page'){window.print();return;}if(button.hasAttribute('data-step')){stepIndex=Number(button.dataset.step);history.replaceState(null,'',`#${page}/${stepIndex+1}`);step();}else if(button.hasAttribute('data-prev')&&stepIndex>0){stepIndex--;history.replaceState(null,'',`#${page}/${stepIndex+1}`);step();}else if(button.hasAttribute('data-next')){if(stepIndex===workflows[page].steps.length-1){location.hash='overview';return;}stepIndex++;history.replaceState(null,'',`#${page}/${stepIndex+1}`);step();}else return;const selected=document.querySelector('[data-step][aria-pressed=true]');if(selected&&innerWidth<=760)selected.scrollIntoView({block:'nearest',inline:'nearest'});});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});
render();
