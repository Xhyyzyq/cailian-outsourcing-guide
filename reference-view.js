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

