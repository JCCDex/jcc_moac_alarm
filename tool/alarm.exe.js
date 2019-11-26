#!/usr/bin/env node

/**
 * 定时器预言机执行简单的利用crontab或者循环执行的shell
 * 遇到上个未结束的进程，检测超时状态，超时则清除
 * 1. 查询所有的定时任务，按照时间推算最近的一次执行时间
 * 2. 按照执行时间排序后，找出需要执行的定时任务，执行
 * 3. 清除执行环境，结束一次执行
 * 
 * 自动任务部署步骤说明:
 * 1. 先配置jcc_moac_tool相关钱包
 * 2. 在命令行注册，相关指令参考README.md
 * 3. 在服务器上运行无限循环脚本，类似：

#!/bin/bash

# 
exec 1>>/root/log/`basename -s .sh $0`.log 2>&1
cd ~/jcc_moac_alarm/tool/
while true
do
date '+%F %T'
echo "---------"
./alarm.exe.js --address 0x0eb661e24feb6847ebfe0b9c617df3d84ed594d8 --abi /root/cron/JccMoacAlarm.json --gas_limit 400000
echo 
sleep 120 
done

 */
const program = require('commander');
var utf8 = require('utf8');
const fs = require('fs');
const execSync = require('child_process').execSync;
var BigNumber = require('bignumber.js');

program
  .version('1.0.0')
  .option('--config <config file>', 'config file')
  .option('--address <contract address>', 'contract address')
  .option('--abi <abi file>', 'abi file path')
  .option('--gas_limit <gas limit>', 'gas limit')
  .parse(process.argv);

if (!(program.config)) {
  console.log('miss config file')
  process.exit();
}

if (!(program.address)) {
  console.log('miss contract address')
  process.exit();
}

if (!(program.abi)) {
  console.log('miss abi file')
  process.exit();
}

if (!(program.gas_limit)) {
  console.log('miss gas limit')
  process.exit();
}
// 准备命令行
let getCmd = function(_methodName, _parameters, _gas_limit) {
  let cmd = 'jcc_moac_tool --config ' + program.config + ' --abi ' + program.abi;
  cmd = cmd + ' --contractAddr "' + program.address + '" --method "' + _methodName + '"';
  if (!!_parameters) {
    cmd = cmd + ' --parameters \'' + _parameters + '\'';
  }
  if (!!_gas_limit) {
    cmd = cmd + ' --gas_limit ' + _gas_limit;
  }

  return cmd;
}
let getAlarmCount = function(result) {
  let pos = result.indexOf('result:');
  let str = result.substr(pos + 7);
  let hex = JSON.parse(str)[0]._hex;

  return BigNumber(hex).toNumber();
}
let parseAlarm = function(raw) {
  return {
    contractAddr: raw[0],
    creatorAddr: raw[1],
    idx: BigNumber(raw[2]._hex).toNumber(),
    alarmType: BigNumber(raw[3]._hex).toNumber(),
    begin: BigNumber(raw[4]._hex).toNumber(),
    peroid: BigNumber(raw[5]._hex).toNumber()
  };
}

let getAlarmList = function(result) {
  let pos = result.indexOf('result:');
  let str = result.substr(pos + 7);
  let raw = JSON.parse(str)[0];
  let list = [];
  for (let i = 0; i < raw.length; i++) {
    list[i] = parseAlarm(raw[i]);
  }

  return list;
}
// 查询所有合约提醒
let getAlarmCountCmd = getCmd('getAlarmCount');
let count = getAlarmCount(execSync(getAlarmCountCmd).toString());

console.log('定时任务数量:', count);

let getAlarmListCmd = getCmd('getAlarmList', "0," + count);
let all = getAlarmList(execSync(getAlarmListCmd).toString());

for (var i = 0; i < all.length; i++) {
  let _now = Math.round(Date.now() / 1000);
  // 如果是一次性的任务
  if (all[i].alarmType == 0) {
    // 没有到时间
    if (all[i].begin + all[i].peroid > _now) {
      continue;
    }

    // 备注：重复的发送一次性任务会怎么样？第二个会失败，第一个成功后，会删除掉这个定时任务
    let taskCmd = getCmd('execute', '"' + all[i].contractAddr.toLowerCase() + '"', program.gas_limit);
    let hash = execSync(taskCmd);

    console.log('一次性任务:' + all[i].contractAddr.toLowerCase() + ' ', hash.toString());

    continue;
  }

  // 周期性任务，粒度尽量保证5分钟以上，PoW共识速度不允许太小的粒度
  var gap = (_now - all[i].begin) % all[i].peroid;
  console.log(gap)
  if (gap > 120) { continue; }

  let taskCmd = getCmd('execute', '"' + all[i].contractAddr.toLowerCase() + '"', program.gas_limit);
  let hash = execSync(taskCmd);

  console.log('周期性任务:' + all[i].contractAddr.toLowerCase() + ' 周期:' + all[i].peroid + '秒 ', hash.toString());
}

