#!/usr/local/bin/node

//  ================================================================================
//  Function
//  ================================================================================
//  yyyymmdd
Date.prototype.getFullDate = function () {
  return this.getFullYear().toString() +
    ("0" + (this.getMonth() + 1).toString()).slice(-2) +
    ("0" + this.getDate().toString()).slice(-2);
}

//  yyyy/mm/dd
Date.prototype.getSlashDate = function () {
  return this.getFullYear().toString() + "/" +
    ("0" + (this.getMonth() + 1).toString()).slice(-2) + "/" +
    ("0" + this.getDate().toString()).slice(-2);
}

//  StringBuilder
var StringBuilder = function (text) {
  this.buffer = [];
  this.append = function (text) { this.buffer.push(text); return this; };
  this.toString = function () { return this.buffer.join(""); };
  if (text) { this.append(text); }
}

//  ================================================================================
//  Declaire
//  ================================================================================
var fs = require('fs');
var execSync = require('child_process').execSync;

//  ================================================================================
//  Parameter
//  ================================================================================
var dlURL = "http://nami.jp/ipv4bycc/cidr.txt.gz";
var outputDir = __dirname + "/cidr";
var outputFile = outputDir + "/cidr_" + new Date().getFullDate() + ".txt.gz";
var extractFile = outputDir + "/cidr.txt";

var iptables_preFile = outputDir + "/iptables_pre";
var iptables_sufFile = outputDir + "/iptables_suf";
var iptables_allFile = outputDir + "/iptables_" + new Date().getFullDate();

//  ================================================================================
//  Main
//  ================================================================================
//  ダウンロードして解凍。保存先ディレクトリが無ければ作成
try {
  execSync("wget -nc -O " + outputFile + " " + dlURL);
} catch (e) {
  try {
    fs.mkdirSync(outputDir);
    execSync("wget -O " + outputFile + " " + dlURL);
  } catch (e) { }
}
execSync("gunzip -c " + outputFile + " > " + extractFile);

//  新iptables用ファイルを生成
execSync("cp -f " + iptables_preFile + " " + iptables_allFile);
var text = fs.readFileSync(extractFile, "utf8");
var textArray = text.split(/\r?\n/);
var sb = new StringBuilder();
for (var index in textArray) {
  if (textArray[index].startsWith("JP")) {
    sb.append("-A JPFILTER -s " + textArray[index].replace(/^JP\s+/, "") + " -j ACCEPT\n");
  }
}
fs.appendFileSync(iptables_allFile, sb.toString(), "utf8");
execSync("cat " + iptables_sufFile + " >> " + iptables_allFile);

//  iptablesに反映
execSync("iptables-restore < " + iptables_allFile);
