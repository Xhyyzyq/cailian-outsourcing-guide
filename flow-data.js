/* 图中编号对应 guide-data.js；分支、待核实交接和跨场景跳转单独建模。 */
const flowNode = (id, x, y, system, title, menu, action, meta, step, extra = {}) => ({id,x,y,system,title,menu,action,meta,step,w:248,h:128,...extra});
const flowEdge = (from,to,fromSide='right',toSide='left',extra={}) => ({from,to,fromSide,toSide,...extra});
const flowLane = (y,h,label,sub,system) => ({y,h,label,sub,system});
const decision = (id,x,y,title,extra={}) => ({id,x,y,title,kind:'decision',w:160,h:104,...extra});
const FLOWS = {
  'sewing/setup': {
    height:648, note:'首次接入先配置主档与款式，再同步到 MAG。配置变化后也要检查同步结果。',
    lanes:[flowLane(56,192,'SRM','供应商管理','srm'),flowLane(248,192,'MES','款式配置','mes'),flowLane(440,192,'MAG','外发计划','mag')],
    nodes:[
      flowNode('a',160,88,'srm','新增加工商','委外加工管理 → 加工商列表','新增 → 填表 → 确定','建立主档并启用',0),
      flowNode('b',480,88,'srm','配置可加工款式','加工商行 → 商品管理','新增 → SPU / 产能 → 确定','检查可做款式、优先级',1),
      flowNode('c',480,280,'mes','设置款式缝制路线','研发 → 款式管理 → 款式信息','缝制供应商 → 按路线选外发','提交表单；最终按钮文案待核',2),
      flowNode('d',480,472,'mag','同步加工商列表','工厂 → 外发缝制协同','更新加工商列表','完成后可创建、分配外发单',3),
      flowNode('next',800,472,'mag','开始每批缝制外发','下一场景','进入建单 → 配货 → 接单','点击打开完整流程 ↗',null,{href:'#sewing/run',kind:'link'})
    ],edges:[flowEdge('a','b'),flowEdge('b','c','bottom','top'),flowEdge('c','d','bottom','top'),flowEdge('d','next')]
  },
  'sewing/run': {
    height:648, note:'沿箭头阅读：上排建单与配货 → 中排接单、加工 → 下排回厂 → 回到 SRM 核对。加工完成与回货分别记录。',
    lanes:[flowLane(56,192,'MAG','工厂外发 / 配货','mag'),flowLane(248,192,'SRM','加工商 / 外发管理','srm'),flowLane(440,192,'现场交接','回厂接收 / 分拣','site')],
    nodes:[
      flowNode('a',160,88,'mag','创建并分配缝制单','工厂 → 外发缝制协同','添加 / 创建委外缝制单','任务单号或唯一码 ＋ 加工商',0),
      flowNode('b',480,88,'mag','核对并配齐裁片辅料','外发缝制协同 → 对应任务','查看详情 → 标记配货','按品类、尺码、数量核对实物',1),
      flowNode('c',800,88,'mag','打印标签，交出实物','外发缝制协同 → 任务行','打印缝制单标签','裁片 ＋ 辅料交加工商',2),
      flowNode('d',800,280,'srm','加工商整单接收','加工扫描管理 → 加工扫描','接单扫码','扫缝制任务单号 · 整单接收',3),
      flowNode('e',480,280,'srm','逐件登记加工完成','加工扫描管理 → 加工扫描','加工完成扫码','扫商品唯一码 · 回传 MAG',4),
      flowNode('f',480,472,'site','实物回厂、接收分拣','现场接收 / 分拣链路','具体系统与按钮待核实','不可用“裁片回厂”替代',5,{pending:true}),
      flowNode('g',160,280,'srm','核对完工与回货','委外加工管理 → 委外加工列表','加工列表 → 按任务 / 码查询','分别看加工状态、是否回货',6)
    ],edges:[flowEdge('a','b'),flowEdge('b','c'),flowEdge('c','d','bottom','top',{label:'交付任务与实物'}),flowEdge('d','e','left','right'),flowEdge('e','f','bottom','top',{pending:true}),flowEdge('f','g','left','bottom',{via:[[284,536]],pending:true,label:'回货后核对',labelAt:[284,456]})]
  },
  'sewing/abnormal': {
    height:480,note:'按异常原因选一个分支。未到货处理与加工异常重置不是先后两个必做步骤。异常解除后的入口仍需现场确认。',
    lanes:[flowLane(56,408,'SRM','加工商操作员','srm')],
    nodes:[
      flowNode('a',160,192,'srm','定位异常商品','委外加工列表 → 待加工','按任务 / 唯一码查询','先核对订单与实物',0),
      decision('why',524,204,'哪类异常？'),
      flowNode('b',800,88,'srm','A · 接单后未收到货','待加工 → 商品行','未到货 → 是','登记缺货，通知工厂核查',1),
      flowNode('c',800,296,'srm','B · 实物存在加工异常','待加工 → 商品行','异常重置 → 备注 → 确定','或使用“异常重置扫码”',2)
    ],edges:[flowEdge('a','why'),flowEdge('why','b','top','left',{via:[[604,152]],label:'没收到实物',labelAt:[710,136]}),flowEdge('why','c','bottom','left',{via:[[604,360]],label:'实物有问题',labelAt:[710,344]})]
  },
  'sewing/returns': {
    height:648,note:'重新分配会产生新缝制单，新单继续配货、接单与加工；“完结”只结束本张退回单。',
    lanes:[flowLane(56,384,'MAG','外发异常处理','mag'),flowLane(440,192,'后续作业','新缝制单继续流转','srm')],
    nodes:[
      flowNode('a',160,88,'mag','创建退回单','工厂 → 外发缝制裁片回退','创建退回单 → 选中','填写退回原因、原加工商',0),
      flowNode('b',480,88,'mag','关联原缝制单','选中回退单','添加回退缝制单','输入原缝制任务单号',1),
      flowNode('c',800,88,'mag','登记实际退回裁片','选中回退单 → 退回扫码','退回扫码 → 唯一码 → 回车','逐件清点，只登记实际退回',2),
      flowNode('d',800,280,'mag','生成新的缝制单','退回明细 → 选商品','重新分配缝制单 → 确定','选择新的加工商',3),
      flowNode('e',480,280,'mag','核对并完结退回单','回退单列表','完结','仅结束退回单，不代表新单完工',4),
      flowNode('next',800,472,'srm','新单回到正常外发','MAG 配货 → SRM 接单 / 加工','重新配货、交接、接单','点击回到正常外发流程 ↗',null,{href:'#sewing/run/2',kind:'link'})
    ],edges:[flowEdge('a','b'),flowEdge('b','c'),flowEdge('c','d','bottom','top'),flowEdge('d','e','left','right'),flowEdge('d','next','bottom','top',{label:'新单继续生产'})]
  },
  'printing/setup': {
    height:648,note:'工厂配置与款式分厂都在 MES。款式“打印供应商”在待排版状态前有效；复制入口请用“查看链接 / 复制链接”。',
    lanes:[flowLane(56,384,'MES','工厂 / 款式配置','mes'),flowLane(440,192,'MAG 外厂','外印操作员','mag')],
    nodes:[
      flowNode('a',160,88,'mes','新增外印工厂','研发 → 配置 → 外发工厂管理','新增外发工厂 → 确定','核对启用、款式开关与 OSS',0),
      flowNode('b',480,88,'mes','配置权限和打印模式','外发工厂管理 → 工厂行','编辑 → 权限 / 打印模式','默认不允许外厂自行建批次',1),
      flowNode('c',800,88,'mes','把入口交给外厂','外发工厂管理 → 工厂行','查看链接 / 复制链接','未开通时生成；不要随意重置',2),
      flowNode('d',800,280,'mes','款式选择打印供应商','研发 → 款式管理 → 款式信息','打印供应商 → 选择工厂','待排版前有效；提交表单',3),
      flowNode('next',800,472,'mag','外厂打开打印批次','工厂专属门户','查看分配给本厂的任务','点击进入每批生产流程 ↗',null,{href:'#printing/run',kind:'link'})
    ],edges:[flowEdge('a','b'),flowEdge('b','c'),flowEdge('c','d','bottom','top'),flowEdge('d','next','bottom','top')]
  },
  'printing/run': {
    height:888,note:'“允许建批”只决定谁生成批次。已有批次可直接查询；下载文件、开始打印、打印完成是三个不同动作。',
    lanes:[flowLane(56,400,'MAG 外厂','外厂操作员 / 计划','mag'),flowLane(456,208,'MAG 外厂','外厂打印人员','mag'),flowLane(664,208,'现场交接','后道 / 回厂负责人','site')],
    nodes:[
      flowNode('a',160,88,'mag','打开本厂批次页','工厂专属门户首页','打印批次','确认工厂与打印模式',0),
      flowNode('b',480,88,'mag','查找本批任务','门户 → 打印批次','按条件查询','已有批次 → 直接展开任务',1),
      decision('allow',524,288,'需要建新批？'),
      flowNode('create',800,280,'mag','有建批权限才生成','门户 → 打印批次','生成（工厂名）','无权限：由内部计划人员建批',1,{badge:'条件'}),
      flowNode('c',800,488,'mag','下载生产文件','展开批次 → 任务行','下载','按需生成 / 重新生成下载链接',2),
      flowNode('d',480,488,'mag','记录打印开始','打印批次 → 任务行','开始打印','状态 → 打印中',3),
      flowNode('e',160,488,'mag','记录打印完工','打印批次 → 任务行','打印完成','状态 → 已完成',4),
      flowNode('f',160,696,'site','移交后道或回厂','以工厂实际路线为准','转印 / 切割 / 回厂交接','承接系统、按钮与路线待核实',5,{pending:true})
    ],edges:[flowEdge('a','b'),flowEdge('b','allow','bottom','top'),flowEdge('allow','create','right','left',{label:'是'}),flowEdge('create','c','bottom','top',{label:'建批后查询'}),flowEdge('allow','c','bottom','top',{via:[[604,448],[924,448]],label:'否 · 已有批次',labelAt:[720,432]}),flowEdge('c','d','left','right'),flowEdge('d','e','left','right'),flowEdge('e','f','bottom','top',{pending:true})]
  },
  'cutting/run': {
    height:1064,note:'这里是已核实的 SRM 工序流转，尚未确认独立的“切割加工商外发单”闭环。整单扫码与逐件扫码请按节点区分。',
    lanes:[flowLane(56,192,'SRM 生产','打印 / 转印 / 切割','srm'),flowLane(248,192,'SRM 生产','缝制工位','srm'),flowLane(440,240,'SRM 生产','管理核对','srm'),flowLane(680,200,'SRM 物流','按订单路线交付','srm'),flowLane(880,168,'现场交付','承运商 / 下道','site')],
    nodes:[
      flowNode('a',160,88,'srm','取任务并备料','订单管理 → 生产列表 → 任务池','看图 → 打印任务单 / 二维码','打印 & 转印任务池',0),
      flowNode('b',480,88,'srm','打印转印完成','打印 & 转印任务池','打印转印完成 → 扫码','整任务推进 → 待切割',1),
      flowNode('c',800,88,'srm','切割完成','切割任务池','切割完成 → 扫码','整任务推进 → 待缝制',2),
      flowNode('d',800,280,'srm','缝制人员逐件接单','缝制任务池','缝制接单 → 扫码 → 完成','逐件唯一码；加入清单后提交',3),
      flowNode('e',480,280,'srm','逐件登记缝制完成','缝制任务池','缝制完成 → 扫唯一码','随后自动提交“生产完成”',4),
      decision('done',524,488,'已生产完成？'),
      flowNode('fix',800,472,'srm','必要时补记生产完成','生产列表 → 生产中','核对后 → 生产完成','仅限实际已完成且记录未完成',5,{badge:'按需'}),
      decision('route',524,736,'订单发货路线'),
      flowNode('warehouse',800,724,'srm','发往中转仓','物流管理 → 中转仓 → 待发货','生成发货单 → 确认发货','填写物流与必填运单号',6),
      flowNode('direct',160,724,'srm','走直发作业','物流管理 → 直发','质检 / 分拣 / 打包 / 称重','各工位详细按钮仍待核实',6,{pending:true}),
      flowNode('end',800,908,'site','交承运商 / 下道接收','后续物流链路','按对应发货与接收 SOP 交接','本页核实至上述发货入口',null,{kind:'terminal',h:112})
    ],edges:[flowEdge('a','b'),flowEdge('b','c'),flowEdge('c','d','bottom','top'),flowEdge('d','e','left','right'),flowEdge('e','done','bottom','top',{label:'检查两次操作结果'}),flowEdge('done','fix','right','left',{label:'否'}),flowEdge('done','route','bottom','top',{label:'是',labelAt:[626,648]}),flowEdge('fix','route','bottom','top',{via:[[924,648],[604,648]],label:'补记成功',labelAt:[800,632]}),flowEdge('route','warehouse','right','left',{label:'中转仓'}),flowEdge('route','direct','left','right',{pending:true,label:'直发'}),flowEdge('warehouse','end','bottom','top')]
  },
  'cutting/reset': {
    height:680,note:'按问题根因二选一。重置后回到排版或设计处理，再按生产路线继续；不要把两个重置按钮连续点击。',
    lanes:[flowLane(56,408,'SRM','切割 / 异常处理','srm'),flowLane(464,200,'后续处理','排版或设计环节','site')],
    nodes:[
      flowNode('a',160,192,'srm','定位问题和原任务','生产列表 → 切割任务池','核对任务 / 唯一码 / 原因','先确认问题属于排版还是设计',0),
      decision('why',524,204,'问题出在哪？'),
      flowNode('b',800,88,'srm','A · 回到排版','切割任务池','重置到排版 → 填码 / 备注','点击“完成”提交',1),
      flowNode('c',800,296,'srm','B · 回到设计','切割任务池','重置到设计 → 填码 / 原因','提交；最终按钮文案待核',2),
      flowNode('next',480,504,'site','修正后再进入生产','回到对应排版 / 设计环节','处理完成 → 按生产路线继续','点击查看正常工序流转 ↗',null,{href:'#cutting/run',kind:'link'})
    ],edges:[flowEdge('a','why'),flowEdge('why','b','top','left',{via:[[604,152]],label:'排版问题',labelAt:[710,136]}),flowEdge('why','c','bottom','left',{via:[[604,360]],label:'设计问题',labelAt:[710,344]}),flowEdge('b','next','right','right',{via:[[1080,152],[1080,568]]}),flowEdge('c','next','bottom','right',{via:[[924,568]]})]
  }
};
