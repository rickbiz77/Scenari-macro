import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const LAST_UPDATE = "02/05/2026";

function getISOWeek(s){
  const [d,m,y]=s.split("/").map(Number);
  const dt=new Date(y,m-1,d);
  const j4=new Date(y,0,4);
  const w1=new Date(j4); w1.setDate(j4.getDate()-((j4.getDay()+6)%7));
  return Math.floor((dt-w1)/(7*864e5))+1;
}
const CURRENT_WEEK=getISOWeek(LAST_UPDATE);

const MATRIX=[
  {name:"GOLDILOCKS",     active:false,color:"#10B981",v:[-0.05,4.40,-3.24,-3.73,-1.13,44.30,33.85,84.54,77.53]},
  {name:"RECESSIONE",     active:false,color:"#6366F1",v:[-0.05,0.87,-3.17, 3.61, 4.84,15.06,30.13,30.24,37.27]},
  {name:"STAGFLAZIONE",   active:true, color:"#F59E0B",v:[ 0.35,0.15, 1.21,13.82,16.64,33.70,39.07,44.16,82.90]},
  {name:"REFLAZIONE",     active:false,color:"#0EA5E9",v:[ 0.32,3.09,-0.30, 3.65, 6.61,33.81,27.47,46.62,39.79]},
  {name:"DISINFLAZIONE",  active:false,color:"#8B5CF6",v:[-0.12,2.60,-3.80,-1.35, 1.58,23.20,31.94,50.53,48.43]},
  {name:"DOLLAR WEAKNESS",active:false,color:"#EC4899",v:[-0.38,2.25,-0.55, 6.49,10.78,35.02,41.18,49.44,56.19]},
  {name:"DEFLAZIONE",     active:false,color:"#64748B",v:[ 0.34,0.11,-1.59, 2.60, 1.25, 4.35, 9.52, 4.50, 4.21]},
  {name:"DW +BTC",        active:false,color:"#F97316",v:[-1.18,2.36,-3.87,-5.02,-4.47,22.93,35.79, null, null]},
  {name:"DEBASEMENT +BTC",active:false,color:"#F97316",v:[-1.12,4.68,-4.83,-4.88, 2.48,67.26,58.25, null, null]},
  {name:"DEBASEMENT",     active:true, color:"#EF4444",v:[-0.75,4.55,-3.57, 1.09,12.20,72.17,60.67, null, null]},
];
const MCOLS=["1G","1S","1M","3M","6M","1A","2A","3A","5A"];

const SCENARIOS=[
  {id:"goldilocks",name:"GOLDILOCKS",color:"#10B981",active:false,desc:"Crescita + inflazione moderata",
   avg:{w:0.21,m:16.03,q:4.33,s:7.25,y:42.28,y2:49.53,y3:100.24,y5:95.85},
   etfs:[
    {t:"QQQ", n:"Invesco QQQ Trust",        p:659.57,w:0.68,  m:18.14, q:4.79,  s:4.85,  y:38.70,  y2:52.41,  y3:104.71, y5:95.14},
    {t:"XLK", n:"Technology Select SPDR",   p:158.51,w:0.27,  m:24.32, q:7.93,  s:5.43,  y:51.61,  y2:57.96,  y3:110.06, y5:126.93},
    {t:"XLY", n:"Cons Disc Select SPDR",    p:116.70,w:-1.88, m:10.45, q:-3.70, s:-2.73, y:17.24,  y2:29.67,  y3:59.43,  y5:30.45},
    {t:"IEF", n:"iShares 7-10Y Treasury",   p:94.77, w:-0.79, m:-0.52, q:-1.28, s:-2.15, y:-1.20,  y2:3.17,   y3:-3.61,  y5:-16.86},
    {t:"SMH", n:"VanEck Semiconductor ETF", p:496.66,w:4.16,  m:37.00, q:18.95, s:36.81, y:136.18, y2:127.43, y3:298.70, y5:308.77},
    {t:"SPY", n:"SPDR S&P 500",             p:709.89,w:-0.19, m:12.33, q:2.28,  s:4.08,  y:28.07,  y2:39.18,  y3:70.85,  y5:70.12},
    {t:"URTH",n:"iShares MSCI World",       p:193.32,w:-0.82, m:10.51, q:1.32,  s:4.48,  y:25.39,  y2:36.88,  y3:61.54,  y5:56.40},
   ]},
  {id:"recession",name:"RECESSIONE",color:"#6366F1",active:false,desc:"Crescita negativa",
   avg:{w:-1.02,m:-0.28,q:-3.40,s:2.79,y:8.22,y2:22.77,y3:25.81,y5:30.25},
   etfs:[
    {t:"TLT",n:"iShares 20+ Year Treasury", p:85.67, w:-1.23, m:-1.28, q:-2.23,  s:-5.12, y:-5.02,  y2:-3.72,  y3:-16.93, y5:-38.21},
    {t:"SHY",n:"iShares 1-3Y Treasury",     p:82.38, w:-0.17, m:-0.15, q:-0.65,  s:-0.72, y:-0.76,  y2:1.39,   y3:0.70,   y5:-4.52},
    {t:"XLU",n:"Utilities Select SPDR",     p:45.63, w:1.69,  m:-0.63, q:5.31,   s:2.42,  y:15.08,  y2:36.01,  y3:32.07,  y5:36.78},
    {t:"XLP",n:"Cons Staples Select SPDR",  p:82.65, w:0.66,  m:0.94,  q:0.63,   s:8.35,  y:1.74,   y2:8.99,   y3:6.65,   y5:18.78},
    {t:"GLD",n:"SPDR Gold Trust",           p:416.10,w:-4.40, m:0.37,  q:-16.09, s:13.03, y:35.95,  y2:92.48,  y3:126.18, y5:151.18},
    {t:"XLV",n:"Health Care Select SPDR",   p:142.51,w:-2.64, m:-0.91, q:-7.35,  s:-1.21, y:2.32,   y2:1.48,   y3:6.18,   y5:17.46},
   ]},
  {id:"stagflation",name:"STAGFLAZIONE",color:"#F59E0B",active:true,desc:"Crescita lenta + inflazione alta",
   avg:{w:-1.28,m:3.84,q:-0.26,s:18.96,y:52.24,y2:49.81,y3:60.79,y5:74.06},
   etfs:[
    {t:"GLD", n:"SPDR Gold Trust",          p:416.10,w:-4.40, m:0.37,  q:-16.09, s:13.03, y:35.95,  y2:92.48,  y3:126.18, y5:151.18},
    {t:"DBC", n:"Invesco DB Commodity",     p:30.94, w:4.85,  m:5.74,  q:22.29,  s:35.23, y:47.61,  y2:30.88,  y3:32.45,  y5:72.75},
    {t:"XLE", n:"Energy Select SPDR",       p:58.57, w:3.59,  m:-5.47, q:15.96,  s:32.90, y:41.58,  y2:21.51,  y3:39.15,  y5:137.13},
    {t:"TIP", n:"iShares TIPS Bond",        p:111.37,w:-0.02, m:0.92,  q:0.77,   s:-0.01, y:0.89,   y2:5.03,   y3:2.46,   y5:-12.30},
    {t:"XLU", n:"Utilities Select SPDR",    p:45.63, w:1.69,  m:-0.63, q:5.31,   s:2.42,  y:15.08,  y2:36.01,  y3:32.07,  y5:36.78},
    {t:"SLV", n:"iShares Silver Trust",     p:64.47, w:-8.38, m:1.50,  q:-38.93, s:46.49, y:116.12, y2:159.65, y3:181.65, y5:168.51},
    {t:"XLB", n:"Materials Select SPDR",    p:50.91, w:-1.78, m:3.71,  q:1.82,   s:18.84, y:22.00,  y2:12.78,  y3:26.45,  y5:22.62},
    {t:"MOO", n:"VanEck Agribusiness",      p:81.84, w:-1.53, m:-1.76, q:0.99,   s:14.85, y:18.97,  y2:12.62,  y3:-4.31,  y5:-10.47},
    {t:"DBA", n:"Invesco DB Agriculture",   p:28.08, w:3.50,  m:3.54,  q:8.54,   s:6.48,  y:4.08,   y2:11.87,  y3:35.46,  y5:52.61},
    {t:"URA", n:"Global X Uranium ETF",     p:52.99, w:-8.21, m:17.00, q:-10.69, s:-3.86, y:110.86, y2:74.42,  y3:168.71, y5:170.22},
    {t:"REMX",n:"VanEck Rare Earth ETF",    p:100.25,w:-3.42, m:17.28, q:7.18,   s:42.20, y:161.48, y2:90.70,  y3:28.39,  y5:25.61},
   ]},
  {id:"reflation",name:"REFLAZIONE",color:"#0EA5E9",active:false,desc:"Ripresa + inflazione in aumento",
   avg:{w:-2.08,m:8.20,q:-0.63,s:10.74,y:42.62,y2:39.77,y3:66.42,y5:63.96},
   etfs:[
    {t:"XLI", n:"Industrial Select SPDR",   p:169.47, w:-0.92, m:8.21,  q:2.18,   s:9.29,  y:30.08,  y2:37.24,  y3:68.56,  y5:66.26},
    {t:"XLF", n:"Financial Select SPDR",    p:51.84,  w:-0.71, m:7.20,  q:-3.19,  s:-1.01, y:6.51,   y2:27.18,  y3:56.71,  y5:42.97},
    {t:"IWM", n:"iShares Russell 2000",     p:271.05, w:-1.96, m:13.12, q:2.92,   s:10.08, y:38.23,  y2:35.55,  y3:54.62,  y5:20.53},
    {t:"EEM", n:"iShares MSCI Emerging",    p:62.63,  w:-1.18, m:14.39, q:3.62,   s:13.25, y:43.48,  y2:50.66,  y3:60.59,  y5:16.02},
    {t:"DBC", n:"Invesco DB Commodity",     p:30.94,  w:4.85,  m:5.74,  q:22.29,  s:35.23, y:47.61,  y2:30.88,  y3:32.45,  y5:72.75},
    {t:"VTV", n:"Vanguard Value ETF",       p:203.00, w:0.06,  m:5.17,  q:1.71,   s:9.28,  y:22.10,  y2:28.06,  y3:44.31,  y5:49.29},
    {t:"ITA", n:"iShares US Aerospace",     p:212.30, w:-3.13, m:0.72,  q:-8.80,  s:-1.62, y:35.72,  y2:61.90,  y3:85.82,  y5:99.46},
    {t:"XLB", n:"Materials Select SPDR",    p:50.91,  w:-1.78, m:3.71,  q:1.82,   s:18.84, y:22.00,  y2:12.78,  y3:26.45,  y5:22.62},
    {t:"SX5E",n:"Euro Stoxx 50",            p:5816.48,w:-1.52, m:4.96,  q:-1.28,  s:2.73,  y:12.68,  y2:16.77,  y3:35.43,  y5:46.34},
    {t:"COPX",n:"Global X Copper Miners",   p:77.78,  w:-8.39, m:9.94,  q:-17.46, s:25.94, y:99.54,  y2:61.97,  y3:96.91,  y5:97.11},
    {t:"URA", n:"Global X Uranium ETF",     p:52.99,  w:-8.21, m:17.00, q:-10.69, s:-3.86, y:110.86, y2:74.42,  y3:168.71, y5:170.22},
   ]},
  {id:"disinflation",name:"DISINFLAZIONE",color:"#8B5CF6",active:false,desc:"Soft landing - inflazione in calo",
   avg:{w:-0.92,m:5.41,q:-1.10,s:5.29,y:19.82,y2:33.83,y3:52.27,y5:46.34},
   etfs:[
    {t:"TLT", n:"iShares 20+ Year Treasury",p:85.67, w:-1.23, m:-1.28, q:-2.23,  s:-5.12, y:-5.02,  y2:-3.72,  y3:-16.93, y5:-38.21},
    {t:"LQD", n:"iShares Corp Bond",        p:108.71,w:-1.01, m:0.37,  q:-1.78,  s:-2.27, y:0.20,   y2:2.97,   y3:0.85,   y5:-17.11},
    {t:"QQQ", n:"Invesco QQQ Trust",        p:659.57,w:0.68,  m:18.14, q:4.79,   s:4.85,  y:38.70,  y2:52.41,  y3:104.71, y5:95.14},
    {t:"VTI", n:"Vanguard Total Stock Mkt", p:349.37,w:-0.53, m:12.09, q:2.07,   s:4.16,  y:28.13,  y2:38.22,  y3:69.43,  y5:60.93},
    {t:"GLD", n:"SPDR Gold Trust",          p:416.10,w:-4.40, m:0.37,  q:-16.09, s:13.03, y:35.95,  y2:92.48,  y3:126.18, y5:151.18},
    {t:"SCHD",n:"Schwab US Dividend Equity",p:31.32, w:1.00,  m:2.76,  q:6.64,   s:17.08, y:20.97,  y2:20.60,  y3:29.37,  y5:26.09},
   ]},
  {id:"dollarweakness",name:"DOLLAR WEAKNESS",color:"#EC4899",active:false,desc:"Dollaro debole + riequilibrio globale",
   avg:{w:-0.71,m:6.03,q:1.30,s:14.26,y:31.43,y2:44.71,y3:55.15,y5:55.62},
   etfs:[
    {t:"EEM", n:"iShares MSCI Emerging",    p:62.63, w:-1.18, m:14.39, q:3.62,   s:13.25, y:43.48,  y2:50.66,  y3:60.59,  y5:16.02},
    {t:"FXF", n:"Invesco CurrencyShares CHF",p:111.38,w:-0.93,m:0.90,  q:-3.51,  s:1.29,  y:3.41,   y2:13.99,  y3:12.09,  y5:12.14},
    {t:"GLD", n:"SPDR Gold Trust",          p:416.10,w:-4.40, m:0.37,  q:-16.09, s:13.03, y:35.95,  y2:92.48,  y3:126.18, y5:151.18},
    {t:"IXUS",n:"iShares Core MSCI Total Intl",p:91.06,w:-1.89,m:8.74, q:0.19,   s:8.47,  y:26.68,  y2:35.53,  y3:44.47,  y5:26.00},
    {t:"DBC", n:"Invesco DB Commodity",     p:30.94, w:4.85,  m:5.74,  q:22.29,  s:35.23, y:47.61,  y2:30.88,  y3:32.45,  y5:72.75},
   ]},
  {id:"deflation",name:"DEFLAZIONE",color:"#64748B",active:false,desc:"Prezzi in calo + contrazione",
   avg:{w:0.20,m:-0.22,q:0.62,s:0.96,y:2.19,y2:8.50,y3:4.54,y5:2.60},
   etfs:[
    {t:"TLT",n:"iShares 20+ Year Treasury", p:85.67, w:-1.23, m:-1.28, q:-2.23,  s:-5.12, y:-5.02,  y2:-3.72,  y3:-16.93, y5:-38.21},
    {t:"BIL",n:"SPDR Bloomberg 1-3M T-Bill",p:91.64, w:0.08,  m:0.00,  q:0.01,   s:-0.13, y:-0.08,  y2:-0.15,  y3:0.23,   y5:0.15},
    {t:"SHY",n:"iShares 1-3Y Treasury",     p:82.38, w:-0.17, m:-0.15, q:-0.65,  s:-0.72, y:-0.76,  y2:1.39,   y3:0.70,   y5:-4.52},
    {t:"XLP",n:"Cons Staples Select SPDR",  p:82.65, w:0.66,  m:0.94,  q:0.63,   s:8.35,  y:1.74,   y2:8.99,   y3:6.65,   y5:18.78},
    {t:"XLU",n:"Utilities Select SPDR",     p:45.63, w:1.69,  m:-0.63, q:5.31,   s:2.42,  y:15.08,  y2:36.01,  y3:32.07,  y5:36.78},
   ]},
  {id:"dollarweaknessbtc",name:"DOLLAR WEAKNESS +BTC",color:"#F97316",active:false,desc:"Dollaro debole + Bitcoin",
   avg:{w:-2.59,m:7.55,q:-5.21,s:0.92,y:17.66,y2:42.35,y3:null,y5:null},
   etfs:[
    {t:"EEM", n:"iShares MSCI Emerging",    p:62.63, w:-1.18, m:14.39, q:3.62,   s:13.25, y:43.48,  y2:50.66,  y3:60.59,  y5:16.02},
    {t:"FXF", n:"Invesco CurrencyShares CHF",p:111.38,w:-0.93,m:0.90,  q:-3.51,  s:1.29,  y:3.41,   y2:13.99,  y3:12.09,  y5:12.14},
    {t:"GLD", n:"SPDR Gold Trust",          p:416.10,w:-4.40, m:0.37,  q:-16.09, s:13.03, y:35.95,  y2:92.48,  y3:126.18, y5:151.18},
    {t:"IXUS",n:"iShares Core MSCI Total Intl",p:91.06,w:-1.89,m:8.74, q:0.19,   s:8.47,  y:26.68,  y2:35.53,  y3:44.47,  y5:26.00},
    {t:"IBIT",n:"iShares Bitcoin Trust ETF",p:42.71, w:-4.56, m:13.35, q:-10.27, s:-31.44,y:-21.23, y2:19.07,  y3:null,   y5:null},
   ]},
  {id:"debasementbtc",name:"DEBASEMENT +BTC",color:"#F97316",active:false,desc:"Debasement aggressivo con Bitcoin",
   avg:{w:-6.22,m:7.96,q:-13.72,s:19.74,y:81.09,y2:97.67,y3:null,y5:null},
   etfs:[
    {t:"GLD", n:"SPDR Gold Trust",          p:416.10,w:-4.40, m:0.37,  q:-16.09, s:13.03, y:35.95,  y2:92.48,  y3:126.18, y5:151.18},
    {t:"XME", n:"SPDR Metals & Mining",     p:114.83,w:-5.73, m:10.99, q:-9.42,  s:18.88, y:101.88, y2:87.05,  y3:135.26, y5:183.81},
    {t:"COPX",n:"Global X Copper Miners",   p:77.78, w:-8.39, m:9.94,  q:-17.46, s:25.94, y:99.54,  y2:61.97,  y3:96.91,  y5:97.11},
    {t:"EEM", n:"iShares MSCI Emerging",    p:62.63, w:-1.18, m:14.39, q:3.62,   s:13.25, y:43.48,  y2:50.66,  y3:60.59,  y5:16.02},
    {t:"IBIT",n:"iShares Bitcoin Trust ETF",p:42.71, w:-4.56, m:13.35, q:-10.27, s:-31.44,y:-21.23, y2:19.07,  y3:null,   y5:null},
    {t:"SLV", n:"iShares Silver Trust",     p:64.47, w:-8.38, m:1.50,  q:-38.93, s:46.49, y:116.12, y2:159.65, y3:181.65, y5:168.51},
    {t:"GDX", n:"VanEck Gold Miners ETF",   p:86.28, w:-8.68, m:0.57,  q:-20.10, s:19.73, y:77.97,  y2:148.14, y3:158.25, y5:151.11},
    {t:"SIL", n:"Global X Silver Miners",   p:86.25, w:-11.20,m:3.23,  q:-22.06, s:29.58, y:114.61, y2:169.28, y3:192.37, y5:106.93},
    {t:"REMX",n:"VanEck Rare Earth ETF",    p:100.25,w:-3.42, m:17.28, q:7.18,   s:42.20, y:161.48, y2:90.70,  y3:28.39,  y5:25.61},
   ]},
  {id:"debasement",name:"DEBASEMENT",color:"#EF4444",active:true,desc:"Svalutazione monetaria strutturale",
   avg:{w:-5.70,m:6.50,q:-12.49,s:23.43,y:83.88,y2:96.56,y3:110.48,y5:null},
   etfs:[
    {t:"GLD", n:"SPDR Gold Trust",          p:416.10,w:-4.40, m:0.37,  q:-16.09, s:13.03, y:35.95,  y2:92.48,  y3:126.18, y5:151.18},
    {t:"XME", n:"SPDR Metals & Mining",     p:114.83,w:-5.73, m:10.99, q:-9.42,  s:18.88, y:101.88, y2:87.05,  y3:135.26, y5:183.81},
    {t:"COPX",n:"Global X Copper Miners",   p:77.78, w:-8.39, m:9.94,  q:-17.46, s:25.94, y:99.54,  y2:61.97,  y3:96.91,  y5:97.11},
    {t:"EEM", n:"iShares MSCI Emerging",    p:62.63, w:-1.18, m:14.39, q:3.62,   s:13.25, y:43.48,  y2:50.66,  y3:60.59,  y5:16.02},
    {t:"VDST",n:"Vanguard US Treasury 0-1Y",p:58.78, w:0.05,  m:0.26,  q:0.81,   s:1.77,  y:3.93,   y2:9.09,   y3:14.69,  y5:null},
    {t:"SLV", n:"iShares Silver Trust",     p:64.47, w:-8.38, m:1.50,  q:-38.93, s:46.49, y:116.12, y2:159.65, y3:181.65, y5:168.51},
    {t:"GDX", n:"VanEck Gold Miners ETF",   p:86.28, w:-8.68, m:0.57,  q:-20.10, s:19.73, y:77.97,  y2:148.14, y3:158.25, y5:151.11},
    {t:"SIL", n:"Global X Silver Miners",   p:86.25, w:-11.20,m:3.23,  q:-22.06, s:29.58, y:114.61, y2:169.28, y3:192.37, y5:106.93},
    {t:"REMX",n:"VanEck Rare Earth ETF",    p:100.25,w:-3.42, m:17.28, q:7.18,   s:42.20, y:161.48, y2:90.70,  y3:28.39,  y5:25.61},
   ]},
];
const ETF_NAZIONALI=[
  {t:"EEM", n:"iShares MSCI Emerging Markets",    p:62.63,  g:-0.57,w:-1.18, m:14.39, q:3.62,   s:13.25,  y:43.48,  y2:50.66,  y3:60.59,  y5:16.02},
  {t:"MCHI",n:"iShares MSCI China ETF",           p:56.87,  g:0.19, w:-2.45, m:3.49,  q:-11.46, s:-10.54, y:10.04,  y2:32.97,  y3:19.65,  y5:-30.63},
  {t:"EWS", n:"iShares MSCI Singapore ETF",       p:28.16,  g:-0.98,w:-2.93, m:1.84,  q:-2.32,  s:-1.02,  y:16.51,  y2:47.82,  y3:41.15,  y5:17.68},
  {t:"EWT", n:"iShares MSCI Taiwan ETF",          p:87.06,  g:-0.21,w:1.01,  m:26.25, q:24.67,  s:30.62,  y:84.64,  y2:81.72,  y3:99.22,  y5:34.89},
  {t:"EWY", n:"iShares MSCI South Korea ETF",     p:153.81, g:-0.36,w:-1.28, m:32.11, q:23.54,  s:58.57,  y:174.17, y2:140.25, y3:155.20, y5:69.84},
  {t:"EWC", n:"iShares MSCI Canada ETF",          p:56.87,  g:-1.03,w:-1.93, m:6.46,  q:0.60,   s:12.08,  y:33.97,  y2:50.93,  y3:61.84,  y5:59.70},
  {t:"DXJ", n:"WisdomTree Japan Hedged Equity",   p:160.74, g:-0.80,w:-0.53, m:3.98,  q:6.09,   s:18.77,  y:47.47,  y2:49.28,  y3:118.01, y5:170.15},
  {t:"EWW", n:"iShares MSCI Mexico ETF",          p:75.46,  g:-1.07,w:-3.66, m:3.71,  q:-3.81,  s:13.42,  y:33.75,  y2:12.21,  y3:23.54,  y5:65.99},
  {t:"VEA", n:"FTSE Developed ex-US",             p:66.97,  g:-1.12,w:-2.02, m:7.96,  q:-0.15,  s:9.82,   y:26.48,  y2:36.26,  y3:44.58,  y5:32.33},
  {t:"DVYA",n:"iShares Asia/Pacific Dividend ETF",p:49.11,  g:-0.41,w:-1.60, m:4.00,  q:-0.61,  s:13.79,  y:35.66,  y2:33.89,  y3:44.40,  y5:19.96},
  {t:"EWA", n:"iShares MSCI Australia ETF",       p:28.54,  g:-1.82,w:-3.02, m:5.16,  q:0.42,   s:6.61,   y:16.25,  y2:19.26,  y3:23.71,  y5:10.28},
  {t:"EPOL",n:"iShares MSCI Poland ETF",          p:37.79,  g:-1.10,w:-4.52, m:9.09,  q:-1.54,  s:12.10,  y:24.72,  y2:56.42,  y3:115.45, y5:90.47},
  {t:"GREK",n:"Global X MSCI Greece ETF",         p:68.76,  g:-0.64,w:-1.77, m:13.20, q:-9.07,  s:10.51,  y:37.55,  y2:68.45,  y3:118.77, y5:141.09},
  {t:"ILF", n:"iShares Latin America 40 ETF",     p:35.64,  g:-1.98,w:-4.32, m:4.76,  q:-2.81,  s:21.14,  y:41.99,  y2:27.19,  y3:45.65,  y5:25.58},
  {t:"EWZ", n:"iShares MSCI Brazil ETF",          p:38.68,  g:-2.54,w:-4.71, m:5.19,  q:1.47,   s:24.09,  y:41.37,  y2:21.83,  y3:37.95,  y5:8.77},
  {t:"EWI", n:"iShares MSCI Italy ETF",           p:56.58,  g:-1.70,w:-1.60, m:10.27, q:0.73,   s:9.21,   y:26.66,  y2:51.61,  y3:78.49,  y5:78.99},
  {t:"EZA", n:"iShares MSCI South Africa ETF",    p:66.25,  g:-3.24,w:-7.07, m:3.16,  q:-16.75, s:3.89,   y:34.82,  y2:61.23,  y3:55.30,  y5:34.30},
  {t:"EWP", n:"iShares MSCI Spain ETF",           p:55.47,  g:-1.11,w:-2.31, m:6.22,  q:-1.58,  s:10.56,  y:34.90,  y2:71.57,  y3:94.02,  y5:91.80},
  {t:"TUR", n:"iShares MSCI Turkey ETF",          p:41.90,  g:-1.03,w:-1.41, m:12.18, q:0.77,   s:22.69,  y:34.38,  y2:4.05,   y3:35.82,  y5:79.75},
  {t:"THD", n:"iShares MSCI Thailand ETF",        p:69.01,  g:-0.32,w:-1.90, m:3.08,  q:7.91,   s:13.69,  y:28.68,  y2:19.27,  y3:-2.04,  y5:-14.55},
  {t:"KSA", n:"iShares MSCI Saudi Arabia ETF",    p:39.11,  g:-0.18,w:-1.09, m:0.82,  q:-1.91,  s:-2.90,  y:-4.00,  y2:-9.59,  y3:-4.56,  y5:3.52},
  {t:"EWL", n:"iShares MSCI Switzerland ETF",     p:59.73,  g:-1.68,w:-2.29, m:3.84,  q:-4.00,  s:7.89,   y:11.29,  y2:29.62,  y3:24.20,  y5:29.03},
  {t:"EWQ", n:"iShares MSCI France ETF",          p:44.43,  g:-1.02,w:-2.03, m:5.86,  q:-3.03,  s:0.34,   y:8.52,   y2:9.43,   y3:12.25,  y5:20.15},
  {t:"EWG", n:"iShares MSCI Germany ETF",         p:41.24,  g:-1.55,w:-2.55, m:7.48,  q:-5.06,  s:1.25,   y:3.96,   y2:33.12,  y3:40.13,  y5:19.12},
  {t:"INDY",n:"iShares India 50 ETF",             p:43.32,  g:-0.30,w:-2.06, m:5.74,  q:-7.91,  s:-18.23, y:-18.00, y2:-14.81, y3:1.19,   y5:-0.35},
  {t:"EWN", n:"iShares MSCI Netherlands ETF",     p:60.92,  g:-1.21,w:-3.53, m:10.10, q:-4.03,  s:3.61,   y:24.53,  y2:24.94,  y3:44.16,  y5:26.73},
];


// ── MOMENTUM ──────────────────────────────────────────────────────
const WEIGHTS={w:0.25,m:0.40,q:0.20,s:0.10,y:0.05};
function calcMomScore(etf){let s=0,tw=0;Object.entries(WEIGHTS).forEach(([k,w])=>{if(etf[k]!=null){s+=etf[k]*w;tw+=w;}});return tw>0?s:null;}
function calcScenarioMom(sc){const ss=sc.etfs.map(e=>calcMomScore(e)).filter(v=>v!=null);return ss.length?ss.reduce((a,b)=>a+b,0)/ss.length:null;}
function normArr(score,all){const vals=all.map(s=>s.raw).filter(v=>v!=null);const mn=Math.min(...vals),mx=Math.max(...vals);if(mx===mn)return 50;return((score-mn)/(mx-mn))*100;}
function calcAllScores(){
  const raw=SCENARIOS.map(s=>({id:s.id,raw:calcScenarioMom(s)}));
  const srt=[...raw].sort((a,b)=>(a.raw??-999)-(b.raw??-999));
  const n=srt.length;const rk={};srt.forEach((s,i)=>{rk[s.id]=(i/(n-1))*100;});
  return raw.map(s=>({...s,rank:rk[s.id],composite:s.raw!=null?(rk[s.id]*0.75+normArr(s.raw,raw)*0.25):null}));
}
function calcAllEtfScores(){
  const seen=new Set(),all=[];SCENARIOS.forEach(s=>s.etfs.forEach(e=>{if(!seen.has(e.t)){seen.add(e.t);all.push(e);}}));
  const raw=all.map(e=>({t:e.t,raw:calcMomScore(e),etf:e}));
  const srt=[...raw].sort((a,b)=>(a.raw??-999)-(b.raw??-999));const n=srt.length;const rk={};srt.forEach((s,i)=>{rk[s.t]=(i/(n-1))*100;});
  const vals=raw.map(s=>s.raw).filter(v=>v!=null);const mn=Math.min(...vals),mx=Math.max(...vals);
  return raw.map(s=>({...s,rank:rk[s.t],composite:s.raw!=null?(rk[s.t]*0.75+((s.raw-mn)/(mx-mn||1))*100*0.25):null}));
}
// Final Score con momentum meta-segnale
// Se momentum score è in trend rialzista per 3+ settimane → aumenta peso leading
function calcFinalScore(momentumComposite, leadingScore, scenarioId, history){
  if(leadingScore===null||leadingScore===undefined) return momentumComposite;
  // Base: 70% Leading + 30% Momentum
  // Modulazione: se momentum in salita 3 sett → 60/40, se in calo → 80/20
  let wLead = 0.70;
  if(history && history.length >= 3){
    const sorted=[...history].sort((a,b)=>a.week-b.week);
    const last3=sorted.slice(-3).map(h=>h.scores[scenarioId]).filter(v=>v!=null);
    if(last3.length===3){
      const rising=last3[2]>last3[1]&&last3[1]>last3[0];
      const falling=last3[2]<last3[1]&&last3[1]<last3[0];
      if(rising)  wLead=0.60; // momentum confermato → più peso ai dati storici
      if(falling) wLead=0.80; // momentum contraddict → più peso ai leading
    }
  }
  return leadingScore * wLead + momentumComposite * (1-wLead);
}
function calcAvgMom(e){
  // Media ponderata performance settimanale (valori già in %)
  // 1S×40% + (1M÷4)×30% + (3M÷13)×20% + (6M÷26)×10%
  const entries=[
    {v:e.w,                              w:0.40},
    {v:e.m!=null?e.m/4:null,             w:0.30},
    {v:e.q!=null?e.q/13:null,            w:0.20},
    {v:e.s!=null?e.s/26:null,            w:0.10},
  ].filter(x=>x.v!=null);
  if(entries.length===0)return null;
  const tw=entries.reduce((a,x)=>a+x.w,0);
  if(tw===0)return null;
  return entries.reduce((a,x)=>a+x.v*x.w,0)/tw;
}

const scoreArrow=s=>s>=70?{a:'▲',c:'#10B981'}:s>=40?{a:'→',c:'#F59E0B'}:{a:'▼',c:'#EF4444'};
function AvgMomPill({v,size="sm"}){
  if(v===null||v===undefined)return null;
  const c=v>=0?"#10B981":"#EF4444";
  const fs=size==="lg"?14:10;
  return <span style={{background:c+"22",border:"1px solid "+c,borderRadius:5,padding:size==="lg"?"4px 6px":"2px 5px",fontFamily:"monospace",fontSize:fs,fontWeight:800,color:c,minWidth:size==="lg"?52:0,display:"inline-block",textAlign:"center"}}>{v>=0?"+":""}{v.toFixed(1)}%</span>;
}

function scoreColor(v){if(v===null||v===undefined)return"#6b7280";if(v>=70)return"#10B981";if(v>=40)return"#F59E0B";return"#EF4444";}
function ScorePill({v,size="sm"}){
  if(v===null||v===undefined)return <span style={{color:"#374151",fontSize:10}}>—</span>;
  const c=scoreColor(v),fs=size==="lg"?14:10;
  return <span style={{background:c+"22",border:"1px solid "+c,borderRadius:5,padding:size==="lg"?"4px 6px":"2px 5px",fontFamily:"monospace",fontSize:fs,fontWeight:800,color:c,minWidth:size==="lg"?52:0,display:"inline-block",textAlign:"center"}}>{Math.round(v)}</span>;
}

const PERS=[{k:"w",l:"1S"},{k:"m",l:"1M"},{k:"q",l:"3M"},{k:"s",l:"6M"},{k:"y",l:"1A"},{k:"y2",l:"2A"},{k:"y3",l:"3A"},{k:"y5",l:"5A"}];
const CHART_PERIODS=[{title:"1 SETTIMANA",idx:1},{title:"1 MESE",idx:2},{title:"3 MESI",idx:3},{title:"6 MESI",idx:4},{title:"1 ANNO",idx:5},{title:"3 ANNI",idx:7}];
const ETF_PERIODS=[{k:"w",l:"1S"},{k:"m",l:"1M"},{k:"q",l:"3M"},{k:"s",l:"6M"},{k:"y",l:"1A"}];

function heatColor(v){
  if(v===null||v===undefined)return"transparent";
  if(v>=50)return"rgba(16,185,129,0.85)";if(v>=20)return"rgba(16,185,129,0.55)";if(v>=5)return"rgba(16,185,129,0.30)";
  if(v>=0)return"rgba(16,185,129,0.15)";if(v>=-5)return"rgba(239,68,68,0.15)";if(v>=-15)return"rgba(239,68,68,0.35)";
  return"rgba(239,68,68,0.60)";
}
function Pct({v}){
  if(v===null||v===undefined)return <span style={{color:"#374151"}}>—</span>;
  return <span style={{color:v>=0?"#10B981":"#EF4444",fontFamily:"monospace",fontSize:11,fontWeight:700}}>{v>=0?"+":""}{v.toFixed(2)}%</span>;
}
function TT({active,payload,label}){
  if(!active||!payload?.length)return null;const v=payload[0].value;if(v===null||v===undefined)return null;
  return <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:8,padding:"8px 12px"}}>
    <div style={{fontSize:10,color:"#94a3b8"}}>{label}</div>
    <div style={{fontSize:13,fontWeight:700,color:v>=0?"#10B981":"#EF4444",fontFamily:"monospace"}}>{v>=0?"+":""}{v?.toFixed?v.toFixed(2):v}</div>
  </div>;
}
function sortedScenarios(){return[...SCENARIOS].sort((a,b)=>{const am=a.avg.m??-999,bm=b.avg.m??-999;if(Math.abs(bm-am)>0.001)return bm-am;return(b.avg.q??-999)-(a.avg.q??-999);});}

// ── INDICATORI MACRO — aggiornati da screenshot claude checklist ──
const INDICATORS = {
  yieldCurve:0.51, vix:16.98,  move:70.41,  ism:52.7,   ismNewOrders:54.1, ismEmployment:46.4, ismPricesPaid:84.6,
  cpi:2.6,         ppi:4.0,    pce:3.2,     tedSpread:0.09, crb:393.40, bdi:2730,  ifo:83.3,
  euCpi:3.0,       jobless:189, lei:100.89, cfnai:-0.20,
  igSpread:0.81,   hySpread:2.83, emSpread:3.28,
  pcc:0.760,       pcce:0.615,  realYield:1.94, breakeven:2.69,
  us2y:3.880,      us10y:4.372, dxy:98.211,  oil:102.339, euribor:2.395, copperGold:0.0015,
  retailSales:3.97, housingStarts:1500, m2Dxy:230.99, nfp:178,
  ppiMom:0.5,      ppiCoreMom:0.4, cpiMom:0.9, cpiCoreMom:0.3,
  euCpiMom:1.0,    euCpiCoreMom:0.8, euPpiMom:-0.7, euPpiYoy:-3.0,
  spread2y:1.235,  spread10y:1.330, pceMom:0.3, de02y:2.645,
  athi:357000,     atlo:268000, trin:1.060,  spx:7230.12,
  btpBund:0.818,   vvixVix:5.60,
  dtb3:3.59,       sofr:3.66,   euur:6.2,    eujvr:2.2,
  de10y:3.042,     eurusd:1.17192, sx5e:5881.51, eursyy:1.7,
  deCurve:0.397,   euRealYield:0.042, deppimm:2.5, deppiyy:-0.2,
};

// Leading score per scenario basato sugli indicatori
// ── VALORI PRECEDENTI — da checklist 15/04/2026 ────────────────────
const PREV_INDICATORS = {
  yieldCurve:0.52, vix:18.45,  move:68.68,  ism:52.7,   ismNewOrders:53.5, ismEmployment:48.7, ismPricesPaid:78.3,
  cpi:2.6,         ppi:4.0,    pce:3.0,     tedSpread:0.09, crb:394.49, bdi:2677,  ifo:83.3,
  euCpi:2.6,       jobless:207, lei:100.89, cfnai:-0.20,
  igSpread:0.81,   hySpread:2.85, emSpread:3.27,
  pcc:0.876,       pcce:0.790,  realYield:1.91, breakeven:2.63,
  us2y:3.932,      us10y:4.410, dxy:98.992,  oil:107.102, euribor:2.450, copperGold:0.0015,
  retailSales:3.97, housingStarts:1500, m2Dxy:229.19, nfp:178,
  ppiMom:0.5,      ppiCoreMom:0.4, cpiMom:0.9, cpiCoreMom:0.3,
  euCpiMom:1.3,    euCpiCoreMom:0.8, euPpiMom:-0.7, euPpiYoy:-3.0,
  spread2y:1.182,  spread10y:1.297, pceMom:0.4, de02y:2.747,
  athi:86000,      atlo:240000, trin:0.650,  spx:7123.64,
  btpBund:0.845,   vvixVix:5.19,
  dtb3:3.61,       sofr:3.66,   euur:6.2,    eujvr:2.2,
  de10y:3.042,     eurusd:1.17192, sx5e:5881.51, eursyy:1.7,
  deCurve:0.397,   euRealYield:0.042, deppimm:2.5, deppiyy:-0.2,
};function calcLeadingScore(scenarioId){
  const cfg=SCENARIO_CFG[scenarioId];if(!cfg)return null;
  let tw=0,ts=0;
  cfg.forEach(({id,w,dir,good,bad})=>{
    const v=INDICATORS[id];
    if(v!=null&&!isNaN(v)){ts+=signalScore(v,dir,good,bad)*w;tw+=w;}
  });
  return tw>0?(ts/tw):null;
}

// ── APP ───────────────────────────────────────────────────────────
function variationScore(id, dir, good, bad){
  const curr=INDICATORS[id], prev=PREV_INDICATORS[id];
  if(curr==null||prev==null||isNaN(curr)||isNaN(prev)) return 50;
  const delta=curr-prev;
  const range=Math.abs(good-bad);
  if(range===0) return 50;
  // Normalizza il delta rispetto al range dell'indicatore
  const normDelta=(delta/range)*100;
  if(dir==="high") return Math.min(100,Math.max(0,50+normDelta*2));
  if(dir==="low")  return Math.min(100,Math.max(0,50-normDelta*2));
  return 50;
}

function signalScore(v, dir, good, bad){
  if(v===null||v===undefined||isNaN(v))return 50;
  if(dir==="high"){if(v>=good)return 100;if(v<=bad)return 0;return((v-bad)/(good-bad))*100;}
  if(dir==="low"){if(v<=good)return 100;if(v>=bad)return 0;return((bad-v)/(bad-good))*100;}
  const dist=Math.abs(v-good),maxD=Math.abs(bad-good);return Math.max(0,100-(dist/maxD)*100);
}

// Score composito: 60% valore nominale + 40% variazione
function compositeSignal(id, dir, good, bad){
  const nom=signalScore(INDICATORS[id],dir,good,bad);
  const var_=variationScore(id,dir,good,bad);
  return nom*0.60 + var_*0.40;
}

const SCENARIO_CFG = {
  stagflation: [
    {id:"pce",          w:.14,dir:"high",good:4.0,  bad:2.0},   // PCE YoY - polarizzante
    {id:"ismPricesPaid",w:.12,dir:"high",good:78,   bad:40},    // polarizzante
    {id:"ppi",          w:.10,dir:"high",good:5.0,  bad:1.5},   // polarizzante
    {id:"breakeven",    w:.10,dir:"high",good:2.8,  bad:2.0},   // polarizzante
    {id:"ppiCoreMom",   w:.07,dir:"high",good:0.4,  bad:0.0},
    {id:"cpiCoreMom",   w:.07,dir:"high",good:0.35, bad:0.0},
    {id:"cpiMom",       w:.07,dir:"high",good:0.5,  bad:0.0},
    {id:"cpi",          w:.08,dir:"high",good:5.0,  bad:2.0},
    {id:"realYield",    w:.08,dir:"high",good:2.5,  bad:0.0},   // polarizzante
    {id:"ism",          w:.05,dir:"low", good:45,   bad:55},
    {id:"ifo",          w:.04,dir:"low", good:85,   bad:102},
    {id:"us10y",        w:.04,dir:"high",good:5.0,  bad:2.5},
    {id:"oil",          w:.03,dir:"high",good:100,  bad:55},    // ridotto - volatile
    {id:"crb",          w:.06,dir:"high",good:420,  bad:280},   // ridotto - volatile
    {id:"ppiMom",       w:.06,dir:"high",good:0.5,  bad:0.0},   // ridotto - volatile
  ],
  debasement: [
    {id:"realYield",    w:.15,dir:"low", good:-0.5, bad:1.5},   // polarizzante - il più importante
    {id:"m2Dxy",        w:.13,dir:"high",good:230,  bad:210},   // polarizzante
    {id:"breakeven",    w:.12,dir:"high",good:2.8,  bad:2.0},   // polarizzante
    {id:"dxy",          w:.10,dir:"low", good:97,   bad:108},   // polarizzante
    {id:"pce",          w:.08,dir:"high",good:4.0,  bad:2.0},
    {id:"pceMom",       w:.07,dir:"high",good:0.35, bad:0.0},
    {id:"emSpread",     w:.06,dir:"low", good:3.0,  bad:7.0},
    {id:"ppi",          w:.06,dir:"high",good:5.0,  bad:1.5},
    {id:"euribor",      w:.06,dir:"low", good:1.5,  bad:4.0},   // BCE dovish = debasement
    {id:"us10y",        w:.05,dir:"low", good:2.0,  bad:5.0},
    {id:"dtb3",         w:.04,dir:"low", good:2.0,  bad:5.0},
    {id:"ppiMom",       w:.06,dir:"high",good:0.4,  bad:0.0},   // ridotto - volatile
    {id:"crb",          w:.06,dir:"high",good:420,  bad:280},   // ridotto - volatile
    {id:"vvixVix",      w:.02,dir:"low", good:4.0,  bad:7.0},   // ridotto - volatile
  ],
  debasementbtc: [
    {id:"realYield",    w:.15,dir:"low", good:-0.5, bad:1.5},
    {id:"m2Dxy",        w:.13,dir:"high",good:230,  bad:210},
    {id:"breakeven",    w:.11,dir:"high",good:2.8,  bad:2.0},
    {id:"dxy",          w:.12,dir:"low", good:97,   bad:108},
    {id:"pce",          w:.07,dir:"high",good:4.0,  bad:2.0},
    {id:"us2y",         w:.07,dir:"low", good:2.0,  bad:5.0},
    {id:"euribor",      w:.06,dir:"low", good:1.5,  bad:4.0},
    {id:"pcc",          w:.05,dir:"low", good:0.7,  bad:1.2},
    {id:"dtb3",         w:.05,dir:"low", good:2.0,  bad:5.0},
    {id:"ppi",          w:.05,dir:"high",good:5.0,  bad:1.5},
    {id:"pceMom",       w:.03,dir:"high",good:0.35, bad:0.0},
  ],
  goldilocks: [
    {id:"lei",          w:.12,dir:"high",good:101.5,bad:99.5},   // polarizzante
    {id:"hySpread",     w:.10,dir:"low", good:2.5,  bad:6.0},   // polarizzante
    {id:"yieldCurve",   w:.10,dir:"high",good:1.5,  bad:0.0},   // polarizzante
    {id:"cfnai",        w:.08,dir:"high",good:0.2,  bad:-0.7},  // polarizzante
    {id:"igSpread",     w:.08,dir:"low", good:0.6,  bad:2.0},   // polarizzante
    {id:"spx",          w:.07,dir:"high",good:7500, bad:5000},
    {id:"ismNewOrders", w:.07,dir:"high",good:56,   bad:48},
    {id:"pcc",          w:.06,dir:"low", good:0.7,  bad:1.2},
    {id:"pcce",         w:.05,dir:"low", good:0.5,  bad:1.0},
    {id:"ismEmployment",w:.05,dir:"high",good:53,   bad:44},
    {id:"retailSales",  w:.05,dir:"high",good:4.0,  bad:1.0},
    {id:"copperGold",   w:.04,dir:"high",good:0.003,bad:0.001},
    {id:"spread2y",     w:.04,dir:"high",good:1.5,  bad:0.5},
    {id:"us2y",         w:.04,dir:"mid", good:3.0,  bad:5.0},
    {id:"ism",          w:.04,dir:"high",good:55,   bad:48},
    {id:"pceMom",       w:.03,dir:"mid", good:0.17, bad:0.3},
    {id:"ppiMom",       w:.06,dir:"mid", good:0.2,  bad:0.5},   // ridotto - volatile
  ],
  recession: [
    {id:"yieldCurve",   w:.15,dir:"low", good:-1.0, bad:0.5},   // il più polarizzante
    {id:"lei",          w:.12,dir:"low", good:98.5, bad:101.5},  // polarizzante
    {id:"hySpread",     w:.10,dir:"high",good:7.0,  bad:3.0},   // polarizzante
    {id:"cfnai",        w:.08,dir:"low", good:-0.7, bad:0.2},   // polarizzante
    {id:"jobless",      w:.07,dir:"high",good:380,  bad:210},
    {id:"nfp",          w:.07,dir:"low", good:80,   bad:250},
    {id:"ism",          w:.06,dir:"low", good:44,   bad:52},
    {id:"ismNewOrders", w:.06,dir:"low", good:43,   bad:52},
    {id:"igSpread",     w:.05,dir:"high",good:2.0,  bad:0.6},
    {id:"spread2y",     w:.05,dir:"low", good:0.3,  bad:1.8},
    {id:"housingStarts",w:.04,dir:"low", good:1100, bad:1500},
    {id:"vvixVix",      w:.04,dir:"high",good:7.0,  bad:4.0},
    {id:"pcc",          w:.04,dir:"high",good:1.2,  bad:0.7},
    {id:"pcce",         w:.03,dir:"high",good:1.0,  bad:0.5},
    {id:"btpBund",      w:.03,dir:"high",good:1.5,  bad:0.5},
    {id:"us2y",         w:.03,dir:"low", good:2.0,  bad:5.0},
    {id:"move",         w:.03,dir:"high",good:120,  bad:70},    // ridotto - volatile
    {id:"ppiMom",       w:.06,dir:"low", good:0.0,  bad:0.5},   // ridotto - volatile
  ],
  reflation: [
    {id:"ismNewOrders", w:.12,dir:"high",good:58,   bad:48},    // polarizzante
    {id:"yieldCurve",   w:.10,dir:"high",good:1.5,  bad:0.0},   // polarizzante
    {id:"ppi",          w:.10,dir:"high",good:4.0,  bad:1.0},   // polarizzante
    {id:"copperGold",   w:.09,dir:"high",good:0.003,bad:0.001}, // polarizzante
    {id:"cpi",          w:.08,dir:"high",good:3.5,  bad:1.0},
    {id:"bdi",          w:.07,dir:"high",good:2500, bad:800},
    {id:"ism",          w:.07,dir:"high",good:55,   bad:48},
    {id:"ismPricesPaid",w:.07,dir:"high",good:70,   bad:40},
    {id:"retailSales",  w:.06,dir:"high",good:5.0,  bad:1.0},
    {id:"spx",          w:.05,dir:"high",good:7000, bad:5000},
    {id:"us10y",        w:.05,dir:"high",good:4.5,  bad:2.0},
    {id:"cpiMom",       w:.04,dir:"high",good:0.4,  bad:0.0},
    {id:"oil",          w:.03,dir:"high",good:85,   bad:55},    // ridotto - volatile
    {id:"ppiMom",       w:.06,dir:"high",good:0.5,  bad:0.0},   // ridotto - volatile
  ],
  disinflation: [
    {id:"breakeven",    w:.14,dir:"low", good:2.0,  bad:3.0},   // polarizzante
    {id:"pceMom",       w:.12,dir:"low", good:0.1,  bad:0.3},   // polarizzante
    {id:"yieldCurve",   w:.10,dir:"high",good:1.0,  bad:-0.5},  // polarizzante
    {id:"cpi",          w:.09,dir:"low", good:2.0,  bad:5.0},   // polarizzante
    {id:"ppi",          w:.08,dir:"low", good:1.5,  bad:5.0},
    {id:"m2Dxy",        w:.06,dir:"low", good:210,  bad:235},
    {id:"us2y",         w:.07,dir:"low", good:2.5,  bad:5.0},
    {id:"igSpread",     w:.06,dir:"low", good:0.6,  bad:2.0},
    {id:"vix",          w:.05,dir:"low", good:13,   bad:30},
    {id:"pcc",          w:.05,dir:"low", good:0.7,  bad:1.2},
    {id:"pcce",         w:.04,dir:"low", good:0.5,  bad:1.0},
    {id:"ism",          w:.04,dir:"mid", good:52,   bad:45},
    {id:"cpiMom",       w:.04,dir:"low", good:0.1,  bad:0.35},
    {id:"bdi",          w:.03,dir:"low", good:800,  bad:2500},
    {id:"ismNewOrders", w:.03,dir:"low", good:47,   bad:56},
    {id:"oil",          w:.02,dir:"low", good:55,   bad:100},   // ridotto - volatile
    {id:"ppiMom",       w:.06,dir:"low", good:0.0,  bad:0.5},   // ridotto - volatile
  ],
  dollarweakness: [
    {id:"spread2y",     w:.15,dir:"low", good:0.5,  bad:1.8},   // il più polarizzante
    {id:"dxy",          w:.13,dir:"low", good:97,   bad:107},   // polarizzante
    {id:"realYield",    w:.12,dir:"low", good:-0.5, bad:1.5},   // polarizzante
    {id:"spread10y",    w:.10,dir:"low", good:0.5,  bad:1.8},   // polarizzante
    {id:"m2Dxy",        w:.10,dir:"high",good:230,  bad:210},   // polarizzante
    {id:"euribor",      w:.10,dir:"high",good:3.5,  bad:1.5},   // BCE hawkish = EUR forte
    {id:"de02y",        w:.08,dir:"high",good:3.0,  bad:1.5},
    {id:"breakeven",    w:.07,dir:"high",good:2.8,  bad:2.0},
    {id:"emSpread",     w:.05,dir:"low", good:2.5,  bad:6.0},
    {id:"hySpread",     w:.04,dir:"low", good:3.0,  bad:7.0},
    {id:"vix",          w:.03,dir:"low", good:15,   bad:30},    // ridotto - volatile
    {id:"ppiMom",       w:.06,dir:"high",good:0.35, bad:0.0},   // ridotto - volatile
    {id:"spx",          w:.04,dir:"high",good:7000, bad:5000},
    {id:"vvixVix",      w:.03,dir:"low", good:4.0,  bad:7.0},
  ],
  dollarweaknessbtc: [
    {id:"spread2y",     w:.14,dir:"low", good:0.5,  bad:1.8},   // polarizzante
    {id:"dxy",          w:.13,dir:"low", good:97,   bad:107},   // polarizzante
    {id:"realYield",    w:.12,dir:"low", good:-0.5, bad:1.5},   // polarizzante
    {id:"m2Dxy",        w:.11,dir:"high",good:230,  bad:210},   // polarizzante
    {id:"breakeven",    w:.10,dir:"high",good:2.8,  bad:2.0},
    {id:"euribor",      w:.09,dir:"high",good:3.5,  bad:1.5},
    {id:"de02y",        w:.07,dir:"high",good:3.0,  bad:1.5},
    {id:"spx",          w:.06,dir:"high",good:7000, bad:5000},
    {id:"pceMom",       w:.05,dir:"high",good:0.3,  bad:0.0},
    {id:"vvixVix",      w:.04,dir:"low", good:4.0,  bad:7.0},
    {id:"vix",          w:.03,dir:"low", good:15,   bad:35},    // ridotto - volatile
    {id:"crb",          w:.06,dir:"high",good:400,  bad:280},   // ridotto - volatile
    {id:"ppiMom",       w:.06,dir:"high",good:0.35, bad:0.0},   // ridotto - volatile
  ],
  deflation: [
    {id:"yieldCurve",   w:.12,dir:"low", good:-1.0, bad:1.0},   // polarizzante
    {id:"hySpread",     w:.10,dir:"high",good:8.0,  bad:3.0},   // polarizzante
    {id:"cpi",          w:.10,dir:"low", good:0.5,  bad:3.0},   // polarizzante
    {id:"m2Dxy",        w:.08,dir:"low", good:205,  bad:235},   // polarizzante
    {id:"cfnai",        w:.08,dir:"low", good:-0.7, bad:0.2},   // polarizzante
    {id:"cpiMom",       w:.08,dir:"low", good:-0.1, bad:0.3},
    {id:"lei",          w:.07,dir:"low", good:98,   bad:102},
    {id:"ismNewOrders", w:.06,dir:"low", good:40,   bad:50},
    {id:"copperGold",   w:.05,dir:"low", good:0.001,bad:0.003},
    {id:"vvixVix",      w:.05,dir:"high",good:7.0,  bad:4.0},
    {id:"pcc",          w:.05,dir:"high",good:1.2,  bad:0.7},
    {id:"igSpread",     w:.04,dir:"high",good:2.0,  bad:0.6},
    {id:"spx",          w:.04,dir:"low", good:5000, bad:7500},
    {id:"us2y",         w:.03,dir:"low", good:1.0,  bad:5.0},
    {id:"emSpread",     w:.03,dir:"high",good:6.0,  bad:3.0},
    {id:"housingStarts",w:.03,dir:"low", good:900,  bad:1600},
    {id:"vix",          w:.03,dir:"high",good:40,   bad:15},    // ridotto - volatile
    {id:"bdi",          w:.02,dir:"low", good:500,  bad:2000},  // ridotto - volatile
  ],
};

// ── APP ───────────────────────────────────────────────────────────
function pPct(s){
  if(!s||s==="#N/A"||s==="-"||s==="")return null;
  var t=s.toString().split("%")[0].split(" ")[0].split(" ")[0];
  t=t.split(",").join(".");
  var n=parseFloat(t);
  return isNaN(n)?null:n;
}
function pPx(s){
  if(!s)return null;
  var t=s.toString().split(" ")[0];
  var parts=t.split(",");
  if(parts.length>1){t=parts.join("").split(".").join("").split(",").join(".");}
  else{t=t.split(".").join("").split(",").join(".");}
  var n=parseFloat(t);
  return isNaN(n)?null:n;
}
function pCSV(line){
  var r=[];var c="";var q=false;
  for(var i=0;i<line.length;i++){
    if(line[i]==='"'){q=!q;}
    else if(line[i]===","&&!q){r.push(c.trim());c="";}
    else{c+=line[i];}
  }
  r.push(c.trim());
  return r;
}
function parseScenariCSV(text){
  var lines=text.split("\n");
  var upd={};var cur=null;var etfs=[];
  for(var li=0;li<lines.length;li++){
    var line=lines[li].split("\r").join("");
    var cols=pCSV(line);
    var f=(cols[0]||"").trim().toUpperCase();
    if(!f){
      if(cur&&etfs.length){if(!upd[cur])upd[cur]={etfs:[],avg:{}};upd[cur].etfs=etfs.slice();}
      continue;
    }
    var sid=SCEN_MAP[f];
    if(sid){
      if(cur&&etfs.length){if(!upd[cur])upd[cur]={etfs:[],avg:{}};upd[cur].etfs=etfs.slice();}
      cur=sid;etfs=[];continue;
    }
    if(!cur)continue;
    if(f==="VAR.% MEDIA"){
      if(!upd[cur])upd[cur]={etfs:[],avg:{}};
      upd[cur].avg={g:pPct(cols[3]),w:pPct(cols[4]),m:pPct(cols[5]),q:pPct(cols[6]),s:pPct(cols[7]),y:pPct(cols[8]),y2:pPct(cols[9]),y3:pPct(cols[10]),y5:pPct(cols[11])};
      continue;
    }
    if(f==="TICKER"||!cols[0]||!cols[2])continue;
    var e={t:cols[0].trim(),n:cols[1]||"",p:pPx(cols[2]),g:pPct(cols[3]),w:pPct(cols[4]),m:pPct(cols[5]),q:pPct(cols[6]),s:pPct(cols[7]),y:pPct(cols[8]),y2:pPct(cols[9]),y3:pPct(cols[10]),y5:pPct(cols[11])};
    if(e.p)etfs.push(e);
  }
  if(cur&&etfs.length){if(!upd[cur])upd[cur]={etfs:[],avg:{}};upd[cur].etfs=etfs.slice();}
  window._macroNotFound=notFound;
  return upd;
}
function parseNazionaliCSV(text){
  var lines=text.split("\n");
  var etfs=[];var ok=false;
  for(var li=0;li<lines.length;li++){
    var line=lines[li].split("\r").join("");
    var cols=pCSV(line);
    if((cols[0]||"").trim().toUpperCase()==="TICKER"){ok=true;continue;}
    if(!ok||!cols[0]||!cols[2])continue;
    var e={t:cols[0].trim(),n:cols[1]||"",p:pPx(cols[2]),g:pPct(cols[3]),w:pPct(cols[4]),m:pPct(cols[5]),q:pPct(cols[6]),s:pPct(cols[7]),y:pPct(cols[8]),y2:pPct(cols[9]),y3:pPct(cols[10]),y5:pPct(cols[11])};
    if(e.p)etfs.push(e);
  }
  return etfs;
}
function parseMacroText(text){
  var TM={"T10Y2Y":"yieldCurve","VIX":"vix","MOVE":"move","USBCOI":"ism","USMNO":"ismNewOrders","USMEMP":"ismEmployment","USMPR":"ismPricesPaid","USCIR":"cpi","USPPIYY":"ppi","USCPCEPIAC":"pce","USCCEPIAC":"pce","USPPIMM":"ppiMom","USCPCEPIMM":"pceMom","USIRMM":"cpiMom","DTB3":"dtb3","SOFR":"sofr","EUJVR":"eujvr","EUUR":"euur","EUIRYY":"euCpi","EUIRMM":"euCpiMom","EUCIRMM":"euCpiCoreMom","EUPPIMM":"euPpiMom","EUPPIYY":"euPpiYoy","DEPPIMM":"deppimm","DEPPIYY":"deppiyy","EURSYY":"eursyy","USRSYY":"retailSales","USHST":"housingStarts","M2SL/DXY":"m2Dxy","VVIX/VIX":"vvixVix","USNFP":"nfp","TRIN.NY":"trin","ATHI.NY":"athi","ATLO.NY":"atlo","USALOLITOAASTSAM":"lei","TRJEFFCRB":"crb","BDI":"bdi","DEIFOE":"ifo","USIJC":"jobless","USCFNAI":"cfnai","USCENAI":"cfnai","BAMLCOA0CM":"igSpread","BAMLCOAOCM":"igSpread","BAMLC0A0CM":"igSpread","BAMLC0A0CM":"igSpread","BAMLHOAOHYM2":"hySpread","BAMLH0A0HYM2":"hySpread","BAMLEMHBHYCRPIOAS":"emSpread","PCC":"pcc","PCCE":"pcce","US10Y":"us10y","DFII10":"realYield","T5YIE":"breakeven","USO2Y":"us2y","US02Y":"us2y","US10Y-DE10Y":"spread10y","US1OY-DE10Y":"spread10y","US10Y-DE1OY":"spread10y","DE10Y-DE02Y":"deCurve","USO2Y-DEO2Y":"spread2y","US02Y-DE02Y":"spread2y","USO2Y-DE02Y":"spread2y","US02Y-DEO2Y":"spread2y","IT10Y-DE10Y":"btpBund","IT1OY-DE10Y":"btpBund","DE10Y":"de10y","DEO2Y":"de02y","DE02Y":"de02y","EURUSD":"eurusd","DXY":"dxy","USOIL":"oil","HG1!/GC1!":"copperGold","SPX":"spx","SX5E":"sx5e","11!":"euribor","US1OY-DE10Y":"spread10y","USO2Y-DE02Y":"spread2y","BAMLCOAOCM":"igSpread","HG 1!/GC1!":"copperGold","HG1!/GC1!":"copperGold","USCPPMM":"ppiCoreMom","USCIRMM":"cpiCoreMom"};
  var upd={};
  var lines=text.split("\n");
  function extractNum(s){
    var tabs=s.trim().split("\t");
    for(var i=tabs.length-1;i>=0;i--){
      var p=tabs[i].trim();
      if(!p)continue;
      var hasPct=p.indexOf("%")>=0;
      var raw=p.split("%")[0].split("USD")[0].split("EUR")[0].split("POINT")[0].split("K PSN")[0].split("PSN")[0].split("MUNIT")[0];
      if(raw.indexOf(" B")>=0)raw=raw.split(" B")[0];
      raw=raw.trim().split(" ,").join(",").split(", ").join(",");
      if(!raw)continue;
      var numStr="";
      var neg=raw.charAt(0)==="-";
      if(neg)raw=raw.substring(1);
      if(raw.indexOf(",")>=0&&raw.indexOf(".")>=0){
        var di=raw.indexOf(".");var ci=raw.indexOf(",");
        if(di<ci){raw=raw.split(".").join("").split(",").join(".");}
        else{raw=raw.split(",").join("");}
        numStr=raw;
      } else if(raw.indexOf(",")>=0){
        var ps=raw.split(",");
        var af=ps[ps.length-1];
        var bf=ps[0];
        if(af.length===3&&parseFloat(bf)>=1000){numStr=raw.split(",").join("");}
        else{numStr=raw.split(",").join(".");}
      } else if(raw.indexOf(".")>=0){
        var ps2=raw.split(".");
        var af2=ps2[ps2.length-1];
        var bf2=ps2[0];
        if(af2.length===3&&parseFloat(bf2)>=1000){numStr=raw.split(".").join("");}
        else{numStr=raw;}
      } else if(raw.indexOf(" ")>=0){
        var sp=raw.split(" ");
        if(sp.length===2&&sp[1].length===3){
          if(sp[0].length<=1){numStr=sp[0]+"."+sp[1];}
          else{numStr=sp[0]+sp[1];}
        }
        else{numStr=sp[0];}
      } else {
        numStr=raw;
      }
      if(neg)numStr="-"+numStr;
      var n=parseFloat(numStr);
      if(!isNaN(n)){
        var afterNum=raw.substring(String(Math.abs(n)).replace(".","").length);
        if(afterNum.length>0&&(afterNum.charAt(0)==="-"||/[a-zA-Z]/.test(afterNum.charAt(0))))continue;
        return n;
      }
    }
    return null;
  }
  var notFound=[];
  for(var li=0;li<lines.length;li++){
    var line=lines[li].split("\r").join("").trim();
    if(!line)continue;
    var parts=line.split("\t");
    var tk=parts[0].trim().toUpperCase();
    var key=TM[tk];
    if(!key&&tk.length>2&&tk.length<30&&tk===tk.toUpperCase()&&tk.indexOf(" ")<0){
      notFound.push(tk);
    }
    if(key){
      var val=null;
      if(parts.length>=2){
        val=extractNum(parts.slice(1).join("\t"));
      }
      if(val===null&&li+1<lines.length){
        val=extractNum(lines[li+1]);
      }
      if(val===null&&li+2<lines.length){
        val=extractNum(lines[li+2]);
      }
      if(key==="euribor"&&val!==null&&val>90)val=100-val;
      if(key==="housingStarts"&&val!==null&&val<10)val=val*1000;
      if(val!==null)upd[key]=val;
    }
  }
  return upd;
}

// ── APP ─────────────────────────────────────────────────────────────

export default function App(){
  const [tab,setTab]=useState("scenarios");
  const [sel,setSel]=useState(null);
  const [per,setPer]=useState("y");
  const [history,setHistory]=useState([]);
  const [selLead,setSelLead]=useState(null);
  const [selRiskBox,setSelRiskBox]=useState(null);
  const [refreshing,setRefreshing]=useState(false);
  const [refreshMsg,setRefreshMsg]=useState("");
  const [macroText,setMacroText]=useState("");
  const [renderKey,setRenderKey]=useState(0);

  const sc=sel?SCENARIOS.find(s=>s.id===sel):null;

  async function fetchEtfData(){
    const URL_SC="https://docs.google.com/spreadsheets/d/e/2PACX-1vRtcPnQypnAxhDUn308spHSKmQM1pbLfImqfVz4XLR79h-HUUmNIHBElCbFSkUAvctO6IKGPn4c9d0k/pub?gid=0&single=true&output=csv";
    const URL_NAZ="https://docs.google.com/spreadsheets/d/e/2PACX-1vRtcPnQypnAxhDUn308spHSKmQM1pbLfImqfVz4XLR79h-HUUmNIHBElCbFSkUAvctO6IKGPn4c9d0k/pub?gid=2023978700&single=true&output=csv";
    setRefreshing(true);setRefreshMsg("Carico...");
    try{
      const r1=await fetch(URL_SC).then(r=>r.text());
      const r2=await fetch(URL_NAZ).then(r=>r.text());
      const su=parseScenariCSV(r1);
      SCENARIOS.forEach(function(s){const u=su[s.id];if(u){if(u.etfs&&u.etfs.length>0)s.etfs=u.etfs;if(u.avg)Object.assign(s.avg,u.avg);}});
      const naz=parseNazionaliCSV(r2);
      if(naz.length>0){ETF_NAZIONALI.length=0;naz.forEach(function(e){ETF_NAZIONALI.push(e);});}
      const now=new Date();
      setRefreshMsg("OK "+now.getHours()+":"+String(now.getMinutes()).padStart(2,"0"));
    }catch(e){setRefreshMsg("ERR: "+e.message);}
    setRefreshing(false);setRenderKey(function(k){return k+1;});
  }

  function applyMacroText(){
    if(!macroText.trim()){setRefreshMsg("Incolla prima il testo");return;}
    const upd=parseMacroText(macroText);
    const n=Object.keys(upd).length;
    if(n===0){setRefreshMsg("Nessun ticker riconosciuto");return;}
    Object.keys(upd).forEach(function(k){INDICATORS[k]=upd[k];});
    if(!window._macroUpdated)window._macroUpdated={};
    Object.keys(upd).forEach(function(k){window._macroUpdated[k]=true;});
    const SKIP_IND=["tedSpread","euRealYield","deCurve"];
    const allKeys=Object.keys(INDICATORS).filter(function(k){return SKIP_IND.indexOf(k)<0;});
    const targetInd=allKeys.length;
    const updKeys=allKeys.filter(function(k){return !!window._macroUpdated[k];});
    const totalUpd=updKeys.length;
    const missing=allKeys.filter(function(k){return !window._macroUpdated[k];});
    var msg="Incolla: +"+n+" | Aggiornati: "+totalUpd+"/"+targetInd;
    if(missing.length>0)msg+=" | Mancanti: "+missing.join(", ");
    setRefreshMsg(msg);
    setRenderKey(function(k){return k+1;});
  }
  const allMomScores=calcAllScores();
  const allEtfScores=calcAllEtfScores();
  const momMap=Object.fromEntries(allMomScores.map(s=>[s.id,s]));
  const etfMap=Object.fromEntries(allEtfScores.map(e=>[e.t,e]));
  const leadMap=Object.fromEntries(SCENARIOS.map(s=>[s.id,calcLeadingScore(s.id)]));
  const finalMap=Object.fromEntries(SCENARIOS.map(s=>{const m=momMap[s.id]?.composite,l=leadMap[s.id];return[s.id,calcFinalScore(m,l,s.id,history)];}));

  // Seed storico hardcoded — non si perde tra versioni
  const SEED_HISTORY=[
    {week:15,update:"08/04/2026",scores:{goldilocks:81.6,recession:10.2,stagflation:48.6,reflation:90.2,disinflation:25.5,dollarweakness:70.8,deflation:0.0,dollarweaknessbtc:34.4,debasementbtc:61.8,debasement:100.0}},
    {week:16,update:"13/04/2026",scores:{goldilocks:81.6,recession:10.2,stagflation:48.6,reflation:90.2,disinflation:25.5,dollarweakness:70.8,deflation:0.0,dollarweaknessbtc:34.4,debasementbtc:61.8,debasement:100.0}},
    {week:17,update:"20/04/2026",scores:{goldilocks:90.5,recession:12.5,stagflation:45.2,reflation:70.1,disinflation:26.9,dollarweakness:59.5,deflation:0.0,dollarweaknessbtc:35.2,debasementbtc:80.9,debasement:100.0}},
  {week:18,update:"27/04/2026",scores:{goldilocks:100,recession:9,stagflation:47,reflation:65,disinflation:25,dollarweakness:55,deflation:0,dollarweaknessbtc:34,debasementbtc:78,debasement:87}},
    {week:19,update:"29/04/2026",scores:{goldilocks:100,recession:0,stagflation:73,reflation:81,disinflation:34,dollarweakness:64,deflation:10,dollarweaknessbtc:23,debasementbtc:46,debasement:55}},
  {week:19,update:"29/04/2026",scores:{goldilocks:100,recession:0,stagflation:73,reflation:81,disinflation:34,dollarweakness:64,deflation:10,dollarweaknessbtc:23,debasementbtc:46,debasement:55}},
    {week:19,update:"29/04/2026",scores:{goldilocks:100,recession:0,stagflation:73,reflation:81,disinflation:34,dollarweakness:64,deflation:10,dollarweaknessbtc:23,debasementbtc:46,debasement:55}},
  ];

  useEffect(()=>{
    (async()=>{
      try{
        const res=await window.storage.get("momentum-history");
        const stored=res?JSON.parse(res.value):[];
        // Merge seed + stored, seed entries only if not already present
        const merged=[...SEED_HISTORY];
        stored.forEach(h=>{if(!merged.find(s=>s.week===h.week))merged.push(h);});
        const curScores=Object.fromEntries(allMomScores.map(s=>[s.id,s.composite]));
        const exists=merged.find(h=>h.week===CURRENT_WEEK);
        const updated=exists?merged.map(h=>h.week===CURRENT_WEEK?{...h,scores:curScores,update:LAST_UPDATE}:h):[...merged,{week:CURRENT_WEEK,update:LAST_UPDATE,scores:curScores}].slice(-8);
        try{await window.storage.set("momentum-history",JSON.stringify(updated));}catch{}
        setHistory(updated);
      }catch{
        const curScores=Object.fromEntries(allMomScores.map(s=>[s.id,s.composite]));
        const merged=[...SEED_HISTORY,{week:CURRENT_WEEK,update:LAST_UPDATE,scores:curScores}];
        setHistory(merged);
      }
    })();
  },[]);

  function getSmoothedDelta(sid){
    if(history.length<2)return null;
    const s=[...history].sort((a,b)=>a.week-b.week);
    const vals=s.map(h=>h.scores[sid]).filter(v=>v!=null);
    if(vals.length<2)return null;
    // Se abbiamo 3+ settimane: MA3 recente vs MA3 precedente
    if(vals.length>=3){
      const recentMA=vals.slice(-3).reduce((a,b)=>a+b,0)/Math.min(3,vals.slice(-3).length);
      const prevMA=vals.slice(-6,-3);
      if(prevMA.length>0) return recentMA - prevMA.reduce((a,b)=>a+b,0)/prevMA.length;
    }
    // 2 settimane: ultima - penultima
    return vals[vals.length-1]-vals[vals.length-2];
  }
  function deltaArrow(d){
    if(d===null)return{a:"-",c:"#F59E0B"};
    if(d>2)return{a:"▲",c:"#10B981"};
    if(d>=-2)return{a:"-",c:"#F59E0B"};
    return{a:"▼",c:"#EF4444"};
  }

  function DeltaPill({d}){
    const{a,c}=deltaArrow(d);
    const base={borderRadius:5,padding:"4px 6px",fontFamily:"monospace",fontSize:14,fontWeight:800,display:"inline-block",whiteSpace:"nowrap",minWidth:52,textAlign:"center"};
    if(d===null) return <span style={{...base,background:"#1e293b",border:"1px solid #374151",color:"#374151"}}>—</span>;
    return <span style={{...base,background:c+"22",border:"1px solid "+c,color:c}}>
      {(d>=0?"+":"")+d.toFixed(1)}{a}
    </span>;
  }

  const sortedByFinal=[...SCENARIOS].sort((a,b)=>(finalMap[b.id]??-999)-(finalMap[a.id]??-999));

  return <div style={{minHeight:"100vh",background:"#080812",color:"#e2e8f0",fontFamily:"system-ui,sans-serif",padding:16}}>
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:8,letterSpacing:4,color:"#F59E0B",textTransform:"uppercase",marginBottom:3}}>PORTAFOGLI RADAR</div>
          <h1 style={{fontSize:18,fontWeight:800,margin:0,color:"#f8fafc"}}>Macro Scenari</h1>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:6,padding:"5px 10px",fontSize:9,color:"#6b7280"}}>📅 {LAST_UPDATE}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
        
      </div>
    </div>

    <div style={{display:"flex",gap:2,marginBottom:16,borderBottom:"1px solid #1f2937",flexWrap:"wrap"}}>
      {[{id:"scenarios",l:"📁 Scenari"},{id:"riskonoff",l:"🎯 Risk"},{id:"etfattivi",l:"⭐ ETF Attivi"},{id:"etfnaz",l:"🌍 ETF Nazionali"},{id:"indicatori",l:"📡 Indicatori"},{id:"banche",l:"🏦 Banche Centrali"},{id:"charts",l:"📈 Grafici"},{id:"aggiorna",l:"⚙️ Aggiorna"}].map(t=>(
        <button key={t.id} onClick={()=>{setTab(t.id);setSel(null);}} style={{background:"none",border:"none",padding:"7px 12px",cursor:"pointer",fontSize:11,fontWeight:600,color:tab===t.id?"#F59E0B":"#6b7280",borderBottom:tab===t.id?"2px solid #F59E0B":"2px solid transparent",marginBottom:-1}}>{t.l}</button>
      ))}
    </div>

    {tab==="scenarios"&&!sel&&<div>
      <div style={{fontSize:8,color:"#6b7280",marginBottom:12,letterSpacing:1}}>ORDINATO PER SCORE FINALE ↓ (70% LEADING + 30% MOM (modulato))</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {(()=>{
          const sortedByCore=[...SCENARIOS].sort((a,b)=>{
            const aS=(a.avg.s??-999)*0.70+(a.avg.q??-999)*0.30;
            const bS=(b.avg.s??-999)*0.70+(b.avg.q??-999)*0.30;
            return bS-aS;
          });
          const coreIds=new Set(sortedByCore.slice(0,2).map(x=>x.id));
          return sortedByFinal.map((s,rank)=>{
          const mom=momMap[s.id]?.composite,lead=leadMap[s.id],final=finalMap[s.id];
          const delta=getSmoothedDelta(s.id);const{a,c}=deltaArrow(delta);
          const fcol=scoreColor(final);
          const isCore=coreIds.has(s.id);
          return <div key={s.id} onClick={()=>setSel(s.id)} style={{background:isCore?"#0f172a":"#080812",border:"2px solid "+(isCore?s.color:"#1f2937"),borderRadius:12,padding:14,cursor:"pointer",boxShadow:isCore?"0 0 10px "+s.color+"55":"none"}}>
            {/* Top row — rank, name, active badge */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{background:"#1e293b",color:"#6b7280",fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:4}}>#{rank+1}</div>
                <div style={{fontSize:13,color:s.color,letterSpacing:1,fontWeight:800}}>{s.name}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                
                <div style={{fontSize:11,color:"#4b5563"}}>›</div>
              </div>
            </div>
            {/* Desc */}
            <div style={{fontSize:10,color:"#6b7280",marginBottom:10}}>{s.desc}</div>
            {/* Scores row */}
            <div style={{display:"flex",gap:0,marginBottom:10}}>
              {[{label:"MOMENTUM",v:mom},{label:"Δ TREND",v:null,delta:true},{label:"LEADING",v:lead},{label:"FINAL SCORE",v:final,hi:true}].map(({label,v,hi,delta:isDelta},i)=>(
                <div key={i} style={{flex:1,textAlign:"center",borderRight:i<3?"1px solid #1e293b":"none",paddingRight:4,paddingLeft:i>0?4:0}}>
                  <div style={{fontSize:7,color:hi?"#F59E0B":"#4b5563",fontWeight:hi?700:400,marginBottom:4,letterSpacing:1}}>{label}</div>
                  {isDelta
                    ? <DeltaPill d={delta}/>
                    : <ScorePill v={v} size="lg"/>
                  }
                </div>
              ))}
            </div>
            {/* Score bar */}
            <div style={{height:4,background:"#1e293b",borderRadius:2,overflow:"hidden",marginBottom:10}}>
              <div style={{height:"100%",width:(final??0)+"%",background:fcol,borderRadius:2,transition:"width 0.5s"}}/>
            </div>
            {/* ETF chips */}
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {s.etfs.map(e=> <span key={e.t} style={{background:"#1e293b",borderRadius:4,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#64748b",fontFamily:"monospace"}}>{e.t}</span>)}
            </div>
          </div>;
          });
        })()}
      </div>
    </div>}

    {tab==="scenarios"&&sel&&sc&&<div>
      <button onClick={()=>setSel(null)} style={{background:"none",border:"1px solid #374151",color:"#94a3b8",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,marginBottom:12}}>← Indietro</button>
      <div style={{background:"#0f172a",border:"1px solid "+sc.color,borderRadius:10,padding:12,marginBottom:12,boxShadow:"0 0 18px "+sc.color+"33"}}>
        <div style={{fontSize:8,color:sc.color,letterSpacing:3,fontWeight:700}}>{sc.name}</div>
        <div style={{fontSize:10,color:"#6b7280",marginBottom:8}}>{sc.desc}</div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
          {(()=>{
            const d=getSmoothedDelta(sc.id);const{a,c}=deltaArrow(d);
            const items=[
              {label:"MOM",    v:momMap[sc.id]?.composite, hi:false, isDelta:false},
              {label:"Δ TREND",v:null,                     hi:false, isDelta:true},
              {label:"LEAD",   v:leadMap[sc.id],           hi:false, isDelta:false},
              {label:"FINAL",  v:finalMap[sc.id],          hi:true,  isDelta:false},
            ];
            return items.map(({label,v,hi,isDelta})=>(
              <div key={label} style={{textAlign:"center"}}>
                <div style={{fontSize:8,color:hi?"#F59E0B":"#4b5563",marginBottom:3,fontWeight:hi?700:400}}>{label}</div>
                {isDelta
                  ? <DeltaPill d={d}/>
                  : <ScorePill v={v} size="lg"/>
                }
              </div>
            ));
          })()}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[{k:"w",l:"1S"},{k:"m",l:"1M"},{k:"q",l:"3M"},{k:"s",l:"6M"}].map(p=> (
            <div key={p.k} style={{background:"#0a0a14",borderRadius:6,padding:"6px 10px",textAlign:"center"}}>
              <div style={{fontSize:8,color:"#4b5563",marginBottom:2}}>Media {p.l}</div>
              <div style={{fontFamily:"monospace",fontSize:13,fontWeight:800,color:sc.avg[p.k]!=null&&sc.avg[p.k]>=0?"#10B981":"#EF4444"}}>
                {sc.avg[p.k]!=null?(sc.avg[p.k]>=0?"+":"")+sc.avg[p.k].toFixed(2)+"%":"—"}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
        {PERS.map(p=> <button key={p.k} onClick={()=>setPer(p.k)} style={{background:per===p.k?"#F59E0B":"#0f172a",border:"1px solid "+(per===p.k?"#F59E0B":"#1f2937"),color:per===p.k?"#000":"#94a3b8",borderRadius:5,padding:"3px 8px",fontSize:9,fontWeight:700,cursor:"pointer"}}>{p.l}</button>)}
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:"1px solid #1f2937"}}>
              <th style={{textAlign:"left",padding:"5px 8px",fontSize:9,color:"#4b5563"}}>TICKER</th>
              <th style={{textAlign:"left",padding:"5px 8px",fontSize:9,color:"#4b5563"}}>NOME</th>
              <th style={{textAlign:"center",padding:"5px 6px",fontSize:9,color:"#F59E0B"}}>MOM</th>
              <th style={{textAlign:"right",padding:"5px 6px",fontSize:9,color:"#4b5563"}}>PREZZO</th>
              {PERS.map(p=> <th key={p.k} style={{textAlign:"right",padding:"5px 4px",fontSize:9,color:per===p.k?"#F59E0B":"#4b5563",fontWeight:per===p.k?700:500}}>{p.l}</th>)}
            </tr>
          </thead>
          <tbody>
            {[...sc.etfs].sort((a,b)=>(etfMap[b.t]?.composite??-999)-(etfMap[a.t]?.composite??-999)).map((e,i)=> (
              <tr key={i} style={{borderTop:"1px solid #0f172a"}}>
                <td style={{padding:"9px 8px",fontFamily:"monospace",fontSize:11,fontWeight:700,color:sc.color}}>{e.t}</td>
                <td style={{padding:"9px 8px",fontSize:9,color:"#6b7280"}}>{e.n}</td>
                <td style={{padding:"9px 6px",textAlign:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                      <div style={{fontSize:6,color:"#475569"}}>AVG.MOM</div>
                      <AvgMomPill v={calcAvgMom(e)}/>
                    </div>
                    <span style={{fontSize:10,color:scoreColor(etfMap[e.t]?.composite),fontWeight:700}}>{(etfMap[e.t]?.composite??0)>=70?"▲":(etfMap[e.t]?.composite??0)>=40?"→":"▼"}</span>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                      <div style={{fontSize:6,color:"#475569"}}>SCORE</div>
                      <ScorePill v={etfMap[e.t]?.composite}/>
                    </div>
                  </div>
                </td>
                <td style={{padding:"9px 6px",textAlign:"right",fontFamily:"monospace",fontSize:10,color:"#e2e8f0"}}>${e.p.toFixed(2)}</td>
                {PERS.map(p=> <td key={p.k} style={{padding:"9px 4px",textAlign:"right",background:per===p.k?"rgba(245,158,11,0.05)":"transparent"}}><Pct v={e[p.k]}/></td>)}
              </tr>
            ))}
            <tr style={{borderTop:"2px solid #1f2937",background:"rgba(255,255,255,0.02)"}}>
              <td colSpan={4} style={{padding:"9px 8px",fontSize:8,color:"#6b7280",fontWeight:700,letterSpacing:1}}>MEDIA PORTAFOGLIO</td>
              {PERS.map(p=> <td key={p.k} style={{padding:"9px 4px",textAlign:"right",background:per===p.k?"rgba(245,158,11,0.08)":"transparent"}}><Pct v={sc.avg[p.k]}/></td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>}

    {tab==="riskonoff"&&(()=>{
      // ── RISK SCORE 0-100 dai 62 indicatori ───────────────────────
      // >50 = risk on, <50 = risk off, 50 = neutrale
      const IND=INDICATORS;
      function rs(v,riskOnGood,riskOnBad){
        if(v==null||isNaN(v))return 50;
        if(riskOnGood>riskOnBad){if(v>=riskOnGood)return 100;if(v<=riskOnBad)return 0;return((v-riskOnBad)/(riskOnGood-riskOnBad))*100;}
        if(v<=riskOnGood)return 100;if(v>=riskOnBad)return 0;return((riskOnBad-v)/(riskOnBad-riskOnGood))*100;
      }
      // DE curve calcolata
      const deCurve=(IND.de02y!=null&&IND.us10y!=null)?2.937-IND.de02y:null;
      const scores=[
        // CICLO ECONOMICO — risk on quando alto
        {s:rs(IND.ism,55,44),          w:4},
        {s:rs(IND.ismNewOrders,55,44), w:4},
        {s:rs(IND.ismEmployment,53,44),w:3},
        {s:rs(IND.lei,101.5,98),       w:4},
        {s:rs(IND.cfnai,0.2,-0.7),     w:2},
        {s:rs(IND.ifo,102,85),         w:2},
        {s:rs(IND.retailSales,5,1),    w:2},
        {s:rs(IND.housingStarts,1500,1100),w:2},
        {s:rs(IND.nfp,250,80),         w:3},
        {s:rs(IND.jobless,180,380),    w:3},  // inverso: basso=risk on
        {s:rs(IND.bdi,2500,800),       w:2},
        {s:rs(IND.copperGold,0.003,0.001),w:3},
        // VOLATILITÀ E SENTIMENT — risk on quando basso
        {s:rs(IND.vix,13,35),          w:7},  // inverso
        {s:rs(IND.move,70,120),        w:3},  // inverso
        {s:rs(IND.pcc,0.7,1.2),        w:2},  // inverso
        {s:rs(IND.pcce,0.6,1.1),       w:2},  // inverso
        // CREDITO — risk on quando spread basso
        {s:rs(IND.hySpread,2.5,7.0),   w:6},  // inverso
        {s:rs(IND.igSpread,0.6,2.0),   w:3},  // inverso
        {s:rs(IND.emSpread,2.5,6.0),   w:2},  // inverso
        {s:rs(IND.tedSpread,0.1,0.5),  w:2},  // inverso
        // CURVE — piatte/negative = risk off
        {s:rs(IND.yieldCurve,1.5,-0.5),w:4},
        {s:rs(deCurve,1.5,-0.3),       w:3},
        // TASSI — risk on quando bassi
        {s:rs(IND.realYield,-0.5,2.5), w:3},  // inverso
        {s:rs(IND.us2y,2.0,5.0),       w:2},  // inverso
        {s:rs(IND.de02y,1.5,4.0),      w:2},  // inverso
        {s:rs(IND.euribor,1.5,4.0),    w:2},  // inverso
        {s:rs(IND.spread2y,0.5,2.0),   w:1},
        {s:rs(IND.spread10y,0.5,2.0),  w:1},
        // INFLAZIONE — risk off quando accelera
        {s:rs(IND.ppiMom,0.0,0.5),     w:3},  // inverso
        {s:rs(IND.ppiCoreMom,0.0,0.4), w:2},
        {s:rs(IND.cpiMom,0.1,0.4),     w:3},
        {s:rs(IND.cpiCoreMom,0.1,0.35),w:3},
        {s:rs(IND.pceMom,0.1,0.35),    w:3},
        {s:rs(IND.ppi,1.5,5.0),        w:2},
        {s:rs(IND.cpi,2.0,4.5),        w:2},
        {s:rs(IND.pce,2.0,4.0),        w:2},
        {s:rs(IND.breakeven,2.0,3.0),  w:2},
        {s:rs(IND.ismPricesPaid,40,90),w:2},  // inverso
        // LIQUIDITÀ E DOLLARO
        {s:rs(IND.m2Dxy,225,200),      w:3},
        {s:rs(IND.dxy,90,110),         w:3},  // inverso: DXY alto = risk off
        // COMMODITY
        {s:rs(IND.oil,50,130),         w:1},  // inverso
        {s:rs(IND.crb,260,450),        w:1},  // inverso
        // EUROPA
        {s:rs(IND.euCpiMom,0.1,0.4),   w:1},
        {s:rs(IND.euPpiMom,-0.5,0.5),  w:1},
        // BREADTH E SENTIMENT (Fear & Greed components)
        {s:(IND.athi!=null&&IND.atlo!=null&&(IND.athi+IND.atlo)>0)?rs(IND.athi/(IND.athi+IND.atlo)*100,70,30):50, w:5},  // breadth: alto = risk on
        {s:rs(IND.trin,0.5,1.5),       w:3},  // inverso: basso = risk on
        {s:rs(IND.spx,8000,5000),      w:5},  // SPX: alto = risk on
        // ── NUOVI ─────────────────────────────────────────
        {s:rs(IND.us10y,2.0,4.0,5.5)*-1+100,              w:2},  // US10Y alto = risk off
        {s:IND.vvixVix!=null?rs(IND.vvixVix,3,7)*-1+100:50, w:2}, // VVIX/VIX alto = risk off
        {s:IND.dtb3!=null?rs(IND.dtb3,2.0,3.5,5.5)*-1+100:50, w:1}, // DTB3 alto = risk off
        {s:IND.sofr!=null?rs(IND.sofr,2.0,3.5,5.5)*-1+100:50, w:1}, // SOFR alto = risk off
        {s:IND.euCpiCoreMom!=null?rs(IND.euCpiCoreMom,0,0.17,0.4)*-1+100:50, w:1}, // EU CPI Core MoM
        {s:IND.euPpiYoy!=null?rs(IND.euPpiYoy,-2,1.5,4.0)*-1+100:50, w:1},  // EU PPI YoY
        {s:IND.btpBund!=null?rs(IND.btpBund,0.5,0.9,2.0)*-1+100:50, w:2},   // BTP-Bund alto = stress
        {s:IND.euur!=null?rs(IND.euur,5,7,12)*-1+100:50,  w:1},              // disoccupazione EU alta = risk off
        {s:IND.eujvr!=null?rs(IND.eujvr,0.5,1.5,3.5)*-1+100:50, w:1},       // job vacancies EU alto = pressione salariale
        {s:IND.de10y!=null?rs(IND.de10y,1.0,2.5,4.0)*-1+100:50, w:1},       // DE10Y alto = BCE hawkish = risk off
        {s:IND.sx5e!=null?rs(IND.sx5e,3500,5000,6500):50, w:2},              // SX5E alto = risk on EU
        {s:IND.eursyy!=null?rs(IND.eursyy,0,1.5,4.0):50, w:1},              // EU retail sales alto = risk on
        {s:IND.deppimm!=null?rs(IND.deppimm,-0.5,0.1,0.5)*-1+100:50, w:1},  // DE PPI MoM alto = risk off
        {s:IND.deppiyy!=null?rs(IND.deppiyy,-2,1.0,4.0)*-1+100:50, w:1},    // DE PPI YoY alto = risk off
      ];
      const totalW=scores.reduce((a,b)=>a+b.w,0);
      const rawScore=scores.reduce((a,b)=>a+b.s*b.w,0)/totalW;
      const riskScore=Math.round(rawScore);

      function riskLabel(s){
        if(s>=75)return"RISK ON FORTE";
        if(s>=60)return"RISK ON";
        if(s>=45)return"NEUTRALE";
        if(s>=30)return"RISK OFF";
        return"RISK OFF FORTE";
      }
      function riskColor(s){
        if(s>=70)return"#10B981";
        if(s>=55)return"#84CC16";
        if(s>=45)return"#F59E0B";
        if(s>=30)return"#F97316";
        return"#EF4444";
      }

      // Allocazione dinamica basata su score + scenari attivi
      const activeScenarios=SCENARIOS.filter(s=>s.active).map(s=>s.id);
      const isStagflation=activeScenarios.includes("stagflation");
      const isDebasement=activeScenarios.includes("debasement");
      const isRecession=activeScenarios.includes("recession");
      const isGoldilocks=activeScenarios.includes("goldilocks");

      let pRisk,pDef,pCash;
      if(riskScore>=70){pRisk=65;pDef=25;pCash=10;}
      else if(riskScore>=55){pRisk=55;pDef=30;pCash=15;}
      else if(riskScore>=45){pRisk=45;pDef=35;pCash=20;}
      else if(riskScore>=30){pRisk=30;pDef=45;pCash=25;}
      else{pRisk=20;pDef=50;pCash=30;}
      // Aggiusta per scenario attivo
      if(isStagflation||isDebasement){pDef+=10;pRisk-=10;}
      if(isRecession){pCash+=10;pRisk-=10;}
      if(isGoldilocks){pRisk+=10;pDef-=10;}

      // ETF classificati per scenario
      const allEtfs=[];const seen2=new Set();
      SCENARIOS.forEach(s=>s.etfs.forEach(e=>{if(!seen2.has(e.t)){seen2.add(e.t);allEtfs.push({...e,scenarioId:s.id,scenarioColor:s.color});}}));

      const RISK_IDS=new Set(["QQQ","XLK","XLY","SMH","IWM","VTI","IXUS","XLI","XLF","EEM","IBIT","SPY","URTH","SX5E","VTV"]);
      const DEF_IDS=new Set(["GLD","TIP","XLU","XLP","TLT","IEF","LQD","DBC","XLE","XME","COPX","FXF"]);
      const CASH_IDS=new Set(["SHY","BIL"]);

      const riskEtfs=allEtfs.filter(e=>!CASH_IDS.has(e.t)&&RISK_IDS.has(e.t))
        .sort((a,b)=>(etfMap[b.t]?.composite??0)-(etfMap[a.t]?.composite??0));

      const defEtfs=allEtfs.filter(e=>!CASH_IDS.has(e.t)&&!RISK_IDS.has(e.t))
        .sort((a,b)=>(etfMap[b.t]?.composite??0)-(etfMap[a.t]?.composite??0));

      const cashEtfs=allEtfs.filter(e=>CASH_IDS.has(e.t))
        .sort((a,b)=>(etfMap[b.t]?.composite??0)-(etfMap[a.t]?.composite??0));

      // Detail page
      if(selRiskBox){
        const boxEtfs=selRiskBox==="risk"?riskEtfs:selRiskBox==="defensive"?defEtfs:cashEtfs;
        const boxLabel=selRiskBox==="risk"?"⚡ Risk Assets":selRiskBox==="defensive"?"🛡️ Difensivi":"💵 Cash";
        const boxPct=selRiskBox==="risk"?pRisk:selRiskBox==="defensive"?pDef:pCash;
        return <div>
          <button onClick={()=>setSelRiskBox(null)} style={{background:"none",border:"1px solid #374151",color:"#94a3b8",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,marginBottom:12}}>← Indietro</button>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:"#f8fafc"}}>{boxLabel}</div>
            <div style={{background:"#1e293b",borderRadius:8,padding:"4px 12px",fontSize:13,fontWeight:800,color:"#F59E0B"}}>{boxPct}% portafoglio</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {boxEtfs.map((e,i)=>{
              const score=etfMap[e.t]?.composite;
              const arr=scoreArrow(score??0);
              return <div key={e.t} style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,gap:6}}>
                  <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:0,flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{background:"#1e293b",color:"#6b7280",fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:4,flexShrink:0}}>#{i+1}</div>
                      <div style={{fontFamily:"monospace",fontSize:14,fontWeight:800,color:"#f8fafc"}}>{e.t}</div>
                    </div>
                    <div style={{fontSize:9,color:"#6b7280",paddingLeft:2}}>{e.n}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                    <div style={{fontFamily:"monospace",fontSize:11,color:"#94a3b8"}}>${e.p?.toFixed(2)}</div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{fontSize:7,color:"#475569",letterSpacing:1}}>AVG.MOM</div>
                      <AvgMomPill v={calcAvgMom(e)} size="lg"/>
                    </div>
                    <span style={{fontSize:13,color:arr.c,fontWeight:800}}>{arr.a}</span>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{fontSize:7,color:"#475569",letterSpacing:1}}>SCORE</div>
                      <ScorePill v={score} size="lg"/>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {[{k:"w",l:"1S"},{k:"m",l:"1M"},{k:"q",l:"3M"},{k:"s",l:"6M"},{k:"y",l:"1A"},{k:"y5",l:"5A"}].map(p=>(
                    <div key={p.k} style={{flex:1,minWidth:36,background:"#0a0a14",borderRadius:5,padding:"5px 4px",textAlign:"center"}}>
                      <div style={{fontSize:7,color:"#4b5563",marginBottom:1}}>{p.l}</div>
                      <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:e[p.k]!=null&&e[p.k]>=0?"#10B981":"#EF4444"}}>
                        {e[p.k]!=null?(e[p.k]>=0?"+":"")+e[p.k].toFixed(1)+"%":"—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>;
            })}
          </div>
        </div>;
      }

      // Main Risk On/Off view
      const col=riskColor(riskScore);
      const pct=riskScore/100;
      return <div>
        <div style={{fontSize:8,color:"#6b7280",letterSpacing:2,marginBottom:16}}>RISK ON / RISK OFF — score da 62 indicatori macro · agg. {LAST_UPDATE}</div>

        {/* Gauge barra orizzontale */}
        <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:14,padding:20,marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:800,color:"#f8fafc",marginBottom:4}}>Risk On / Risk Off</div>
          <div style={{fontSize:10,color:"#6b7280",marginBottom:20}}>Score composito da 62 indicatori macro con pesi differenziati</div>

          {/* Barra gradiente */}
          <div style={{position:"relative",marginBottom:8}}>
            <div style={{height:14,borderRadius:7,background:"linear-gradient(to right, #EF4444, #F97316, #F59E0B, #84CC16, #10B981)",position:"relative"}}>
              {/* Indicatore */}
              <div style={{position:"absolute",top:-6,left:`calc(${riskScore}% - 8px)`,width:16,height:26,background:"#fff",borderRadius:3,boxShadow:"0 0 8px rgba(255,255,255,0.6)",border:"2px solid #0f172a"}}/>
            </div>
            {/* Labels */}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <div style={{fontSize:8,color:"#EF4444",fontWeight:600}}>Ext. Risk Off</div>
              <div style={{fontSize:8,color:"#F59E0B",fontWeight:600}}>Neutral</div>
              <div style={{fontSize:8,color:"#10B981",fontWeight:600}}>Ext. Risk On</div>
            </div>
          </div>

          {/* Badge score */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:16,marginBottom:8}}>
            <div style={{background:col+"22",border:"1px solid "+col,borderRadius:8,padding:"6px 16px",fontSize:13,fontWeight:800,color:col,letterSpacing:1}}>{riskLabel(riskScore)}</div>
            <div style={{fontFamily:"monospace",fontSize:36,fontWeight:900,color:col}}>{riskScore}<span style={{fontSize:14,color:"#6b7280"}}>%</span></div>
          </div>
        </div>

        {/* Tre caselle allocazione */}
        <div style={{display:"flex",gap:8,marginBottom:4}}>
          {[
            {key:"defensive",label:"Difensivo",pct:pDef,etfs:defEtfs,col:"#6366F1"},
            {key:"risk",     label:"Risk Assets",pct:pRisk,etfs:riskEtfs,col:"#10B981"},
            {key:"cash",     label:"Cash",pct:pCash,etfs:cashEtfs,col:"#94a3b8"},
          ].map(box=>(
            <div key={box.key} onClick={()=>setSelRiskBox(box.key)} style={{flex:1,background:"#0f172a",border:"1px solid "+box.col+"55",borderRadius:12,padding:14,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:6,fontWeight:600}}>{box.label}</div>
              <div style={{fontFamily:"monospace",fontSize:28,fontWeight:900,color:box.col}}>{box.pct}%</div>
              <div style={{fontSize:8,color:"#374151",marginTop:6}}>{box.etfs.length} ETF › tap per dettaglio</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:8,color:"#374151",textAlign:"center",marginTop:6}}>Scenario attivo: {activeScenarios.join(" + ").toUpperCase() || "nessuno"} · Score {riskScore}/100</div>
      </div>;
    })()}

    {tab==="etfattivi"&&<div>
      {(()=>{
        const seen=new Set(),allU=[];
        SCENARIOS.forEach(s=>s.etfs.forEach(e=>{if(!seen.has(e.t)){seen.add(e.t);allU.push(e);}}));

        // Top 2 scenari per media(3M+6M)
        const top2=[...SCENARIOS].sort((a,b)=>{
          const aS=(a.avg.s??-999)*0.70+(a.avg.q??-999)*0.30;
          const bS=(b.avg.s??-999)*0.70+(b.avg.q??-999)*0.30;
          return bS-aS;
        }).slice(0,2);

        const coreTickers=new Set();
        top2.forEach(s=>s.etfs.forEach(e=>coreTickers.add(e.t)));

        const coreEtfs=allU
          .filter(e=>coreTickers.has(e.t))
          .sort((a,b)=>(etfMap[b.t]?.composite??0)-(etfMap[a.t]?.composite??0));

        const satelliteEtfs=allU
          .sort((a,b)=>(etfMap[b.t]?.composite??-999)-(etfMap[a.t]?.composite??-999));

        function EtfCard({e,i,border}){
          const score=etfMap[e.t]?.composite;
          const arr=scoreArrow(score??0);
          return <div style={{background:"#0f172a",border:"1px solid "+border,borderRadius:10,padding:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:6}}>
              <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:0,flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{background:"#1e293b",color:"#6b7280",fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:4,flexShrink:0}}>#{i+1}</div>
                  <div style={{fontFamily:"monospace",fontSize:15,fontWeight:800,color:"#f8fafc"}}>{e.t}</div>
                </div>
                <div style={{fontSize:9,color:"#6b7280",paddingLeft:2}}>{e.n}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <div style={{fontFamily:"monospace",fontSize:11,color:"#94a3b8"}}>${e.p?.toFixed(2)}</div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{fontSize:7,color:"#475569",letterSpacing:1}}>AVG.MOM</div>
                  <AvgMomPill v={calcAvgMom(e)} size="lg"/>
                </div>
                <span style={{fontSize:13,color:arr.c,fontWeight:800}}>{arr.a}</span>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{fontSize:7,color:"#475569",letterSpacing:1}}>SCORE</div>
                  <ScorePill v={score} size="lg"/>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {[{k:"w",l:"1S"},{k:"m",l:"1M"},{k:"q",l:"3M"},{k:"s",l:"6M"},{k:"y",l:"1A"},{k:"y2",l:"2A"},{k:"y3",l:"3A"},{k:"y5",l:"5A"}].map(p=>(
                <div key={p.k} style={{flex:1,minWidth:36,background:"#0a0a14",borderRadius:5,padding:"5px 4px",textAlign:"center"}}>
                  <div style={{fontSize:7,color:"#4b5563",marginBottom:1}}>{p.l}</div>
                  <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:e[p.k]!=null&&e[p.k]>=0?"#10B981":"#EF4444"}}>
                    {e[p.k]!=null?(e[p.k]>=0?"+":"")+e[p.k].toFixed(1)+"%":"—"}
                  </div>
                </div>
              ))}
            </div>
          </div>;
        }

        return <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:8,padding:"8px 12px",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:800,color:"#F59E0B",marginBottom:2}}>CORE</div>
              <div style={{fontSize:8,color:"#6b7280"}}>
                Top 2 scenari per 3M+6M: {top2.map(s=><span key={s.id} style={{color:s.color,fontWeight:700,marginRight:6}}>{s.name}</span>)} · ordinati per momentum
              </div>
            </div>
            {coreEtfs.length===0
              ?<div style={{padding:16,textAlign:"center",fontSize:11,color:"#6b7280"}}>Nessun ETF con momentum &gt;60</div>
              :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                {coreEtfs.map((e,i)=><EtfCard key={e.t} e={e} i={i} border="rgba(245,158,11,0.4)"/>)}
              </div>
            }
          </div>
          <div>
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:8,padding:"8px 12px",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:800,color:"#818cf8",marginBottom:2}}>SATELLITE</div>
              <div style={{fontSize:8,color:"#6b7280"}}>Tutti gli scenari · ordinati per media(1W+1M)/2</div>
            </div>
            {satelliteEtfs.length===0
              ?<div style={{padding:16,textAlign:"center",fontSize:11,color:"#6b7280"}}>Nessun ETF con momentum &gt;70</div>
              :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                {satelliteEtfs.map((e,i)=><EtfCard key={e.t} e={e} i={i} border="rgba(129,140,248,0.4)"/>)}
              </div>
            }
          </div>
        </div>;
      })()}
    </div>}


    {tab==="etfnaz"&&<div>
      {(()=>{
        // Calcola momentum score identico a calcAllEtfScores
        const nazRaw=ETF_NAZIONALI.map(e=>{
          let s=0,tw=0;
          const W={w:0.25,m:0.40,q:0.20,s:0.10,y:0.05};
          Object.entries(W).forEach(([k,w])=>{if(e[k]!=null){s+=e[k]*w;tw+=w;}});
          return{...e,raw:tw>0?s/tw:null};
        });
        const nazVals=nazRaw.map(e=>e.raw).filter(v=>v!=null);
        const nazMn=Math.min(...nazVals),nazMx=Math.max(...nazVals);
        const nazSortedForRank=[...nazRaw].sort((a,b)=>(a.raw??-999)-(b.raw??-999));
        const nazN=nazSortedForRank.length;
        const nazWithScore=nazRaw.map(e=>{
          if(e.raw==null)return{...e,score:null};
          const rank=(nazSortedForRank.findIndex(x=>x.t===e.t)/(nazN-1))*100;
          const norm=nazMx!==nazMn?(e.raw-nazMn)/(nazMx-nazMn)*100:50;
          return{...e,score:Math.round(rank*0.75+norm*0.25)};
        }).sort((a,b)=>(b.score??-999)-(a.score??-999));

        function NazCard({e,i}){
          const arr=scoreArrow(e.score??0);
          return <div style={{background:"#0f172a",border:"1px solid rgba(16,185,129,0.3)",borderRadius:10,padding:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:6}}>
              <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:0,flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{background:"#1e293b",color:"#6b7280",fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:4,flexShrink:0}}>#{i+1}</div>
                  <div style={{fontFamily:"monospace",fontSize:15,fontWeight:800,color:"#f8fafc"}}>{e.t}</div>
                </div>
                <div style={{fontSize:9,color:"#6b7280",paddingLeft:2}}>{e.n}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <div style={{fontFamily:"monospace",fontSize:11,color:"#94a3b8"}}>${e.p?.toFixed(2)}</div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{fontSize:7,color:"#475569",letterSpacing:1}}>AVG.MOM</div>
                  <AvgMomPill v={calcAvgMom(e)} size="lg"/>
                </div>
                <span style={{fontSize:13,color:arr.c,fontWeight:800}}>{arr.a}</span>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{fontSize:7,color:"#475569",letterSpacing:1}}>SCORE</div>
                  <ScorePill v={e.score} size="lg"/>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {[{k:"w",l:"1S"},{k:"m",l:"1M"},{k:"q",l:"3M"},{k:"s",l:"6M"},{k:"y",l:"1A"},{k:"y2",l:"2A"},{k:"y3",l:"3A"},{k:"y5",l:"5A"}].map(p=>(
                <div key={p.k} style={{flex:1,minWidth:36,background:"#0a0a14",borderRadius:5,padding:"5px 4px",textAlign:"center"}}>
                  <div style={{fontSize:7,color:"#4b5563",marginBottom:1}}>{p.l}</div>
                  <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:e[p.k]!=null&&e[p.k]>=0?"#10B981":"#EF4444"}}>
                    {e[p.k]!=null?(e[p.k]>=0?"+":"")+e[p.k].toFixed(1)+"%":"—"}
                  </div>
                </div>
              ))}
            </div>
          </div>;
        }

        return <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{fontSize:8,color:"#6b7280",letterSpacing:1,marginBottom:4}}>ETF NAZIONALI — 26 paesi · ordinati per momentum ↓ · agg. {LAST_UPDATE}</div>
          {nazWithScore.map((e,i)=><NazCard key={e.t} e={e} i={i}/>)}
        </div>;
      })()}
    </div>}

    {tab==="indicatori"&&selLead&&(()=>{
      const s=SCENARIOS.find(x=>x.id===selLead);
      if(!s) return null;
      const cfg=SCENARIO_CFG[selLead]||[];
      const totalW=cfg.reduce((a,b)=>a+b.w,0);
      const leadScore=leadMap[selLead];
      return <div>
        <button onClick={()=>setSelLead(null)} style={{background:"none",border:"1px solid #374151",color:"#94a3b8",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,marginBottom:12}}>← Indietro</button>
        {/* Header */}
        <div style={{background:"#0f172a",border:"1px solid "+s.color,borderRadius:12,padding:14,marginBottom:12,boxShadow:"0 0 14px "+s.color+"22"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{fontSize:14,fontWeight:800,color:s.color,letterSpacing:1}}>{s.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:9,color:"#4b5563"}}>LEADING SCORE</div>
              <ScorePill v={leadScore} size="lg"/>
            </div>
          </div>
          <div style={{fontSize:10,color:"#6b7280",marginBottom:10}}>{s.desc}</div>
          <div style={{height:5,background:"#1e293b",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:(leadScore??0)+"%",background:scoreColor(leadScore),borderRadius:3}}/>
          </div>
          <div style={{fontSize:8,color:"#374151",marginTop:6}}>Score calcolato su {cfg.length} indicatori macro · pesi normalizzati</div>
        </div>
        {/* Indicatori che compongono il leading score */}
        <div style={{fontSize:9,color:"#6b7280",letterSpacing:2,marginBottom:8}}>INDICATORI COMPONENTI</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[...cfg].sort((a,b)=>{
            const va=INDICATORS[a.id],vb=INDICATORS[b.id];
            const sa=va!=null&&!isNaN(va)?signalScore(va,a.dir,a.good,a.bad):0;
            const sb=vb!=null&&!isNaN(vb)?signalScore(vb,b.dir,b.good,b.bad):0;
            return sb-sa;
          }).map((c,i)=>{
            const meta=IND_META[c.id];
            const trend=TRENDS[c.id];
            const value=INDICATORS[c.id];
            const hasVal=value!=null&&!isNaN(value);
            const sig=hasVal?compositeSignal(c.id,c.dir,c.good,c.bad):50;
            const sigNom=hasVal?signalScore(value,c.dir,c.good,c.bad):50;
            const sigVar=hasVal?variationScore(c.id,c.dir,c.good,c.bad):50;
            const vCol=hasVal?valueColor(c.id,value):"#374151";
            const aCol=arrowColor(c.id,trend?.dir||"-");
            const wPct=Math.round((c.w/totalW)*100);
            const contribution=hasVal?(sig*c.w/totalW).toFixed(1):null;
            return <div key={i} style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:14}}>
              {/* Top row */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:8,flexWrap:"wrap"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#94a3b8"}}>{meta?.label||c.id}</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  
                  <div style={{fontFamily:"monospace",fontSize:20,fontWeight:800,color:vCol}}>{hasVal?meta?.fmt(value):"—"}</div>
                </div>
              </div>
              {/* Score nominale puro */}
              <div style={{display:"flex",gap:6,marginBottom:6}}>
                <div style={{flex:1,background:"#080812",borderRadius:6,padding:"5px 8px",textAlign:"center",border:"1px solid #F59E0B44"}}>
                  <div style={{fontSize:7,color:"#F59E0B",marginBottom:2,fontWeight:700}}>SCORE</div>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:scoreColor(sigNom)}}>{Math.round(sigNom)}</div>
                </div>
              </div>
              {/* Variazione vs precedente + soglie */}
              {PREV_INDICATORS[c.id]!=null&&<div style={{fontSize:9,color:"#4b5563",marginBottom:6,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <span style={{fontFamily:"monospace",color:"#6b7280"}}>{meta?.fmt(PREV_INDICATORS[c.id])}</span>
                <span style={{color:"#4b5563"}}>→</span>
                <span style={{fontFamily:"monospace",color:vCol,fontWeight:700}}>{meta?.fmt(value)}</span>
                <span style={{color:"#4b5563",fontWeight:700}}>
                  {value>PREV_INDICATORS[c.id]?"↑":value<PREV_INDICATORS[c.id]?"↓":"="}
                  {" "}({value>PREV_INDICATORS[c.id]?"+":""}{(value-PREV_INDICATORS[c.id]).toFixed(2)})
                </span>
                <span style={{color:"#4b5563",marginLeft:8}}>Ottimo: <span style={{fontFamily:"monospace",fontWeight:700,color:"#4b5563"}}>{c.dir==="high"?`≥${c.good}`:c.dir==="low"?`≤${c.good}`:c.good}</span></span>
                <span style={{color:"#4b5563"}}>Critico: <span style={{fontFamily:"monospace",fontWeight:700,color:"#4b5563"}}>{c.dir==="high"?`≤${c.bad}`:c.dir==="low"?`≥${c.bad}`:c.bad}</span></span>
              </div>}
              {/* Peso e contributo */}
              <div style={{display:"flex",gap:16,marginBottom:8}}>
                <div style={{fontSize:9,color:"#4b5563"}}>Peso scenario: <span style={{color:"#F59E0B",fontWeight:700}}>{wPct}%</span></div>
                <div style={{fontSize:9,color:"#4b5563"}}>Contributo: <span style={{color:scoreColor(sig),fontWeight:700}}>{contribution?"+"+contribution+" pt":"—"}</span></div>
                <div style={{fontSize:9,color:"#4b5563"}}>Direzione attesa: <span style={{color:"#94a3b8",fontWeight:700}}>{c.dir==="high"?"↑ Alto":c.dir==="low"?"↓ Basso":"± Neutro"}</span></div>
              </div>
            </div>;
          })}
        </div>
      </div>;
    })()}

    {tab==="indicatori"&&!selLead&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Leading score per scenario */}
      <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:14}}>
        <div style={{fontSize:9,color:"#6b7280",letterSpacing:2,marginBottom:4}}>LEADING SCORE PER SCENARIO</div>
        <div style={{fontSize:8,color:"#374151",marginBottom:10}}>45 indicatori macro da claude checklist — agg. {LAST_UPDATE}</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[...SCENARIOS].sort((a,b)=>(leadMap[b.id]??-999)-(leadMap[a.id]??-999)).map(s=>{
            const l=leadMap[s.id];
            return <div key={s.id} onClick={()=>setSelLead(s.id)} style={{display:"flex",flexDirection:"row",alignItems:"center",gap:10,padding:"0 10px",background:"#080812",borderRadius:7,cursor:"pointer",height:38,boxSizing:"border-box"}}>
              <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:s.color,width:160,flexShrink:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
              <div style={{flex:1,height:5,background:"#1e293b",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:(l??0)+"%",background:scoreColor(l),borderRadius:3}}/>
              </div>
              <div style={{display:"flex",flexDirection:"row",alignItems:"center",gap:6,flexShrink:0}}>
                <ScorePill v={l}/>
                <div style={{fontSize:9,color:scoreColor(l),fontWeight:700,width:52,textAlign:"left"}}>{(l??0)>=70?"▲ Forte":(l??0)>=40?"→ Neutro":"▼ Debole"}</div>
              </div>
              <div style={{fontSize:12,color:"#374151",flexShrink:0}}>›</div>
            </div>;
          })}
        </div>
      </div>

      {/* Griglia indicatori per categoria */}
      {[
        {label:"💰 LIQUIDITÀ E MONETARIO", ids:["m2Dxy","dtb3","sofr"]},
        {label:"🛢️ COMMODITY",              ids:["bdi","copperGold","oil","crb"]},
        {label:"🔴 INFLAZIONE E PREZZI USA",ids:["ppiMom","ppiCoreMom","cpiMom","cpiCoreMom","pceMom","ppi","cpi","pce","breakeven","ismPricesPaid"]},
        {label:"🇪🇺 INFLAZIONE EUROPA",     ids:["euPpiMom","euPpiYoy","euCpiMom","euCpiCoreMom","euCpi","deppimm","deppiyy","eursyy"]},
        {label:"📉 CICLO ECONOMICO",        ids:["lei","ismNewOrders","ismEmployment","ism","ifo","cfnai","housingStarts","retailSales"]},
        {label:"💼 MERCATO DEL LAVORO",     ids:["nfp","jobless","euur","eujvr"]},
        {label:"📊 TASSI E CREDITO",        ids:["us2y","us10y","yieldCurve","realYield","de02y","de10y","deCurve","euRealYield","euribor","dxy","spread2y","spread10y","hySpread","igSpread","emSpread","btpBund"]},
        {label:"😰 SENTIMENT",              ids:["vix","move","vvixVix","pcc","pcce","trin","athi","atlo","spx","sx5e","eurusd"]},
      ].map(cat=>(
        <div key={cat.label}>
          <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:1,marginBottom:8,marginTop:4,paddingBottom:6,borderBottom:"1px solid #1f2937"}}>{cat.label}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {cat.ids.map(id=>{
              const meta=IND_META[id]; if(!meta) return null;
              const value=INDICATORS[id];
              const hasVal=value!==null&&value!==undefined&&!isNaN(value);
              const trend=TRENDS[id];
              const vCol=hasVal?valueColor(id,value):"#374151";
              const aCol=arrowColor(id,trend?.dir||"-");
              const activeSignals=SCENARIOS.filter(s=>s.active).map(s=>{
                const cfg=SCENARIO_CFG[s.id]?.find(c=>c.id===id);
                return cfg&&hasVal?signalScore(value,cfg.dir,cfg.good,cfg.bad):null;
              }).filter(v=>v!==null);
              const avgSig=activeSignals.length?activeSignals.reduce((a,b)=>a+b,0)/activeSignals.length:50;
              return <div key={id} style={{background:"#0f172a",border:"1px solid "+(hasVal?vCol+"44":"#1f2937"),borderRadius:10,padding:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
                  <div style={{fontSize:12,color:"#94a3b8",fontWeight:600}}>{meta.label}</div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontFamily:"monospace",fontSize:22,fontWeight:800,color:vCol}}>
                      {hasVal?meta.fmt(value):"—"}
                    </div>
                    
                  </div>
                </div>
                {hasVal&&<div style={{height:4,background:"#1e293b",borderRadius:2,overflow:"hidden",marginBottom:10}}>
                  <div style={{height:"100%",width:avgSig+"%",background:vCol,borderRadius:2}}/>
                </div>}
                <div style={{fontSize:12,color:"#6b7280",lineHeight:1.8,whiteSpace:"pre-line"}}>{meta.desc}</div>
              </div>;
            })}
          </div>
        </div>
      ))}
    </div>}


    {tab==="banche"&&(()=>{

      function hs(v,dovish,neutral,hawkish){
        if(v===null||v===undefined||isNaN(v))return 50;
        if(v<=dovish)return 0;if(v>=hawkish)return 100;
        if(v<=neutral)return((v-dovish)/(neutral-dovish))*50;
        return 50+((v-neutral)/(hawkish-neutral))*50;
      }
      function hsi(v,dovish,neutral,hawkish){return 100-hs(v,dovish,neutral,hawkish);}

      const IND=INDICATORS;

      function catScore(inds){
        const valid=inds.filter(x=>x.score!=null&&!isNaN(x.score));
        return valid.length?Math.round(valid.reduce((a,b)=>a+b.score,0)/valid.length):50;
      }
      function panelScore(groups){
        const cats=groups.map(g=>catScore(g.inds));
        return Math.round(cats.reduce((a,b)=>a+b,0)/cats.length);
      }
      function hawkColor(s){
        if(s>=70)return"#EF4444";if(s>=55)return"#F97316";if(s>=42)return"#F59E0B";return"#10B981";
      }
      function hawkLabel(s){
        if(s>=75)return"HAWKISH FORTE";if(s>=60)return"HAWKISH";if(s>=50)return"NEUTRO/HAWKISH";
        if(s>=38)return"NEUTRO/DOVISH";if(s>=25)return"DOVISH";return"DOVISH FORTE";
      }

      // Freccia: verde se va nella direzione buona per hawkish, rossa altrimenti
      function arrowEl(id,customGoodDir){
        const trend=TRENDS[id];
        if(!trend||!trend.dir||trend.dir==="-")return null;
        const good=customGoodDir||GOOD_DIR[id];
        if(!good)return null;
        const color=trend.dir===good?"#10B981":"#EF4444";
        return <span style={{fontSize:14,fontWeight:900,color}}>{trend.dir}</span>;
      }

      // ── INDICATORI FED ────────────────────────────────────
      const fedGroups=[
        {group:"📊 INFLAZIONE", inds:[
          {label:"PPI MoM",         val:IND.ppiMom,        score:hs(IND.ppiMom,-0.2,0.2,0.5),       fmt:`${IND.ppiMom?.toFixed(2)}%`,       id:"ppiMom"},
          {label:"PPI Core MoM",    val:IND.ppiCoreMom,    score:hs(IND.ppiCoreMom,-0.1,0.15,0.4),  fmt:`${IND.ppiCoreMom?.toFixed(2)}%`,   id:"ppiCoreMom"},
          {label:"CPI MoM",         val:IND.cpiMom,        score:hs(IND.cpiMom,-0.1,0.15,0.4),      fmt:`${IND.cpiMom?.toFixed(2)}%`,       id:"cpiMom"},
          {label:"CPI Core MoM",    val:IND.cpiCoreMom,    score:hs(IND.cpiCoreMom,-0.1,0.17,0.35), fmt:`${IND.cpiCoreMom?.toFixed(2)}%`,   id:"cpiCoreMom"},
          {label:"PCE Core MoM",    val:IND.pceMom,        score:hs(IND.pceMom,-0.1,0.17,0.35),     fmt:`${IND.pceMom?.toFixed(2)}%`,       id:"pceMom"},
          {label:"PPI YoY",         val:IND.ppi,           score:hs(IND.ppi,0,2.0,5.0),             fmt:`${IND.ppi?.toFixed(1)}%`,          id:"ppi"},
          {label:"CPI YoY",         val:IND.cpi,           score:hs(IND.cpi,1.0,2.0,4.5),           fmt:`${IND.cpi?.toFixed(1)}%`,          id:"cpi"},
          {label:"PCE Core YoY",    val:IND.pce,           score:hs(IND.pce,1.0,2.0,3.5),           fmt:`${IND.pce?.toFixed(1)}%`,          id:"pce"},
          {label:"Breakeven 5Y",    val:IND.breakeven,     score:hs(IND.breakeven,1.8,2.2,3.0),     fmt:`${IND.breakeven?.toFixed(2)}%`,    id:"breakeven"},
          {label:"ISM Prices Paid", val:IND.ismPricesPaid, score:hs(IND.ismPricesPaid,40,55,75),    fmt:`${IND.ismPricesPaid?.toFixed(1)}`, id:"ismPricesPaid"},
        ]},
        {group:"💼 LAVORO / CICLO", inds:[
          {label:"NFP",             val:IND.nfp,           score:hs(IND.nfp,80,180,350),            fmt:`+${IND.nfp?.toFixed(0)}K`,         id:"nfp"},
          {label:"Jobless Claims",  val:IND.jobless,       score:hsi(IND.jobless,380,250,180),      fmt:`${IND.jobless?.toFixed(0)}K`,      id:"jobless"},
          {label:"ISM PMI",         val:IND.ism,           score:hs(IND.ism,43,50,57),              fmt:`${IND.ism?.toFixed(1)}`,           id:"ism"},
          {label:"ISM Employment",  val:IND.ismEmployment, score:hs(IND.ismEmployment,43,50,55),   fmt:`${IND.ismEmployment?.toFixed(1)}`, id:"ismEmployment"},
          {label:"ISM New Orders",  val:IND.ismNewOrders,  score:hs(IND.ismNewOrders,43,50,57),    fmt:`${IND.ismNewOrders?.toFixed(1)}`,  id:"ismNewOrders"},
          {label:"CFNAI",           val:IND.cfnai,         score:hs(IND.cfnai,-0.7,0,0.5),         fmt:`${IND.cfnai?.toFixed(2)}`,         id:"cfnai"},
          {label:"Housing Starts",  val:IND.housingStarts, score:hs(IND.housingStarts,900,1300,1800),fmt:`${IND.housingStarts?.toFixed(0)}K`,id:"housingStarts"},
          {label:"Retail Sales YoY",val:IND.retailSales,   score:hs(IND.retailSales,0,2.5,6.0),    fmt:`${IND.retailSales?.toFixed(1)}%`,  id:"retailSales"},
        ]},
        {group:"📈 TASSI / CURVA", inds:[
          {label:"US02Y",           val:IND.us2y,          score:hs(IND.us2y,2.0,3.5,5.5),          fmt:`${IND.us2y?.toFixed(3)}%`,         id:"us2y"},
          {label:"US10Y",           val:IND.us10y,         score:hs(IND.us10y,2.0,3.5,5.5),         fmt:`${IND.us10y?.toFixed(3)}%`,        id:"us10y"},
          {label:"Yield Curve 10-2",val:IND.yieldCurve,   score:hs(IND.yieldCurve,-1.0,0,1.5),    fmt:`${IND.yieldCurve?.toFixed(2)}%`,   id:"yieldCurve"},
          {label:"Real Yield TIPS", val:IND.realYield,    score:hs(IND.realYield,-0.5,0.5,2.5),   fmt:`${IND.realYield?.toFixed(2)}%`,    id:"realYield"},
          {label:"DTB3 T-Bill 3M",  val:IND.dtb3,         score:hs(IND.dtb3,2.0,3.5,5.5),         fmt:`${IND.dtb3?.toFixed(2)}%`,         id:"dtb3"},
          {label:"SOFR",            val:IND.sofr,         score:hs(IND.sofr,2.0,3.5,5.5),         fmt:`${IND.sofr?.toFixed(2)}%`,         id:"sofr"},
          {label:"Spread DTB3-SOFR",val:IND.dtb3!=null&&IND.sofr!=null?+(IND.dtb3-IND.sofr).toFixed(2):null,
            score:hs(IND.dtb3!=null&&IND.sofr!=null?IND.dtb3-IND.sofr:0,-0.2,0,0.5),
            fmt:IND.dtb3!=null&&IND.sofr!=null?`${(IND.dtb3-IND.sofr).toFixed(2)}%`:"—",id:"dtb3sofr"},
        ]},
        {group:"💳 CREDITO / SPREAD", inds:[
          {label:"HY Spread",       val:IND.hySpread,     score:hsi(IND.hySpread,8.0,4.0,2.5),    fmt:`${IND.hySpread?.toFixed(2)}%`,     id:"hySpread"},
          {label:"IG Spread",       val:IND.igSpread,     score:hsi(IND.igSpread,2.5,1.2,0.6),    fmt:`${IND.igSpread?.toFixed(2)}%`,     id:"igSpread"},
          {label:"EM Spread",       val:IND.emSpread,     score:hsi(IND.emSpread,8.0,4.0,2.5),    fmt:`${IND.emSpread?.toFixed(2)}%`,     id:"emSpread"},
          {label:"MOVE Index",      val:IND.move,         score:hsi(IND.move,130,90,70),           fmt:`${IND.move?.toFixed(1)}`,          id:"move"},
          // Spread US-DE Fed: scende = Fed meno hawkish della BCE = freccia VERDE ↓
          {label:"Spread US-DE 2Y", val:IND.spread2y,    score:hs(IND.spread2y,0.3,1.0,2.0),     fmt:`${IND.spread2y?.toFixed(3)}%`,     id:"spread2y",  goodDir:"↓"},
          {label:"Spread US-DE 10Y",val:IND.spread10y,   score:hs(IND.spread10y,0.3,1.0,2.0),    fmt:`${IND.spread10y?.toFixed(3)}%`,    id:"spread10y", goodDir:"↓"},
        ]},
        {group:"😰 SENTIMENT / MERCATI", inds:[
          {label:"VIX",             val:IND.vix,          score:hsi(IND.vix,40,25,13),             fmt:`${IND.vix?.toFixed(1)}`,           id:"vix"},
          {label:"PCC",             val:IND.pcc,          score:hs(IND.pcc,0.6,0.9,1.3),          fmt:`${IND.pcc?.toFixed(3)}`,           id:"pcc"},
          {label:"PCCE",            val:IND.pcce,         score:hs(IND.pcce,0.5,0.8,1.2),         fmt:`${IND.pcce?.toFixed(3)}`,          id:"pcce"},
          {label:"S&P 500",         val:IND.spx,          score:hs(IND.spx,4500,6000,8000),        fmt:`${IND.spx?.toFixed(0)}`,           id:"spx"},
          {label:"M2/DXY",          val:IND.m2Dxy,        score:hs(IND.m2Dxy,200,220,240),         fmt:`${IND.m2Dxy?.toFixed(1)}`,         id:"m2Dxy"},
          {label:"DXY",             val:IND.dxy,          score:hsi(IND.dxy,110,102,95),           fmt:`${IND.dxy?.toFixed(2)}`,           id:"dxy"},
          {label:"Oil WTI",         val:IND.oil,          score:hs(IND.oil,50,80,110),             fmt:`$${IND.oil?.toFixed(1)}`,          id:"oil"},
          {label:"CRB",             val:IND.crb,          score:hs(IND.crb,260,370,430),           fmt:`${IND.crb?.toFixed(0)}`,           id:"crb"},
        ]},
      ];

      // ── INDICATORI BCE ────────────────────────────────────
      const bceGroups=[
        {group:"📊 INFLAZIONE", inds:[
          {label:"EU PPI MoM",      val:IND.euPpiMom,     score:hs(IND.euPpiMom,-0.5,0.1,0.5),    fmt:`${IND.euPpiMom?.toFixed(2)}%`,     id:"euPpiMom"},
          {label:"EU CPI MoM",      val:IND.euCpiMom,     score:hs(IND.euCpiMom,-0.1,0.17,0.4),   fmt:`${IND.euCpiMom?.toFixed(2)}%`,     id:"euCpiMom"},
          {label:"EU CPI Core MoM", val:IND.euCpiCoreMom, score:hs(IND.euCpiCoreMom,-0.1,0.17,0.35),fmt:`${IND.euCpiCoreMom?.toFixed(2)}%`,id:"euCpiCoreMom"},
          {label:"DE PPI MoM",      val:IND.deppimm,      score:hs(IND.deppimm!=null?IND.deppimm:0,-0.5,0.1,0.5),fmt:IND.deppimm!=null?`${IND.deppimm?.toFixed(2)}%`:"—",id:"deppimm"},
          {label:"EU PPI YoY",      val:IND.euPpiYoy,     score:hs(IND.euPpiYoy,-2.0,1.5,4.0),    fmt:`${IND.euPpiYoy?.toFixed(1)}%`,     id:"euPpiYoy"},
          {label:"EU CPI YoY",      val:IND.euCpi,        score:hs(IND.euCpi,0.5,2.0,4.0),        fmt:`${IND.euCpi?.toFixed(1)}%`,        id:"euCpi"},
          {label:"DE PPI YoY",      val:IND.deppiyy,      score:hs(IND.deppiyy!=null?IND.deppiyy:0,-2.0,1.0,4.0),fmt:IND.deppiyy!=null?`${IND.deppiyy?.toFixed(1)}%`:"—",id:"deppiyy"},
          {label:"EU Retail Sales",  val:IND.eursyy,      score:hs(IND.eursyy!=null?IND.eursyy:0,0,1.5,4.0),fmt:IND.eursyy!=null?`${IND.eursyy?.toFixed(1)}%`:"—",id:"eursyy"},
        ]},
        {group:"💼 LAVORO / CICLO", inds:[
          {label:"EUUR Disoccupazione",val:IND.euur,      score:hsi(IND.euur!=null?IND.euur:7,12,7,5),fmt:IND.euur!=null?`${IND.euur?.toFixed(1)}%`:"—",id:"euur"},
          {label:"EUJVR Job Vacancies",val:IND.eujvr,    score:hs(IND.eujvr!=null?IND.eujvr:0,0.5,1.5,3.5),fmt:IND.eujvr!=null?`${IND.eujvr?.toFixed(1)}%`:"—",id:"eujvr"},
          {label:"IFO Germania",     val:IND.ifo,         score:hs(IND.ifo,80,97,108),             fmt:`${IND.ifo?.toFixed(0)}`,           id:"ifo"},
          {label:"CLI OCSE",         val:IND.lei,         score:hs(IND.lei,98,100.5,103),          fmt:`${IND.lei?.toFixed(2)}`,           id:"lei"},
        ]},
        {group:"📈 TASSI / CURVA", inds:[
          {label:"Euribor 3M",       val:IND.euribor,     score:hs(IND.euribor,1.0,2.0,4.0),      fmt:`${IND.euribor?.toFixed(3)}%`,      id:"euribor"},
          {label:"DE02Y",            val:IND.de02y,       score:hs(IND.de02y,1.0,2.0,4.0),        fmt:`${IND.de02y?.toFixed(3)}%`,        id:"de02y"},
          {label:"DE10Y",            val:IND.de10y,       score:hs(IND.de10y!=null?IND.de10y:0,1.0,2.5,4.0),fmt:IND.de10y!=null?`${IND.de10y?.toFixed(3)}%`:"—",id:"de10y"},
          {label:"DE Yield Curve",   val:IND.deCurve,     score:hs(IND.deCurve!=null?IND.deCurve:0,-0.5,0.3,1.5),fmt:IND.deCurve!=null?`${IND.deCurve?.toFixed(3)}%`:"—",id:"deCurve"},
          {label:"EU Real Yield",    val:IND.euRealYield, score:hs(IND.euRealYield!=null?IND.euRealYield:0,-0.5,0.3,2.0),fmt:IND.euRealYield!=null?`${IND.euRealYield?.toFixed(2)}%`:"—",id:"euRealYield"},
        ]},
        {group:"💳 CREDITO / SPREAD", inds:[
          {label:"EM Spread",        val:IND.emSpread,    score:hsi(IND.emSpread,8.0,4.0,2.5),    fmt:`${IND.emSpread?.toFixed(2)}%`,     id:"emSpread"},
          {label:"BTP-Bund",         val:IND.btpBund,     score:hsi(IND.btpBund,2.0,0.9,0.5),    fmt:`${(IND.btpBund*100).toFixed(1)}bp`,id:"btpBund"},
          // Spread US-DE BCE: scende = BCE più hawkish della Fed = freccia ROSSA ↓
          {label:"Spread US-DE 2Y",  val:IND.spread2y,   score:hsi(IND.spread2y,2.0,1.2,0.5),   fmt:`${IND.spread2y?.toFixed(3)}%`,     id:"spread2y",  goodDir:"↑"},
          {label:"Spread US-DE 10Y", val:IND.spread10y,  score:hsi(IND.spread10y,2.0,1.2,0.5),  fmt:`${IND.spread10y?.toFixed(3)}%`,    id:"spread10y", goodDir:"↑"},
        ]},
        {group:"😰 SENTIMENT / MERCATI", inds:[
          {label:"VIX",              val:IND.vix,         score:hsi(IND.vix,40,25,13),             fmt:`${IND.vix?.toFixed(1)}`,           id:"vix"},
          {label:"EUR/USD",          val:IND.eurusd,      score:hs(IND.eurusd!=null?IND.eurusd:0,1.00,1.10,1.22),fmt:IND.eurusd!=null?`${IND.eurusd?.toFixed(4)}`:"—",id:"eurusd"},
          {label:"SX5E Euro Stoxx",  val:IND.sx5e,        score:hs(IND.sx5e!=null?IND.sx5e:0,3500,5000,6500),fmt:IND.sx5e!=null?`${IND.sx5e?.toFixed(0)}`:"—",id:"sx5e"},
          {label:"Oil Brent",        val:IND.oil,         score:hs(IND.oil,50,80,110),             fmt:`$${IND.oil?.toFixed(1)}`,          id:"oil"},
          {label:"CRB",              val:IND.crb,         score:hs(IND.crb,260,370,430),           fmt:`${IND.crb?.toFixed(0)}`,           id:"crb"},
        ]},
      ];

      const fedScore=panelScore(fedGroups);
      const bceScore=panelScore(bceGroups);

      function IndCard({ind}){
        const c=hawkColor(ind.score);
        const scoreVal=Math.max(2,ind.score||0);
        const arrow=arrowEl(ind.id,ind.goodDir);
        return <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:8,padding:"10px 12px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{fontSize:10,color:"#6b7280"}}>{ind.label}</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {arrow}
              <div style={{fontFamily:"monospace",fontSize:14,fontWeight:800,color:c}}>{ind.fmt}</div>
            </div>
          </div>
          <div style={{height:4,background:"#1e293b",borderRadius:2,overflow:"hidden",marginBottom:4}}>
            <div style={{height:"100%",width:scoreVal+"%",background:"linear-gradient(to right,#10B981,#F59E0B,#EF4444)",borderRadius:2}}/>
          </div>
          <div style={{fontSize:9,color:"#4b5563"}}>{TRENDS[ind.id]?.note||""}</div>
        </div>;
      }

      function HeaderCard({name,flag,score}){
        const col=hawkColor(score);
        return <div style={{background:"#0f172a",border:"1px solid "+col+"66",borderRadius:12,padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:20}}>{flag}</span>
            <div style={{fontSize:16,fontWeight:800,color:"#f8fafc"}}>{name}</div>
          </div>
          <div style={{textAlign:"center",marginBottom:10}}>
            <span style={{fontFamily:"monospace",fontSize:48,fontWeight:900,color:col,lineHeight:1}}>{score}</span>
            <span style={{fontSize:12,color:"#4b5563"}}> /100</span>
            <div style={{fontSize:11,color:col,fontWeight:700,letterSpacing:1,marginTop:4}}>{hawkLabel(score)}</div>
          </div>
          <div style={{position:"relative",height:12,background:"linear-gradient(to right,#10B981,#F59E0B,#EF4444)",borderRadius:6,marginBottom:6}}>
            <div style={{position:"absolute",top:-2,left:`${score}%`,transform:"translateX(-50%)",width:16,height:16,background:col,borderRadius:"50%",border:"2px solid #fff"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"#4b5563"}}>
            <span>DOVISH</span><span>NEUTRO</span><span>HAWKISH</span>
          </div>
        </div>;
      }

      // Render categorie affiancate BCE|FED alla stessa altezza
      return <div>
        <div style={{fontSize:8,color:"#6b7280",letterSpacing:2,marginBottom:12}}>POSIZIONAMENTO BANCHE CENTRALI — agg. {LAST_UPDATE} · score normalizzato per categoria</div>
        {/* Header cards */}
        <div style={{display:"flex",gap:12,marginBottom:16}}>
          <div style={{flex:1}}><HeaderCard name="BCE" flag="🇪🇺" score={bceScore}/></div>
          <div style={{flex:1}}><HeaderCard name="FED" flag="🇺🇸" score={fedScore}/></div>
        </div>
        {/* Categorie allineate */}
        {fedGroups.map((fg,gi)=>{
          const bg=bceGroups[gi];
          const fScore=catScore(fg.inds);
          const bScore=bg?catScore(bg.inds):null;
          return <div key={gi} style={{marginBottom:16}}>
            {/* Titolo categoria allineato */}
            <div style={{display:"flex",gap:12,marginBottom:6}}>
              <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0a0a14",borderRadius:6,padding:"5px 10px"}}>
                <span style={{fontSize:9,color:"#475569",fontWeight:700,letterSpacing:1}}>{bg?.group||""}</span>
                {bg&&<span style={{background:hawkColor(bScore)+"22",border:"1px solid "+hawkColor(bScore),color:hawkColor(bScore),borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:800}}>{bScore}</span>}
              </div>
              <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0a0a14",borderRadius:6,padding:"5px 10px"}}>
                <span style={{fontSize:9,color:"#475569",fontWeight:700,letterSpacing:1}}>{fg.group}</span>
                <span style={{background:hawkColor(fScore)+"22",border:"1px solid "+hawkColor(fScore),color:hawkColor(fScore),borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:800}}>{fScore}</span>
              </div>
            </div>
            {/* Indicatori affiancati */}
            <div style={{display:"flex",gap:12}}>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
                {bg?.inds.map((ind,i)=><IndCard key={i} ind={ind}/>)}
              </div>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
                {fg.inds.map((ind,i)=><IndCard key={i} ind={ind}/>)}
              </div>
            </div>
          </div>;
        })}
      </div>;
    })()}

    {tab==="charts"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:14}}>
        <div style={{fontSize:11,color:"#F59E0B",letterSpacing:2,fontWeight:700,marginBottom:2}}>MOMENTUM SCORE</div>
        <div style={{fontSize:8,color:"#374151",marginBottom:10}}>75% Cross-Sectional Rank + 25% Weighted · 1S×25% · 1M×40% · 3M×20% · 6M×10% · 1A×5%</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={[...allMomScores].sort((a,b)=>(b.composite??0)-(a.composite??0)).map(ss=>{const s=SCENARIOS.find(x=>x.id===ss.id);return{name:(s?.name||"").replace(" AGGRESSIVO","").replace("/SOFT LANDING",""),val:Math.round(ss.composite??0)};})} margin={{top:0,right:0,bottom:40,left:0}}>
            <XAxis dataKey="name" tick={{fontSize:7,fill:"#6b7280"}} angle={-25} textAnchor="end" interval={0}/>
            <YAxis tick={{fontSize:8,fill:"#6b7280"}} domain={[0,100]}/>
            
            <Tooltip cursor={{fill:"rgba(255,255,255,0.05)"}} content={<TT/>}/><Bar dataKey="val" radius={[3,3,0,0]}>
              {[...allMomScores].sort((a,b)=>(b.composite??0)-(a.composite??0)).map((ss,i)=> <Cell key={i} fill={scoreColor(ss.composite)}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:14}}>
        <div style={{fontSize:11,color:"#818cf8",letterSpacing:2,fontWeight:700,marginBottom:2}}>LEADING SCORE</div>
        <div style={{fontSize:8,color:"#374151",marginBottom:10}}>45 indicatori macro — agg. {LAST_UPDATE}</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={[...SCENARIOS].sort((a,b)=>(leadMap[b.id]??0)-(leadMap[a.id]??0)).map(s=>({name:s.name.replace(" AGGRESSIVO","").replace("/SOFT LANDING",""),val:Math.round(leadMap[s.id]??0)}))} margin={{top:0,right:0,bottom:40,left:0}}>
            <XAxis dataKey="name" tick={{fontSize:7,fill:"#6b7280"}} angle={-25} textAnchor="end" interval={0}/>
            <YAxis tick={{fontSize:8,fill:"#6b7280"}} domain={[0,100]}/>
            
            <Tooltip cursor={{fill:"rgba(255,255,255,0.05)"}} content={<TT/>}/><Bar dataKey="val" radius={[3,3,0,0]}>
              {[...SCENARIOS].sort((a,b)=>(leadMap[b.id]??0)-(leadMap[a.id]??0)).map((s,i)=> <Cell key={i} fill={scoreColor(leadMap[s.id])}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{background:"#0f172a",border:"1px solid #F59E0B44",borderRadius:10,padding:14,boxShadow:"0 0 12px rgba(245,158,11,0.1)"}}>
        <div style={{fontSize:11,color:"#F59E0B",letterSpacing:2,fontWeight:700,marginBottom:2}}>FINAL SCORE (70% LEADING + 30% MOM (modulato))</div>
        <div style={{fontSize:8,color:"#374151",marginBottom:10}}>Score composito predittivo</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={[...SCENARIOS].sort((a,b)=>(finalMap[b.id]??0)-(finalMap[a.id]??0)).map(s=>({name:s.name.replace(" AGGRESSIVO","").replace("/SOFT LANDING",""),val:Math.round(finalMap[s.id]??0),active:s.active}))} margin={{top:0,right:0,bottom:40,left:0}}>
            <XAxis dataKey="name" tick={{fontSize:7,fill:"#6b7280"}} angle={-25} textAnchor="end" interval={0}/>
            <YAxis tick={{fontSize:8,fill:"#6b7280"}} domain={[0,100]}/>
            
            <Tooltip cursor={{fill:"rgba(255,255,255,0.05)"}} content={<TT/>}/><Bar dataKey="val" radius={[3,3,0,0]}>
              {[...SCENARIOS].sort((a,b)=>(finalMap[b.id]??0)-(finalMap[a.id]??0)).map((s,i)=> <Cell key={i} fill={scoreColor(finalMap[s.id])}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:14}}>
        <div style={{fontSize:11,color:"#F59E0B",letterSpacing:2,fontWeight:700,marginBottom:2}}>Δ MOMENTUM</div>
        <div style={{fontSize:8,color:"#374151",marginBottom:10}}>Variazione momentum · {history.length<2?"In attesa del 2° aggiornamento":"Basato su "+history.length+" settimane"}</div>
        {history.length>=2?(
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={[...allMomScores].sort((a,b)=>{const da=getSmoothedDelta(a.id)??-999;const db=getSmoothedDelta(b.id)??-999;return db-da;}).map(ss=>{const s=SCENARIOS.find(x=>x.id===ss.id);const d=getSmoothedDelta(ss.id);return{name:(s?.name||"").replace(" AGGRESSIVO","").replace("/SOFT LANDING",""),val:d!=null?parseFloat(d.toFixed(1)):null,id:ss.id};}).filter(d=>d.val!==null)} margin={{top:0,right:0,bottom:40,left:0}}>
              <XAxis dataKey="name" tick={{fontSize:7,fill:"#6b7280"}} angle={-25} textAnchor="end" interval={0}/>
              <YAxis tick={{fontSize:8,fill:"#6b7280"}} tickFormatter={v=>(v>=0?"+":"")+v?.toFixed(1)}/>
              <ReferenceLine y={0} stroke="#374151"/>
              <Tooltip cursor={{fill:"rgba(255,255,255,0.05)"}} content={<TT/>}/>
              <Bar dataKey="val" radius={[3,3,0,0]}>
                {[...allMomScores].sort((a,b)=>{const da=getSmoothedDelta(a.id)??-999;const db=getSmoothedDelta(b.id)??-999;return db-da;}).map((ss,i)=>{const d=getSmoothedDelta(ss.id);return <Cell key={i} fill={scoreColor(d!=null?Math.min(100,Math.max(0,50+d*2)):50)}/>;})}</Bar>
            </BarChart>
          </ResponsiveContainer>
        ):<div style={{textAlign:"center",padding:20,fontSize:9,color:"#374151"}}>⚠️ Disponibile dalla 2ª settimana</div>}
      </div>

    </div>}

    {false&&<div>

      {/* BREVE PERIODO */}
      {(()=>{
        const LOPS_SHORT=[
          {id:"goldilocks", n:"GOLDILOCKS",   d:1.57, w:4.08, m:5.92,  q:2.24},
          {id:"recession",  n:"RECESSIONE",   d:0.58, w:0.13, m:-1.86, q:1.80},
          {id:"stagflation",n:"STAGFLAZIONE", d:0.04, w:-0.06,m:-1.22, q:10.94},
          {id:"reflation",  n:"REFLAZIONE",   d:0.70, w:1.99, m:5.17,  q:6.49},
          {id:"disinflation",n:"DISINFLAZ.",  d:1.21, w:1.92, m:1.31,  q:0.87},
          {id:"dollarweak", n:"DOLLAR WEAK",  d:1.04, w:1.91, m:2.39,  q:8.99},
          {id:"deflation",  n:"DEFLAZIONE",   d:0.14, w:-0.34,m:-1.19, q:0.78},
          {id:"debaggressivo",n:"DEB +BTC",   d:1.39, w:2.56, m:2.10,  q:-0.27},
          {id:"debasement", n:"DEBASEMENT",   d:1.25, w:2.50, m:3.56,  q:2.33},
        ];
        const activeIds=SCENARIOS.filter(s=>s.active).map(s=>s.id);
        const col=v=>v>0?"#10B981":v<0?"#EF4444":"#6b7280";
        const fmt=v=>(v>0?"+":"")+v.toFixed(2)+"%";
        return <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:12}}>
          <div style={{fontSize:11,color:"#94a3b8",letterSpacing:2,fontWeight:700,marginBottom:8}}>ANDAMENTO BREVE PERIODO — fonte Lops {LAST_UPDATE}</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead>
                <tr style={{borderBottom:"1px solid #1f2937"}}>
                  {["SCENARIO","Δ 1G","Δ 1S","Δ 1M","Δ 3M"].map(h=><th key={h} style={{padding:"4px 6px",color:"#4b5563",fontWeight:700,textAlign:h==="SCENARIO"?"left":"right",whiteSpace:"nowrap"}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {LOPS_SHORT.map((r,i)=>{
                  const isAct=activeIds.includes(r.id);
                  return <tr key={i} style={{borderBottom:"1px solid #0f172a",background:isAct?"#1a1530":"transparent"}}>
                    <td style={{padding:"5px 6px",color:isAct?"#F59E0B":"#94a3b8",fontWeight:isAct?700:400,whiteSpace:"nowrap"}}>{isAct?"● ":""}{r.n}</td>
                    {[r.d,r.w,r.m,r.q].map((v,j)=><td key={j} style={{padding:"5px 6px",textAlign:"right",color:col(v),fontWeight:700,fontFamily:"monospace",whiteSpace:"nowrap"}}>{fmt(v)}</td>)}
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>;
      })()}

      {/* MEDIO-LUNGO PERIODO */}
      {(()=>{
        const LOPS_LONG=[
          {id:"goldilocks",  n:"GOLDILOCKS",   m:5.92,  q:2.24,  s:7.49,  y:46.38},
          {id:"recession",   n:"RECESSIONE",   m:-1.86, q:1.80,  s:2.61,  y:13.77},
          {id:"stagflation", n:"STAGFLAZIONE", m:-1.22, q:10.94, s:15.26, y:30.30},
          {id:"reflation",   n:"REFLAZIONE",   m:5.17,  q:6.49,  s:13.83, y:35.31},
          {id:"disinflation",n:"DISINFLAZ.",   m:1.31,  q:0.87,  s:3.37,  y:23.86},
          {id:"dollarweak",  n:"DOLLAR WEAK",  m:2.39,  q:8.99,  s:14.48, y:35.16},
          {id:"deflation",   n:"DEFLAZIONE",   m:-1.19, q:0.78,  s:-0.30, y:3.86},
          {id:"debaggressivo",n:"DEB +BTC",    m:3.59,  q:-2.24, s:10.62, y:67.29},
          {id:"debasement",  n:"DEBASEMENT",   m:3.56,  q:2.33,  s:17.04, y:70.44},
        ];
        const activeIds=SCENARIOS.filter(s=>s.active).map(s=>s.id);
        const col=v=>v>0?"#10B981":v<0?"#EF4444":"#6b7280";
        const fmt=v=>(v>0?"+":"")+v.toFixed(2)+"%";
        return <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:12}}>
          <div style={{fontSize:11,color:"#94a3b8",letterSpacing:2,fontWeight:700,marginBottom:8}}>ANDAMENTO MEDIO-LUNGO PERIODO — fonte Lops {LAST_UPDATE}</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead>
                <tr style={{borderBottom:"1px solid #1f2937"}}>
                  {["SCENARIO","Δ 1M","Δ 3M","Δ 6M","Δ 1A"].map(h=><th key={h} style={{padding:"4px 6px",color:"#4b5563",fontWeight:700,textAlign:h==="SCENARIO"?"left":"right",whiteSpace:"nowrap"}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {LOPS_LONG.map((r,i)=>{
                  const isAct=activeIds.includes(r.id);
                  return <tr key={i} style={{borderBottom:"1px solid #0f172a",background:isAct?"#1a1530":"transparent"}}>
                    <td style={{padding:"5px 6px",color:isAct?"#F59E0B":"#94a3b8",fontWeight:isAct?700:400,whiteSpace:"nowrap"}}>{isAct?"● ":""}{r.n}</td>
                    {[r.m,r.q,r.s,r.y].map((v,j)=><td key={j} style={{padding:"5px 6px",textAlign:"right",color:col(v),fontWeight:700,fontFamily:"monospace",whiteSpace:"nowrap"}}>{fmt(v)}</td>)}
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>;
      })()}

    </div>}

    {tab==="aggiorna"&&<div style={{maxWidth:560}}>
      <div style={{fontSize:8,color:"#6b7280",letterSpacing:2,marginBottom:16}}>AGGIORNAMENTO DATI</div>
      <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:16,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:"#f8fafc",marginBottom:6}}>📊 ETF da Google Sheet</div>
        <div style={{fontSize:10,color:"#6b7280",marginBottom:12}}>Aggiorna prezzi e variazioni per tutti gli scenari e gli ETF nazionali.</div>
        <button onClick={fetchEtfData} disabled={refreshing} style={{background:refreshing?"#1f2937":"#F59E0B",color:"#000",border:"none",borderRadius:8,padding:"10px 20px",fontSize:12,fontWeight:800,cursor:"pointer",width:"100%"}}>
          {refreshing?"⏳ Caricamento...":"🔄 REFRESH ETF"}
        </button>
      </div>
      <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:16,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:"#f8fafc",marginBottom:6}}>📡 Indicatori Macro</div>
        <div style={{fontSize:10,color:"#6b7280",marginBottom:8}}>Copia la watchlist TradingView (tab-separated) e incolla qui sotto.</div>
        <textarea value={macroText} onChange={function(e){setMacroText(e.target.value);}} placeholder="Incolla il testo da TradingView..." style={{width:"100%",minHeight:180,background:"#080812",color:"#94a3b8",border:"1px solid #1f2937",borderRadius:8,padding:"10px",fontSize:10,fontFamily:"monospace",resize:"vertical",boxSizing:"border-box",marginBottom:10}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={applyMacroText} style={{background:"#10B981",color:"#000",border:"none",borderRadius:8,padding:"10px 20px",fontSize:12,fontWeight:800,cursor:"pointer",flex:1}}>
            ✅ APPLICA INDICATORI
          </button>
          <button onClick={function(){window._macroUpdated={};setRefreshMsg("Reset conteggio");}} style={{background:"#374151",color:"#94a3b8",border:"none",borderRadius:8,padding:"10px 14px",fontSize:11,cursor:"pointer"}}>
            🔄 Reset
          </button>
        </div>
      </div>
      {refreshMsg&&<div style={{background:"#080812",border:"1px solid #1f2937",borderRadius:8,padding:"12px 14px",fontSize:10,color:"#F59E0B",fontWeight:600,wordBreak:"break-word"}}>{refreshMsg}</div>}
    </div>}

  </div>;
}const TRENDS = {
  yieldCurve:  {dir:"↑", note:"0.52% da 0.51% — curva lievemente positiva"},
  vix:         {dir:"↓", note:"18.45 da 18.68 — stabile, risk-on regge"},
  move:        {dir:"↑", note:"68.68 da 67.70 — bond vol in salita, attenzione"},
  ism:         {dir:"-", note:"52.7 — espansione moderata"},
  cpi:         {dir:"-", note:"2.6% YoY"},
  ppi:         {dir:"-", note:"4.0% YoY — pressione a monte"},
  pce:         {dir:"-", note:"3.0% YoY — sopra target Fed"},
  tedSpread:   {dir:"-", note:"0.09% — stabile"},
  crb:         {dir:"↑", note:"394.49 da 381.84 — accelerazione commodity FORTE"},
  bdi:         {dir:"↑", note:"2677 da 2673 — stabile su livelli alti"},
  ifo:         {dir:"-", note:"83.3 — sotto 85 = zona recessione"},
  euCpi:       {dir:"-", note:"2.6% YoY — stagnante"},
  jobless:     {dir:"-", note:"207K — mercato lavoro stabile"},
  lei:         {dir:"-", note:"100.89 — sopra ref 100.85"},
  cfnai:       {dir:"-", note:"-0.20 — sotto trend"},
  igSpread:    {dir:"-", note:"0.81% — stabile"},
  hySpread:    {dir:"↓", note:"2.85% da 2.84% — risk-on regge"},
  emSpread:    {dir:"-", note:"3.27%"},
  pcc:         {dir:"↑", note:"0.876 da 0.763 — più hedging, risk-off interno"},
  pcce:        {dir:"↑", note:"0.790 da 0.608 — paura in aumento"},
  realYield:   {dir:"↓", note:"1.91% da 1.92% — lieve miglioramento per oro"},
  breakeven:   {dir:"↑", note:"2.63% da 2.58% — aspettative inflazione salgono"},
  us2y:        {dir:"↑", note:"3.932% da 3.787% — hawkish Fed prezzato"},
  us10y:       {dir:"↑", note:"4.410% da 4.306% — tassi lunghi accelerano"},
  dxy:         {dir:"↑", note:"98.992 da 98.646 — dollaro si rafforza"},
  oil:         {dir:"↑", note:"$107.10 da $95.23 (+12.4%) — SHOCK energetico stagflazionistico"},
  euribor:     {dir:"↑", note:"2.450% da 2.355% — BCE hawkish confermata"},
  copperGold:  {dir:"-", note:"0.0015"},
  ismNewOrders:{dir:"-", note:"53.5"},
  ismEmployment:{dir:"-",note:"48.7"},
  ismPricesPaid:{dir:"-",note:"78.3 — massimo da giu 2022"},
  retailSales: {dir:"-", note:"3.97%"},
  housingStarts:{dir:"↑", note:"1500K da 1490K — lieve miglioramento"},
  m2Dxy:       {dir:"↓", note:"229.19 da 229.78 — liquidità reale stabile"},
  nfp:         {dir:"-", note:"178K"},
  ppiMom:      {dir:"-", note:"0.5% MoM"},
  ppiCoreMom:  {dir:"-", note:"0.4% MoM"},
  cpiMom:      {dir:"-", note:"0.9% MoM"},
  cpiCoreMom:  {dir:"-", note:"0.3% MoM"},
  euCpiMom:    {dir:"-", note:"1.3% MoM"},
  euCpiCoreMom:{dir:"-", note:"0.8% MoM"},
  euPpiMom:    {dir:"-", note:"-0.7% MoM"},
  euPpiYoy:    {dir:"-", note:"-3.0% YoY"},
  de02y:       {dir:"↑", note:"2.747% da 2.553% — BCE hawkish forte"},
  spread2y:    {dir:"↓", note:"1.182% da 1.231% — si RESTRINGE da lug 2025, BCE più hawkish della Fed, trade dollaro si indebolisce"},
  spread10y:   {dir:"↓", note:"1.297% da 1.305% — lieve restringimento"},
  pceMom:      {dir:"-", note:"0.4% MoM"},
  athi:        {dir:"↓", note:"86K da 226K — crollo nuovi massimi, breadth deteriora FORTE"},
  atlo:        {dir:"↑", note:"240K da 174K — nuovi minimi in forte aumento, risk-off"},
  trin:        {dir:"↓", note:"0.650 da 1.460 — sceso sotto 1, segnale bullish breadth"},
  spx:         {dir:"↓", note:"7123.64 da 7137.64 — lieve correzione"},
  btpBund:     {dir:"↑", note:"84.5bp da 79.5bp — spread BTP-Bund si allarga"},
  vvixVix:     {dir:"↑", note:"5.19 da 5.09 — volatilità della volatilità in salita"},
  dtb3:        {dir:"↓", note:"3.59% da 3.61% — T-Bill 3M in lieve calo"},
  sofr:        {dir:"-", note:"3.66% — Secured Overnight Financing Rate, Fed Funds proxy"},
  euur:        {dir:"-", note:"6.2% — Disoccupazione EU"},
  eujvr:       {dir:"-", note:"2.2% — Job Vacancy Rate EU, dato trimestrale"},
  de10y:       {dir:"↑", note:"3.042% da 2.97% — Bund 10Y in salita"},
  eurusd:      {dir:"-", note:"1.172 — EUR/USD, proxy forza relativa BCE vs Fed"},
  sx5e:        {dir:"↓", note:"5881 da 5885 — Euro Stoxx 50 lieve calo"},
  eursyy:      {dir:"-", note:"1.7% — Retail Sales EU YoY"},
  deppimm:     {dir:"↑", note:"2.5% da -0.5% — DE PPI MoM accelera forte"},
  deppiyy:     {dir:"↑", note:"-0.2% da -3.3% — DE PPI YoY in forte rimbalzo"},
  deCurve:     {dir:"↑", note:"0.397% da 0.073% — curva tedesca DE10Y-DE02Y in irripidimento"},
  euRealYield: {dir:"↑", note:"0.042% — Real Yield EU (DE10Y-euCpi) in risalita"},
};
const GOOD_DIR = {
  yieldCurve:"↑", vix:"↓", move:"↓", ism:"↑", ismNewOrders:"↑",
  cpi:"↓", ppi:"↓", pce:"↓", tedSpread:"↓", crb:"↓",
  bdi:"↑", ifo:"↑", euCpi:"↓", jobless:"↓", lei:"↑",
  cfnai:"↑", igSpread:"↓", hySpread:"↓", emSpread:"↓",
  pcc:"↓", pcce:"↓", realYield:"↓", breakeven:"↓",
  us2y:"↓", us10y:"↓", dxy:"↓", oil:"↓", euribor:"↓",
  copperGold:"↑", retailSales:"↑", housingStarts:"↑", m2Dxy:"↑", nfp:"↑",
  ismEmployment:"↑", ismPricesPaid:"↓",
  ppiMom:"↓", ppiCoreMom:"↓", cpiMom:"↓", cpiCoreMom:"↓",
  euCpiMom:"↓", euCpiCoreMom:"↓", euPpiMom:"↓", euPpiYoy:"↓",
  de02y:"↓", spread2y:"↑", spread10y:"↑", pceMom:"↓",
};
function arrowColor(id, dir){
  if(dir==="-") return "#F59E0B";
  const good = GOOD_DIR[id];
  if(!good) return "#94a3b8";
  if(dir===good) return "#10B981";
  if(dir!==good) return "#EF4444";
  return "#F59E0B";
}

// Colore valore secondo range soglia per indicatore
function valueColor(id, v){
  if(v===null||v===undefined) return "#6b7280";
  switch(id){
    case "vix":        return v<15?"#10B981":v<25?"#F59E0B":v<35?"#EF4444":"#7f1d1d";
    case "move":       return v<80?"#10B981":v<100?"#F59E0B":"#EF4444";
    case "ism":        return v<43?"#7f1d1d":v<50?"#EF4444":v<55?"#10B981":"#0EA5E9";
    case "cpi":        return v<2?"#10B981":v<3?"#F59E0B":v<5?"#EF4444":"#7f1d1d";
    case "ppi":        return v<2?"#10B981":v<3?"#F59E0B":v<6?"#EF4444":"#7f1d1d";
    case "pce":        return v<2?"#10B981":v<2.5?"#F59E0B":v<3.5?"#EF4444":"#7f1d1d";
    case "tedSpread":  return v<0.2?"#10B981":v<0.4?"#F59E0B":"#EF4444";
    case "realYield":  return v<0?"#0EA5E9":v<0.5?"#10B981":v<1.5?"#F59E0B":"#EF4444";
    case "breakeven":  return v<2?"#10B981":v<2.5?"#F59E0B":v<3?"#EF4444":"#7f1d1d";
    case "yieldCurve": return v<0?"#EF4444":v<1?"#F59E0B":v<1.5?"#6ee7b7":"#10B981";
    case "hySpread":   return v<3?"#10B981":v<5?"#F59E0B":v<8?"#EF4444":"#7f1d1d";
    case "igSpread":   return v<0.8?"#10B981":v<1.2?"#F59E0B":v<2?"#EF4444":"#7f1d1d";
    case "emSpread":   return v<3?"#10B981":v<5?"#F59E0B":"#EF4444";
    case "dxy":        return v<95?"#EF4444":v<100?"#F59E0B":v<105?"#10B981":"#EF4444";
    case "oil":        return v<55?"#10B981":v<80?"#EF4444":v<100?"#EF4444":"#7f1d1d";
    case "ifo":        return v<85?"#EF4444":v<95?"#F59E0B":v<105?"#10B981":"#0EA5E9";
    case "euCpi":      return v<2?"#10B981":v<3?"#F59E0B":"#EF4444";
    case "lei":        return v<99?"#EF4444":v<100.85?"#F59E0B":"#10B981";
    case "cfnai":      return v<-0.7?"#EF4444":v<0?"#F59E0B":v<0.3?"#10B981":"#0EA5E9";
    case "jobless":    return v<220?"#10B981":v<280?"#F59E0B":v<350?"#EF4444":"#7f1d1d";
    case "pcc":        return v<0.7?"#0EA5E9":v<0.9?"#10B981":v<1.1?"#F59E0B":"#EF4444";
    case "pcce":       return v<0.5?"#0EA5E9":v<0.7?"#10B981":v<0.9?"#F59E0B":"#EF4444";
    case "copperGold": return v<0.0015?"#EF4444":v<0.0025?"#F59E0B":"#10B981";
    case "crb":        return v<300?"#10B981":v<380?"#EF4444":"#EF4444";
    case "bdi":        return v<1000?"#EF4444":v<2000?"#EF4444":"#10B981";
    case "ismNewOrders":  return v<45?"#EF4444":v<50?"#F97316":v<55?"#10B981":"#0EA5E9";
    case "ismEmployment": return v<44?"#EF4444":v<50?"#F59E0B":v<53?"#10B981":"#0EA5E9";
    case "ismPricesPaid": return v<40?"#10B981":v<55?"#EF4444":v<70?"#F97316":"#EF4444";
    case "retailSales":  return v<1?"#EF4444":v<3?"#EF4444":"#10B981";
    case "housingStarts":return v<1200?"#EF4444":v<1400?"#F59E0B":"#10B981";
    case "m2Dxy":        return v<210?"#EF4444":v<220?"#EF4444":"#10B981";
    case "us2y":         return v<3?"#10B981":v<4?"#F59E0B":"#EF4444";
    case "euribor":      return v<2?"#10B981":v<3?"#F59E0B":"#EF4444";
    case "nfp":          return v<100?"#EF4444":v<220?"#F59E0B":"#10B981";
    case "ppiMom":       return v<0?"#10B981":v<0.3?"#EF4444":"#EF4444";
    case "ppiCoreMom":   return v<0?"#10B981":v<0.25?"#EF4444":"#EF4444";
    case "cpiMom":       return v<0?"#10B981":v<0.2?"#EF4444":"#EF4444";
    case "cpiCoreMom":   return v<0?"#10B981":v<0.2?"#EF4444":"#EF4444";
    case "euCpiMom":     return v<0?"#10B981":v<0.3?"#EF4444":"#EF4444";
    case "euCpiCoreMom": return v<0?"#10B981":v<0.25?"#EF4444":"#EF4444";
    case "euPpiMom":     return v<0?"#10B981":v<0.3?"#EF4444":"#EF4444";
    case "euPpiYoy":     return v<1?"#10B981":v<3?"#EF4444":"#EF4444";
    case "de02y":        return v<2?"#10B981":v<3?"#F59E0B":"#EF4444";
    case "spread2y":     return v>1.5?"#10B981":v>0.8?"#F59E0B":"#EF4444";
    case "spread10y":    return v>1.5?"#10B981":v>0.8?"#F59E0B":"#EF4444";
    case "pceMom":       return v<0?"#10B981":v<0.2?"#EF4444":"#EF4444";
    case "dtb3":         return v<3?"#10B981":v<4?"#F59E0B":"#EF4444";
    case "sofr":         return v<3?"#10B981":v<4?"#F59E0B":"#EF4444";
    case "us10y":        return v<2.5?"#10B981":v<4.0?"#F59E0B":"#EF4444";
    case "de10y":        return v<1.5?"#10B981":v<3?"#F59E0B":"#EF4444";
    case "deCurve":      return v<0?"#EF4444":v<0.5?"#F59E0B":"#10B981";
    case "euRealYield":  return v<0?"#0EA5E9":v<0.5?"#10B981":v<1.5?"#EF4444":"#EF4444";
    case "btpBund":      return v<0.6?"#10B981":v<1.0?"#F59E0B":v<1.5?"#EF4444":"#7f1d1d";
    case "euur":         return v<5.5?"#EF4444":v<7?"#10B981":v<9?"#EF4444":"#EF4444";
    case "eujvr":        return v<1.5?"#10B981":v<2.5?"#F59E0B":"#EF4444";
    case "eurusd":       return v<1.05?"#EF4444":v<1.10?"#EF4444":"#10B981";
    case "sx5e":         return v<4000?"#EF4444":v<5000?"#F59E0B":"#10B981";
    case "vvixVix":      return v<4.5?"#10B981":v<5.5?"#F59E0B":"#EF4444";
    case "deppimm":      return v<0?"#10B981":v<0.3?"#EF4444":"#EF4444";
    case "deppiyy":      return v<1?"#10B981":v<3?"#EF4444":"#EF4444";
    case "eursyy":       return v<0?"#EF4444":v<2?"#F59E0B":"#10B981";
    case "trin":         return v<0.7?"#0EA5E9":v<1.0?"#10B981":v<1.5?"#F59E0B":"#EF4444";
    case "athi":         return v<100000?"#EF4444":v<300000?"#F59E0B":"#10B981";
    case "atlo":         return v<100000?"#10B981":v<250000?"#F59E0B":"#EF4444";
    case "spx":          return v<5000?"#EF4444":v<6500?"#EF4444":"#10B981";
    case "dtb3":         return v<3?"#10B981":v<4?"#F59E0B":"#EF4444";
    case "sofr":         return v<3?"#10B981":v<4?"#F59E0B":"#EF4444";
    case "de10y":        return v<1.5?"#10B981":v<3?"#F59E0B":"#EF4444";
    case "btpBund":      return v<0.6?"#10B981":v<1.0?"#F59E0B":v<1.5?"#EF4444":"#7f1d1d";
    case "euur":         return v<5.5?"#10B981":v<7?"#F59E0B":"#EF4444";
    case "eujvr":        return v<1.5?"#10B981":v<2.5?"#F59E0B":"#EF4444";
    case "eurusd":       return v<1.05?"#EF4444":v<1.10?"#F59E0B":"#10B981";
    case "sx5e":         return v<4000?"#EF4444":v<5000?"#F59E0B":"#10B981";
    case "vvixVix":      return v<4.5?"#10B981":v<5.5?"#F59E0B":"#EF4444";
    case "deppimm":      return v<0?"#10B981":v<0.3?"#F59E0B":"#EF4444";
    case "deppiyy":      return v<1?"#10B981":v<3?"#F59E0B":"#EF4444";
    case "eursyy":       return v<0?"#EF4444":v<2?"#F59E0B":"#10B981";
    case "trin":         return v<0.7?"#0EA5E9":v<1.0?"#10B981":v<1.5?"#F59E0B":"#EF4444";
    case "athi":         return v<100000?"#EF4444":v<300000?"#F59E0B":"#10B981";
    case "atlo":         return v<100000?"#10B981":v<250000?"#F59E0B":"#EF4444";
    case "spx":          return v<5000?"#EF4444":v<6500?"#F59E0B":"#10B981";
    default:           return "#94a3b8";
  }
}

const IND_META = {
  yieldCurve: {label:"Yield Curve 10Y-2Y", fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"🔴 <0 = inversione → recessione in 6-18 mesi\n🟡 0-0.5 = piatto → rallentamento\n🟢 >1.0 = normale → espansione"},
  vix: {label:"VIX Fear Index", fmt:v=>`${v.toFixed(1)}`,
    desc:"🟢 <15 = calma, risk-on\n🟡 15-25 = incertezza moderata\n🔴 25-35 = stress elevato\n🚨 >35 = panico"},
  move: {label:"MOVE Index (Bond Vol)", fmt:v=>`${v.toFixed(1)}`,
    desc:"Volatilità bond USA — anticipa il VIX di 2-4 sett.\n🟢 <80 = stabile → favorevole a bond\n🟡 80-100 = volatilità moderata\n🔴 >100 = stress bond"},
  ism: {label:"ISM Manufacturing PMI", fmt:v=>`${v.toFixed(1)}`,
    desc:"🚨 <43 = recessione confermata\n🔴 43-50 = contrazione\n🟡 50 = neutro\n🟢 50-55 = espansione moderata\n🔵 >55 = espansione forte"},
  cpi: {label:"CPI YoY USA", fmt:v=>`${v.toFixed(1)}%`,
    desc:"Target Fed: 2%\n🟢 <2% = deflazionistico\n🟡 2-3% = target\n🔴 3-5% = inflazione elevata\n🚨 >5% = inflazione fuori controllo"},
  ppi: {label:"PPI YoY USA", fmt:v=>`${v.toFixed(1)}%`,
    desc:"Anticipa il CPI di 1-3 mesi.\n🟢 <2% = deflazione a monte\n🟡 2-3% = normale\n🔴 3-6% = pressione inflattiva in arrivo\n🚨 >6% = shock supply"},
  pce: {label:"PCE Core YoY", fmt:v=>`${v.toFixed(1)}%`,
    desc:"Misura preferita dalla Fed per le decisioni sui tassi.\n🎯 Target: 2%\n🟡 2-2.5% = pivot in vista\n🔴 2.5-3.5% = Fed hawkish\n🚨 >3.5% = nessun taglio"},
  tedSpread: {label:"TED Spread", fmt:v=>`${v.toFixed(2)}%`,
    desc:"Stress sistema bancario interbancario.\n🟢 <0.20% = sistema stabile\n🟡 0.20-0.40% = attenzione\n🔴 >0.40% = stress credito\n🚨 >1% = crisi bancaria"},
  crb: {label:"CRB Commodity Index", fmt:v=>`${v.toFixed(0)}`,
    desc:"Barometro inflazione materie prime in tempo reale.\n🟢 <300 = prezzi commodity bassi\n🟡 300-380 = pressione moderata\n🔴 >380 = inflazione commodity"},
  bdi: {label:"Baltic Dry Index", fmt:v=>`${v.toFixed(0)}`,
    desc:"Domanda globale di commodity 4-6 sett avanti.\n🔴 <1000 = contrazione commercio\n🟡 1000-2000 = neutro\n🟢 >2000 = espansione commercio"},
  ifo: {label:"IFO Business Climate DE", fmt:v=>`${v.toFixed(0)}`,
    desc:"Leading indicator economia tedesca/europea.\n🔴 <85 = recessione\n🟡 85-95 = rallentamento\n🟢 95-105 = espansione\n🔵 >105 = boom"},
  euCpi: {label:"Eurozona CPI YoY", fmt:v=>`${v.toFixed(1)}%`,
    desc:"Target BCE: 2%\n🟢 <2% = BCE può tagliare\n🟡 2-3% = BCE in attesa\n🔴 >3% = BCE hawkish"},
  jobless: {label:"Jobless Claims (K)", fmt:v=>`${v.toFixed(0)}K`,
    desc:"Richieste sussidio settimanali USA — mercato lavoro.\n🟢 <220K = mercato lavoro forte\n🟡 220-280K = normale\n🔴 280-350K = indebolimento\n🚨 >400K = recessione"},
  lei: {label:"CLI OCSE Leading", fmt:v=>`${v.toFixed(2)}`,
    desc:"Anticipa i cicli economici di 6-9 mesi.\n🚨 <99 = contrazione in arrivo\n🟡 99-100.85 = rallentamento\n🟢 >100.85 = espansione (ref storico)\n🔵 >102 = accelerazione"},
  cfnai: {label:"Chicago Fed CFNAI", fmt:v=>`${v.toFixed(2)}`,
    desc:"Attività economica USA broad — 85 indicatori.\n🚨 <-0.7 = recessione probabile\n🔴 -0.7/-0.2 = sotto trend\n🟡 -0.2/+0.2 = in linea con trend storico\n🟢 >+0.2 = sopra trend"},
  igSpread: {label:"IG Credit Spread", fmt:v=>`${v.toFixed(2)}%`,
    desc:"Spread investment grade — condizioni credito corporate.\n🟢 <0.80% = credito facile\n🟡 0.80-1.20% = normale\n🔴 1.20-2.00% = stress credito\n🚨 >2% = crisi"},
  hySpread: {label:"HY Credit Spread", fmt:v=>`${v.toFixed(2)}%`,
    desc:"Spread high yield — termometro risk-off istituzionale.\n🟢 <3% = risk-on pieno\n🟡 3-5% = normale\n🔴 5-8% = stress elevato\n🚨 >8% = risk-off estremo"},
  emSpread: {label:"EM Spread", fmt:v=>`${v.toFixed(2)}%`,
    desc:"Spread emerging markets — rischio geopolitico/dollaro.\n🟢 <3% = EM in salute\n🟡 3-5% = stress moderato\n🔴 >5% = fuga da EM"},
  pcc: {label:"Put/Call Ratio Total", fmt:v=>`${v.toFixed(3)}`,
    desc:"Contrarian indicator — posizionamento hedging totale.\n🔵 <0.70 = euforia (contrarian bearish)\n🟢 0.70-0.90 = equilibrio\n🟡 0.90-1.10 = incertezza\n🔴 >1.10 = panico (contrarian bullish)"},
  pcce: {label:"Put/Call Equity", fmt:v=>`${v.toFixed(3)}`,
    desc:"Sentiment retail su equity.\n🔵 <0.50 = euforia retail\n🟢 0.50-0.70 = ottimismo\n🟡 0.70-0.90 = neutro\n🔴 >0.90 = paura retail"},
  realYield: {label:"Real Yield 10Y TIPS", fmt:v=>`${v.toFixed(2)}%`,
    desc:"Il più importante per oro e metalli preziosi.\n🔵 <0% = negativo → ottimo per oro\n🟢 0-0.5% = neutro\n🟡 0.5-1.5% = pressione su oro\n🔴 >1.5% = forte headwind su oro"},
  breakeven: {label:"Breakeven Inflation 5Y", fmt:v=>`${v.toFixed(2)}%`,
    desc:"Aspettative inflazione implicite nel mercato bond.\n🟢 <2% = deflazione attesa\n🟡 2-2.5% = target Fed\n🔴 2.5-3% = inflazione persistente attesa\n🚨 >3% = disancoraggio aspettative"},
  dxy: {label:"Dollar Index DXY", fmt:v=>`${v.toFixed(1)}`,
    desc:"🔴 <95 = dollaro debole → EM/commodity favoriti\n🟡 95-100 = neutro\n🟢 100-105 = dollaro forte → XFFE valido\n🔴 >105 = dollaro molto forte → pressione EM"},
  oil: {label:"WTI Oil ($/barile)", fmt:v=>`$${v.toFixed(1)}`,
    desc:"Driver principale stagflazione energetica.\n🟢 <55$ = deflazione energia\n🟡 55-80$ = normale\n🔴 80-100$ = pressione inflattiva\n🚨 >100$ = shock energetico stagflazionistico"},
  copperGold: {label:"Copper/Gold Ratio", fmt:v=>`${v.toFixed(4)}`,
    desc:"Risk appetite (rame) vs safe haven (oro).\n🔴 <0.0015 = risk-off, oro domina\n🟡 0.0015-0.0025 = bilanciato\n🟢 >0.0025 = risk-on, crescita attesa"},
  ismNewOrders:{label:"ISM New Orders", fmt:v=>`${v.toFixed(1)}`,
    desc:"Componente più leading dell'ISM — anticipa manifatturiero di 1-2 mesi.\n🔴 <45 = crollo ordini\n🟡 45-50 = contrazione\n🟢 50-55 = espansione\n🔵 >55 = boom ordini"},
  ismEmployment:{label:"ISM Employment", fmt:v=>`${v.toFixed(1)}`,
    desc:"Occupazione manifatturiera — anticipa NFP di 2-3 settimane.\n🔴 <44 = tagli netti\n🟡 44-50 = contrazione lenta\n🟢 >50 = crescita"},
  ismPricesPaid:{label:"ISM Prices Paid", fmt:v=>`${v.toFixed(1)}`,
    desc:"Prezzi input manifatturiero — leading CPI di 1-2 mesi.\n🟢 <40 = deflazione\n🟡 40-55 = neutro\n🔴 55-70 = pressione inflattiva\n🚨 >70 = massima pressione"},
  retailSales: {label:"Retail Sales YoY", fmt:v=>`${v.toFixed(1)}%`,
    desc:"Consumi USA anno su anno — driver 70% PIL.\n🔴 <1% = recessione consumi\n🟡 1-3% = moderato\n🟢 >3% = consumi robusti"},
  housingStarts:{label:"Housing Starts (K)", fmt:v=>`${v.toFixed(0)}K`,
    desc:"Avvio costruzioni — leading ciclo edilizio/bancario 6-12 mesi.\n🔴 <1200K = mercato depresso\n🟡 1200-1400K = in recupero\n🟢 >1400K = sano"},
  m2Dxy:       {label:"M2/DXY Liquidità Reale", fmt:v=>`${v.toFixed(1)}`,
    desc:"M2 diviso DXY — proxy liquidità reale aggiustata dollaro.\n🔴 <210 = liquidità scarsa\n🟡 210-225 = neutro\n🟢 >225 = liquidità abbondante → favorevole asset/oro"},
  nfp:         {label:"NFP Nonfarm Payrolls (K)", fmt:v=>`${v>=0?"+":""}${v.toFixed(0)}K`,
    desc:"Creazione posti lavoro mensile — driver principale decisioni Fed.\n🔴 <100K = rallentamento mercato lavoro\n🟡 100-200K = crescita moderata\n🟢 >200K = robusto → Fed hawkish\nTrend strutturale dal 2022 in calo"},
  de02y:       {label:"DE02Y Germania 2Y", fmt:v=>`${v.toFixed(3)}%`,
    desc:"Rendimento Bund 2 anni — proxy diretto aspettative tassi BCE.\n🟢 <2% = BCE accomodante, tagli attesi\n🟡 2-3% = politica restrittiva\n🔴 >3% = BCE molto hawkish\nIn salita con Euribor — mercato prezza BCE ferma/hawkish nel breve"},
  us2y:        {label:"US 2Y Treasury Yield", fmt:v=>`${v.toFixed(2)}%`,
    desc:"Rendimento Treasury 2 anni — proxy aspettative Fed a breve.\n🟢 <3% = mercato prezza tagli\n🟡 3-4% = neutro\n🔴 >4% = mercato prezza Fed hawkish"},
  euribor:     {label:"Euribor 3M", fmt:v=>`${v.toFixed(2)}%`,
    desc:"Tasso interbancario eurozona — proxy politica BCE.\n🟢 <2% = BCE accomodante\n🟡 2-3% = neutro\n🔴 >3% = BCE restrittiva"},
  ppiMom:      {label:"PPI MoM USA", fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"PPI mese su mese — segnale più veloce dello YoY di 3 mesi.\n🟢 <0% = deflazione a monte\n🟡 0-0.3% = pressione moderata\n🔴 >0.3% = accelerazione inflattiva in arrivo"},
  ppiCoreMom:  {label:"PPI Core MoM USA", fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"PPI Core mese su mese — esclude energia/food.\n🟢 <0% = disinflazione strutturale\n🟡 0-0.25% = pressione contenuta\n🔴 >0.25% = inflazione strutturale — Fed non taglia"},
  cpiMom:      {label:"CPI MoM USA", fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"CPI mese su mese — anticipa lo YoY di 3 mesi.\n🟢 <0.1% = trend disinflazionistico\n🟡 0.1-0.2% = target Fed\n🔴 >0.3% = accelerazione — pivot allontana"},
  cpiCoreMom:  {label:"CPI Core MoM USA", fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"CPI Core mese su mese — quello che guarda davvero la Fed.\n🎯 Target Fed: 0.17% mese (=2% annualizzato)\n🟡 0.17-0.25% = al limite\n🔴 >0.25% = Fed bloccata — nessun taglio"},
  euCpiMom:    {label:"Euro Area CPI MoM", fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"CPI eurozona mese su mese.\n🟢 <0.1% = disinflazione in corso\n🟡 0.1-0.3% = neutro\n🔴 >0.3% = BCE sotto pressione"},
  euCpiCoreMom:{label:"Euro Area CPI Core MoM", fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"CPI Core eurozona mese su mese — esclude energia/food.\n🟢 <0.1% = BCE può tagliare\n🟡 0.1-0.25% = cautela\n🔴 >0.25% = BCE hawkish confermata"},
  euPpiMom:    {label:"Euro Area PPI MoM", fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"PPI eurozona mese su mese — leading dell'inflazione europea.\n🟢 <0% = deflazione a monte → spazio BCE per tagliare\n🟡 0-0.3% = neutro\n🔴 >0.3% = pressione inflattiva"},
  euPpiYoy:    {label:"Euro Area PPI YoY", fmt:v=>`${v.toFixed(1)}%`,
    desc:"PPI eurozona anno su anno.\n🟢 <1% = deflazione produzione\n🟡 1-3% = normale\n🔴 >3% = pressione inflattiva strutturale"},
  spread2y:    {label:"Spread US02Y-DE02Y", fmt:v=>`${v.toFixed(3)}%`,
    desc:"Differenziale tassi 2 anni USA-Germania — proxy vantaggio dollaro.\n🟢 >1.5% = dollaro forte, trade XFFE valido\n🟡 0.8-1.5% = vantaggio si assottiglia\n🔴 <0.8% = BCE più hawkish della Fed → trade dollaro si rompe"},
  spread10y:   {label:"Spread US10Y-DE10Y", fmt:v=>`${v.toFixed(3)}%`,
    desc:"Differenziale tassi 10 anni USA-Germania — proxy carry a lungo termine.\n🟢 >1.5% = carry positivo per dollaro\n🟡 0.8-1.5% = neutro\n🔴 <0.8% = euro si rafforza strutturalmente"},
  dtb3:        {label:"DTB3 T-Bill 3M Secondario",  fmt:v=>`${v.toFixed(2)}%`,
    desc:"Tasso T-Bill 3M mercato secondario — sostituto TEDRATE (aggiornato FRED).\n🟢 <3% = liquidità abbondante\n🟡 3-4% = neutro\n🔴 >4.5% = stress liquidità USA"},
  sofr:        {label:"SOFR Secured Overnight Rate",  fmt:v=>`${v.toFixed(2)}%`,
    desc:"Tasso overnight garantito da Treasury — proxy Fed Funds più affidabile di LIBOR.\n🟢 <3% = Fed accomodante\n🔴 >4.5% = Fed restrittiva"},
  us10y:       {label:"US 10Y Treasury Yield",         fmt:v=>`${v.toFixed(3)}%`,
    desc:"Rendimento Treasury 10 anni — tasso di riferimento globale.\n🟢 <3% = regime tassi bassi\n🟡 3-4% = neutro\n🔴 >4% = tassi alti, pressione su equity e bond"},
  de10y:       {label:"DE10Y Bund 10 Anni",            fmt:v=>`${v.toFixed(3)}%`,
    desc:"Rendimento Bund 10 anni — tasso risk-free eurozona.\n🟢 <1.5% = BCE accomodante\n🟡 1.5-3% = neutro\n🔴 >3% = BCE hawkish strutturale"},
  deCurve:     {label:"DE Yield Curve (DE10Y-DE02Y)",  fmt:v=>`${v>=0?"+":""}${v.toFixed(3)}%`,
    desc:"Curva dei tassi tedesca — proxy ciclo economico EU.\n🔴 <0 = inversione → recessione EU\n🟡 0-0.5% = piatta\n🟢 >0.5% = normale → espansione"},
  euRealYield: {label:"EU Real Yield (DE10Y-EU CPI)",  fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"Real yield europeo — driver oro e asset reali in EU.\n🔵 <0% = negativo → oro e real asset favoriti\n🟢 0-0.5% = neutro\n🔴 >1% = pressione su asset reali"},
  btpBund:     {label:"BTP-Bund Spread (IT10Y-DE10Y)", fmt:v=>`${(v*100).toFixed(1)}bp`,
    desc:"Spread tra BTP e Bund — stress fiscale Italia e periferia EU.\n🟢 <60bp = zona comfort\n🟡 60-100bp = normale\n🔴 100-150bp = attenzione\n🚨 >200bp = crisi periferia"},
  euur:        {label:"EUUR Disoccupazione EU",         fmt:v=>`${v.toFixed(1)}%`,
    desc:"Tasso disoccupazione eurozona — leading BCE.\n🔵 <5.5% = mercato lavoro surriscaldato → BCE hawkish\n🟢 5.5-7% = sano\n🔴 >8% = recessione → BCE dovish"},
  eujvr:       {label:"EUJVR Job Vacancy Rate EU",      fmt:v=>`${v.toFixed(1)}%`,
    desc:"Posti vacanti EU — pressione salariale e inflazione servizi.\n🟢 <1.5% = normale\n🟡 1.5-2.5% = mercato teso\n🔴 >2.5% = pressione salariale → BCE hawkish"},
  eurusd:      {label:"EUR/USD",                        fmt:v=>`${v.toFixed(4)}`,
    desc:"Cambio Euro/Dollaro — proxy forza relativa BCE vs Fed.\n🔴 <1.05 = dollaro molto forte\n🟡 1.05-1.10 = neutro\n🟢 >1.15 = euro forte → BCE relativamente più hawkish"},
  sx5e:        {label:"Euro Stoxx 50",                  fmt:v=>`${v.toFixed(0)}`,
    desc:"Indice azionario eurozona — proxy risk-on EU.\n🔴 <4000 = risk-off EU\n🟡 4000-5000 = neutro\n🟢 >5500 = risk-on EU"},
  vvixVix:     {label:"VVIX/VIX Ratio",                 fmt:v=>`${v.toFixed(2)}`,
    desc:"Rapporto volatilità della volatilità — stress imminente.\n🟢 <4.5 = calmo\n🟡 4.5-5.5 = attenzione\n🔴 >5.5 = stress imminente sul VIX"},
  deppimm:     {label:"DE PPI MoM Germania",            fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"PPI mese su mese Germania — leading inflazione EU più aggiornato dell'EU PPI.\n🟢 <0% = deflazione a monte\n🟡 0-0.3% = neutro\n🔴 >0.5% = pressione inflattiva in arrivo"},
  deppiyy:     {label:"DE PPI YoY Germania",            fmt:v=>`${v.toFixed(1)}%`,
    desc:"PPI anno su anno Germania — stato dell'inflazione industriale EU.\n🟢 <1% = deflazione strutturale\n🟡 1-3% = normale\n🔴 >4% = inflazione industriale"},
  eursyy:      {label:"EU Retail Sales YoY",            fmt:v=>`${v.toFixed(1)}%`,
    desc:"Vendite al dettaglio eurozona anno su anno — consumi EU.\n🔴 <0% = recessione consumi\n🟡 0-2% = moderato\n🟢 >3% = consumi robusti → BCE hawkish"},
  trin:        {label:"TRIN Arms Trading Index",        fmt:v=>`${v.toFixed(3)}`,
    desc:"Arms Index — relazione tra volumi e breadth NYSE.\n🔵 <0.5 = euforia (contrarian bearish)\n🟢 0.5-1.0 = risk-on\n🟡 1.0-1.5 = neutro\n🔴 >1.5 = risk-off / panico"},
  athi:        {label:"NYSE AT TODAY'S HIGH",           fmt:v=>`${(v/1000).toFixed(0)}K`,
    desc:"Numero titoli NYSE che fanno nuovi massimi oggi — breadth rialzista.\n🔴 <100K = breadth deteriora\n🟡 100-300K = normale\n🟢 >300K = breadth forte"},
  atlo:        {label:"NYSE AT TODAY'S LOW",            fmt:v=>`${(v/1000).toFixed(0)}K`,
    desc:"Numero titoli NYSE che fanno nuovi minimi oggi — breadth ribassista.\n🟢 <100K = pressione ribassista bassa\n🟡 100-250K = normale\n🔴 >300K = deterioramento breadth"},
  spx:         {label:"S&P 500",                        fmt:v=>`${v.toFixed(0)}`,
    desc:"Indice azionario USA — barometro risk-on globale.\n🔴 <5000 = risk-off\n🟡 5000-6500 = neutro/bull\n🟢 >6500 = bull market"},
  pceMom:      {label:"PCE Core MoM USA", fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"PCE Core MoM — misura mensile dell'inflazione di fondo USA, indicatore strutturale preferito dalla Fed.\n🎯 Target implicito: 0.17% mensile (=2% annualizzato)\n🟢 <0.15% = Fed può tagliare\n🟡 0.15-0.25% = al limite\n🔴 >0.25% = Fed bloccata — nessun taglio possibile"},
};
