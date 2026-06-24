import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const LAST_UPDATE = "02/05/2026";

function getISOWeek(s){
  const [d,m,y]=s.split("/").map(Number);
  const dt=new Date(y,m-1,d);
  const j4=new Date(y,0,4);
  const w1=new Date(j4); w1.setDate(j4.getDate()-((j4.getDay()+6)%7));
  return Math.floor((dt-w1)/(7*864e5))+1;
}
const CURRENT_WEEK=(function(){const t=new Date();const d=String(t.getDate()).padStart(2,"0");const m=String(t.getMonth()+1).padStart(2,"0");const y=t.getFullYear();return getISOWeek(d+"/"+m+"/"+y);})();

const SCENARIOS=[
  {id:"goldilocks",name:"GOLDILOCKS",color:"#10B981",desc:"Crescita + inflazione moderata",
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
  {id:"recession",name:"RECESSIONE",color:"#6366F1",desc:"Crescita negativa",
   avg:{w:-1.02,m:-0.28,q:-3.40,s:2.79,y:8.22,y2:22.77,y3:25.81,y5:30.25},
   etfs:[
    {t:"TLT",n:"iShares 20+ Year Treasury", p:85.67, w:-1.23, m:-1.28, q:-2.23,  s:-5.12, y:-5.02,  y2:-3.72,  y3:-16.93, y5:-38.21},
    {t:"SHY",n:"iShares 1-3Y Treasury",     p:82.38, w:-0.17, m:-0.15, q:-0.65,  s:-0.72, y:-0.76,  y2:1.39,   y3:0.70,   y5:-4.52},
    {t:"XLU",n:"Utilities Select SPDR",     p:45.63, w:1.69,  m:-0.63, q:5.31,   s:2.42,  y:15.08,  y2:36.01,  y3:32.07,  y5:36.78},
    {t:"XLP",n:"Cons Staples Select SPDR",  p:82.65, w:0.66,  m:0.94,  q:0.63,   s:8.35,  y:1.74,   y2:8.99,   y3:6.65,   y5:18.78},
    {t:"GLD",n:"SPDR Gold Trust",           p:416.10,w:-4.40, m:0.37,  q:-16.09, s:13.03, y:35.95,  y2:92.48,  y3:126.18, y5:151.18},
    {t:"XLV",n:"Health Care Select SPDR",   p:142.51,w:-2.64, m:-0.91, q:-7.35,  s:-1.21, y:2.32,   y2:1.48,   y3:6.18,   y5:17.46},
   ]},
  {id:"stagflation",name:"STAGFLAZIONE",color:"#F59E0B",desc:"Crescita lenta + inflazione alta",
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
  {id:"reflation",name:"REFLAZIONE",color:"#0EA5E9",desc:"Ripresa + inflazione in aumento",
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
  {id:"disinflation",name:"DISINFLAZIONE",color:"#8B5CF6",desc:"Soft landing - inflazione in calo",
   avg:{w:-0.92,m:5.41,q:-1.10,s:5.29,y:19.82,y2:33.83,y3:52.27,y5:46.34},
   etfs:[
    {t:"TLT", n:"iShares 20+ Year Treasury",p:85.67, w:-1.23, m:-1.28, q:-2.23,  s:-5.12, y:-5.02,  y2:-3.72,  y3:-16.93, y5:-38.21},
    {t:"LQD", n:"iShares Corp Bond",        p:108.71,w:-1.01, m:0.37,  q:-1.78,  s:-2.27, y:0.20,   y2:2.97,   y3:0.85,   y5:-17.11},
    {t:"QQQ", n:"Invesco QQQ Trust",        p:659.57,w:0.68,  m:18.14, q:4.79,   s:4.85,  y:38.70,  y2:52.41,  y3:104.71, y5:95.14},
    {t:"VTI", n:"Vanguard Total Stock Mkt", p:349.37,w:-0.53, m:12.09, q:2.07,   s:4.16,  y:28.13,  y2:38.22,  y3:69.43,  y5:60.93},
    {t:"GLD", n:"SPDR Gold Trust",          p:416.10,w:-4.40, m:0.37,  q:-16.09, s:13.03, y:35.95,  y2:92.48,  y3:126.18, y5:151.18},
    {t:"SCHD",n:"Schwab US Dividend Equity",p:31.32, w:1.00,  m:2.76,  q:6.64,   s:17.08, y:20.97,  y2:20.60,  y3:29.37,  y5:26.09},
   ]},
  {id:"dollarweakness",name:"DOLLAR WEAKNESS",color:"#EC4899",desc:"Dollaro debole + riequilibrio globale",
   avg:{w:-0.71,m:6.03,q:1.30,s:14.26,y:31.43,y2:44.71,y3:55.15,y5:55.62},
   etfs:[
    {t:"EEM", n:"iShares MSCI Emerging",    p:62.63, w:-1.18, m:14.39, q:3.62,   s:13.25, y:43.48,  y2:50.66,  y3:60.59,  y5:16.02},
    {t:"FXF", n:"Invesco CurrencyShares CHF",p:111.38,w:-0.93,m:0.90,  q:-3.51,  s:1.29,  y:3.41,   y2:13.99,  y3:12.09,  y5:12.14},
    {t:"GLD", n:"SPDR Gold Trust",          p:416.10,w:-4.40, m:0.37,  q:-16.09, s:13.03, y:35.95,  y2:92.48,  y3:126.18, y5:151.18},
    {t:"IXUS",n:"iShares Core MSCI Total Intl",p:91.06,w:-1.89,m:8.74, q:0.19,   s:8.47,  y:26.68,  y2:35.53,  y3:44.47,  y5:26.00},
    {t:"DBC", n:"Invesco DB Commodity",     p:30.94, w:4.85,  m:5.74,  q:22.29,  s:35.23, y:47.61,  y2:30.88,  y3:32.45,  y5:72.75},
   ]},
  {id:"deflation",name:"DEFLAZIONE",color:"#64748B",desc:"Prezzi in calo + contrazione",
   avg:{w:0.20,m:-0.22,q:0.62,s:0.96,y:2.19,y2:8.50,y3:4.54,y5:2.60},
   etfs:[
    {t:"TLT",n:"iShares 20+ Year Treasury", p:85.67, w:-1.23, m:-1.28, q:-2.23,  s:-5.12, y:-5.02,  y2:-3.72,  y3:-16.93, y5:-38.21},
    {t:"BIL",n:"SPDR Bloomberg 1-3M T-Bill",p:91.64, w:0.08,  m:0.00,  q:0.01,   s:-0.13, y:-0.08,  y2:-0.15,  y3:0.23,   y5:0.15},
    {t:"SHY",n:"iShares 1-3Y Treasury",     p:82.38, w:-0.17, m:-0.15, q:-0.65,  s:-0.72, y:-0.76,  y2:1.39,   y3:0.70,   y5:-4.52},
    {t:"XLP",n:"Cons Staples Select SPDR",  p:82.65, w:0.66,  m:0.94,  q:0.63,   s:8.35,  y:1.74,   y2:8.99,   y3:6.65,   y5:18.78},
    {t:"XLU",n:"Utilities Select SPDR",     p:45.63, w:1.69,  m:-0.63, q:5.31,   s:2.42,  y:15.08,  y2:36.01,  y3:32.07,  y5:36.78},
   ]},
  {id:"dollarweaknessbtc",name:"DOLLAR WEAKNESS +BTC",color:"#F97316",desc:"Dollaro debole + Bitcoin",
   avg:{w:-2.59,m:7.55,q:-5.21,s:0.92,y:17.66,y2:42.35,y3:null,y5:null},
   etfs:[
    {t:"EEM", n:"iShares MSCI Emerging",    p:62.63, w:-1.18, m:14.39, q:3.62,   s:13.25, y:43.48,  y2:50.66,  y3:60.59,  y5:16.02},
    {t:"FXF", n:"Invesco CurrencyShares CHF",p:111.38,w:-0.93,m:0.90,  q:-3.51,  s:1.29,  y:3.41,   y2:13.99,  y3:12.09,  y5:12.14},
    {t:"GLD", n:"SPDR Gold Trust",          p:416.10,w:-4.40, m:0.37,  q:-16.09, s:13.03, y:35.95,  y2:92.48,  y3:126.18, y5:151.18},
    {t:"IXUS",n:"iShares Core MSCI Total Intl",p:91.06,w:-1.89,m:8.74, q:0.19,   s:8.47,  y:26.68,  y2:35.53,  y3:44.47,  y5:26.00},
    {t:"IBIT",n:"iShares Bitcoin Trust ETF",p:42.71, w:-4.56, m:13.35, q:-10.27, s:-31.44,y:-21.23, y2:19.07,  y3:null,   y5:null},
   ]},
  {id:"debasementbtc",name:"DEBASEMENT +BTC",color:"#F97316",desc:"Debasement aggressivo con Bitcoin",
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
  {id:"debasement",name:"DEBASEMENT",color:"#EF4444",desc:"Svalutazione monetaria strutturale",
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


// ── MOMENTUM (pesi aggressivi verso breve termine) ────────────────
const WEIGHTS={w:0.45,m:0.35,q:0.12,s:0.05,y:0.03};
function calcMomScore(etf){let s=0,tw=0;Object.entries(WEIGHTS).forEach(([k,w])=>{if(etf[k]!=null){s+=etf[k]*w;tw+=w;}});return tw>0?s:null;}
function calcScenarioMom(sc){
  // In Debasement e Debasement+BTC oro e argento (GLD,GDX,SLV,SIL) restano voci piene
  // ma pesano METÀ ciascuna, per ridurre la sovraesposizione al metallo senza togliere voci.
  const halfMetals=(sc.id==="debasement"||sc.id==="debasementbtc");
  const HALF={SIL:true,SLV:true,GDX:true,GLD:true};
  let sum=0,wsum=0;
  sc.etfs.forEach(e=>{
    const v=calcMomScore(e);
    if(v==null)return;
    const w=(halfMetals&&HALF[e.t])?0.5:1;
    sum+=v*w; wsum+=w;
  });
  return wsum>0?sum/wsum:null;
}
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
function calcFinalScore(momentumComposite, leadingScore, scenarioId, history){
  if(leadingScore===null||leadingScore===undefined) return momentumComposite;
  let wLead = 0.70;
  if(history && history.length >= 3){
    const sorted=[...history].sort((a,b)=>a.week-b.week);
    const last3=sorted.slice(-3).map(h=>h.scores[scenarioId]).filter(v=>v!=null);
    if(last3.length===3){
      const rising=last3[2]>last3[1]&&last3[1]>last3[0];
      const falling=last3[2]<last3[1]&&last3[1]<last3[0];
      if(rising)  wLead=0.60;
      if(falling) wLead=0.80;
    }
  }
  return leadingScore * wLead + momentumComposite * (1-wLead);
}
function calcAvgMom(e){
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

const INDICATORS = {
  yieldCurve:0.51, vix:16.98,  move:70.41,  ism:52.7,   ismNewOrders:54.1, ismEmployment:46.4, ismPricesPaid:84.6,
  cpi:2.6,         ppi:4.0,    pce:3.2,     tedSpread:0.09, crb:393.40, bdi:2978,  ifo:83.3,
  euCpi:3.0,       jobless:189, lei:100.89, cfnai:-0.20,
  igSpread:0.81,   hySpread:2.83, emSpread:3.28,
  pcc:0.760,       pcce:0.615,  realYield:1.94, breakeven:2.69,
  us2y:3.880,      us10y:4.372, dxy:98.211,  oil:102.339, euribor:2.395, copperGold:0.0015,
  retailSales:3.97, housingStarts:1500, m2Dxy:230.99, nfp:178,
  ppiMom:0.5,      ppiCoreMom:0.4, cpiMom:0.9, cpiCoreMom:0.3,
  euCpiMom:1.0,    euCpiCoreMom:0.8, euPpiMom:-0.7, euPpiYoy:-3.0,
  spread2y:1.235,  spread10y:1.330, pceMom:0.3, de02y:2.645,
  athi:405,     atlo:226, trin:1.060,  spx:7230.12,
  btpBund:0.818,   vvixVix:5.60,
  dtb3:3.59,       sofr:3.66,   euur:6.2,    eujvr:2.2,
  de10y:3.042,     eurusd:1.17192, sx5e:5881.51, eursyy:1.7,
  deCurve:0.397,   euRealYield:0.042, deppimm:2.5, deppiyy:-0.2,
  spxComp:7430.7, gammaFlip:7513.42, putWallDom:7400.42, putWallNear:7430.42, callWallDom:7540.42, callWallNear:7460.42,
  pocVol:7531, highVol:7561, lowVol:7528,
};
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
  athi:86,      atlo:240, trin:0.650,  spx:7123.64,
  btpBund:0.845,   vvixVix:5.19,
  dtb3:3.61,       sofr:3.66,   euur:6.2,    eujvr:2.2,
  de10y:3.042,     eurusd:1.17192, sx5e:5881.51, eursyy:1.7,
  deCurve:0.397,   euRealYield:0.042, deppimm:2.5, deppiyy:-0.2,
};
// Storico dei FINAL score per settimana (per il delta TREND in %), persistito in localStorage
const FINALS_HIST = {};

// Baseline ancorato al GIORNO: il "precedente" (PREV_INDICATORS) si congela UNA volta al
// primo aggiornamento di ogni giornata (= ultimi valori di ieri) e NON si muove piu' fino a
// domani, qualunque sia il numero di refresh (manuali o automatici). Cosi' la variazione e'
// sempre "valore di adesso - chiusura di ieri", indipendente da quante volte rinfreschi.
function ensureDailyBaseline(keys){
  var today;
  try{today=new Date().toISOString().slice(0,10);}catch(e){today="";}
  var baseDate=null;
  try{baseDate=localStorage.getItem("pr_baseline_date");}catch(e){}
  if(baseDate===today)return false;             // baseline di oggi gia' fissato: non lo tocco
  (keys||Object.keys(INDICATORS)).forEach(function(k){
    if(INDICATORS[k]!=null&&!isNaN(INDICATORS[k]))PREV_INDICATORS[k]=INDICATORS[k];
  });
  try{localStorage.setItem("pr_prev_indicators",JSON.stringify(PREV_INDICATORS));}catch(e){}
  try{localStorage.setItem("pr_baseline_date",today);}catch(e){}
  return true;
}

function calcLeadingScore(scenarioId){
  const cfg=SCENARIO_CFG[scenarioId];if(!cfg)return null;
  let tw=0,ts=0;
  cfg.forEach(({id,w,dir,good,bad})=>{
    const v=INDICATORS[id];
    if(v!=null&&!isNaN(v)){ts+=compositeSignal(id,dir,good,bad)*w;tw+=w;}
  });
  return tw>0?(ts/tw):null;
}
function variationScore(id, dir, good, bad){
  const curr=INDICATORS[id], prev=PREV_INDICATORS[id];
  if(curr==null||prev==null||isNaN(curr)||isNaN(prev)) return 50;
  const delta=curr-prev;
  const range=Math.abs(good-bad);
  if(range===0) return 50;
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
function compositeSignal(id, dir, good, bad){
  const nom=signalScore(INDICATORS[id],dir,good,bad);
  const curr=INDICATORS[id], prev=PREV_INDICATORS[id];
  if(prev==null||curr==null||isNaN(prev)||isNaN(curr)||curr===prev) return nom;
  const var_=variationScore(id,dir,good,bad);
  return nom*0.60 + var_*0.40;
}

const SCENARIO_CFG = {
  stagflation: [
    {id:"pce",          w:.14,dir:"high",good:4.0,  bad:2.0},
    {id:"ismPricesPaid",w:.12,dir:"high",good:78,   bad:40},
    {id:"ppi",          w:.10,dir:"high",good:5.0,  bad:1.5},
    {id:"breakeven",    w:.10,dir:"high",good:2.8,  bad:2.0},
    {id:"ppiCoreMom",   w:.07,dir:"high",good:0.4,  bad:0.0},
    {id:"cpiCoreMom",   w:.07,dir:"high",good:0.35, bad:0.0},
    {id:"cpiMom",       w:.07,dir:"high",good:0.5,  bad:0.0},
    {id:"cpi",          w:.08,dir:"high",good:5.0,  bad:2.0},
    {id:"realYield",    w:.08,dir:"high",good:2.5,  bad:0.0},
    {id:"ism",          w:.05,dir:"low", good:45,   bad:55},
    {id:"ifo",          w:.04,dir:"low", good:85,   bad:102},
    {id:"us10y",        w:.04,dir:"high",good:5.0,  bad:2.5},
    {id:"oil",          w:.03,dir:"high",good:100,  bad:55},
    {id:"crb",          w:.06,dir:"high",good:420,  bad:280},
    {id:"ppiMom",       w:.06,dir:"high",good:0.5,  bad:0.0},
  ],
  debasement: [
    {id:"realYield",    w:.15,dir:"low", good:-0.5, bad:1.5},
    {id:"m2Dxy",        w:.13,dir:"high",good:230,  bad:210},
    {id:"breakeven",    w:.12,dir:"high",good:2.8,  bad:2.0},
    {id:"dxy",          w:.10,dir:"low", good:97,   bad:108},
    {id:"pce",          w:.08,dir:"high",good:4.0,  bad:2.0},
    {id:"pceMom",       w:.07,dir:"high",good:0.35, bad:0.0},
    {id:"emSpread",     w:.06,dir:"low", good:3.0,  bad:7.0},
    {id:"ppi",          w:.06,dir:"high",good:5.0,  bad:1.5},
    {id:"euribor",      w:.06,dir:"low", good:1.5,  bad:4.0},
    {id:"us10y",        w:.05,dir:"low", good:2.0,  bad:5.0},
    {id:"dtb3",         w:.04,dir:"low", good:2.0,  bad:5.0},
    {id:"ppiMom",       w:.06,dir:"high",good:0.4,  bad:0.0},
    {id:"crb",          w:.06,dir:"high",good:420,  bad:280},
    {id:"vvixVix",      w:.02,dir:"low", good:4.0,  bad:7.0},
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
    {id:"lei",          w:.12,dir:"high",good:101.5,bad:99.5},
    {id:"hySpread",     w:.10,dir:"low", good:2.5,  bad:6.0},
    {id:"yieldCurve",   w:.10,dir:"high",good:1.5,  bad:0.0},
    {id:"cfnai",        w:.08,dir:"high",good:0.2,  bad:-0.7},
    {id:"igSpread",     w:.08,dir:"low", good:0.6,  bad:2.0},
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
    {id:"ppiMom",       w:.06,dir:"mid", good:0.2,  bad:0.5},
  ],
  recession: [
    {id:"yieldCurve",   w:.15,dir:"low", good:-1.0, bad:0.5},
    {id:"lei",          w:.12,dir:"low", good:98.5, bad:101.5},
    {id:"hySpread",     w:.10,dir:"high",good:7.0,  bad:3.0},
    {id:"cfnai",        w:.08,dir:"low", good:-0.7, bad:0.2},
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
    {id:"move",         w:.03,dir:"high",good:120,  bad:70},
    {id:"ppiMom",       w:.06,dir:"low", good:0.0,  bad:0.5},
  ],
  reflation: [
    {id:"ismNewOrders", w:.12,dir:"high",good:58,   bad:48},
    {id:"yieldCurve",   w:.10,dir:"high",good:1.5,  bad:0.0},
    {id:"ppi",          w:.10,dir:"high",good:4.0,  bad:1.0},
    {id:"copperGold",   w:.09,dir:"high",good:0.003,bad:0.001},
    {id:"cpi",          w:.08,dir:"high",good:3.5,  bad:1.0},
    {id:"bdi",          w:.07,dir:"high",good:2500, bad:800},
    {id:"ism",          w:.07,dir:"high",good:55,   bad:48},
    {id:"ismPricesPaid",w:.07,dir:"high",good:70,   bad:40},
    {id:"retailSales",  w:.06,dir:"high",good:5.0,  bad:1.0},
    {id:"spx",          w:.05,dir:"high",good:7000, bad:5000},
    {id:"us10y",        w:.05,dir:"high",good:4.5,  bad:2.0},
    {id:"cpiMom",       w:.04,dir:"high",good:0.4,  bad:0.0},
    {id:"oil",          w:.03,dir:"high",good:85,   bad:55},
    {id:"ppiMom",       w:.06,dir:"high",good:0.5,  bad:0.0},
  ],
  disinflation: [
    {id:"breakeven",    w:.14,dir:"low", good:2.0,  bad:3.0},
    {id:"pceMom",       w:.12,dir:"low", good:0.1,  bad:0.3},
    {id:"yieldCurve",   w:.10,dir:"high",good:1.0,  bad:-0.5},
    {id:"cpi",          w:.09,dir:"low", good:2.0,  bad:5.0},
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
    {id:"oil",          w:.02,dir:"low", good:55,   bad:100},
    {id:"ppiMom",       w:.06,dir:"low", good:0.0,  bad:0.5},
  ],
  dollarweakness: [
    {id:"spread2y",     w:.15,dir:"low", good:0.5,  bad:1.8},
    {id:"dxy",          w:.13,dir:"low", good:97,   bad:107},
    {id:"realYield",    w:.12,dir:"low", good:-0.5, bad:1.5},
    {id:"spread10y",    w:.10,dir:"low", good:0.5,  bad:1.8},
    {id:"m2Dxy",        w:.10,dir:"high",good:230,  bad:210},
    {id:"euribor",      w:.10,dir:"high",good:3.5,  bad:1.5},
    {id:"de02y",        w:.08,dir:"high",good:3.0,  bad:1.5},
    {id:"breakeven",    w:.07,dir:"high",good:2.8,  bad:2.0},
    {id:"emSpread",     w:.05,dir:"low", good:2.5,  bad:6.0},
    {id:"hySpread",     w:.04,dir:"low", good:3.0,  bad:7.0},
    {id:"vix",          w:.03,dir:"low", good:15,   bad:30},
    {id:"ppiMom",       w:.06,dir:"high",good:0.35, bad:0.0},
    {id:"spx",          w:.04,dir:"high",good:7000, bad:5000},
    {id:"vvixVix",      w:.03,dir:"low", good:4.0,  bad:7.0},
  ],
  dollarweaknessbtc: [
    {id:"spread2y",     w:.14,dir:"low", good:0.5,  bad:1.8},
    {id:"dxy",          w:.13,dir:"low", good:97,   bad:107},
    {id:"realYield",    w:.12,dir:"low", good:-0.5, bad:1.5},
    {id:"m2Dxy",        w:.11,dir:"high",good:230,  bad:210},
    {id:"breakeven",    w:.10,dir:"high",good:2.8,  bad:2.0},
    {id:"euribor",      w:.09,dir:"high",good:3.5,  bad:1.5},
    {id:"de02y",        w:.07,dir:"high",good:3.0,  bad:1.5},
    {id:"spx",          w:.06,dir:"high",good:7000, bad:5000},
    {id:"pceMom",       w:.05,dir:"high",good:0.3,  bad:0.0},
    {id:"vvixVix",      w:.04,dir:"low", good:4.0,  bad:7.0},
    {id:"vix",          w:.03,dir:"low", good:15,   bad:35},
    {id:"crb",          w:.06,dir:"high",good:400,  bad:280},
    {id:"ppiMom",       w:.06,dir:"high",good:0.35, bad:0.0},
  ],
  deflation: [
    {id:"yieldCurve",   w:.12,dir:"low", good:-1.0, bad:1.0},
    {id:"hySpread",     w:.10,dir:"high",good:8.0,  bad:3.0},
    {id:"cpi",          w:.10,dir:"low", good:0.5,  bad:3.0},
    {id:"m2Dxy",        w:.08,dir:"low", good:205,  bad:235},
    {id:"cfnai",        w:.08,dir:"low", good:-0.7, bad:0.2},
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
    {id:"vix",          w:.03,dir:"high",good:40,   bad:15},
    {id:"bdi",          w:.02,dir:"low", good:500,  bad:2000},
  ],
};

// ── RISK MOM (intraday) ───────────────────────────────────────────
let SPY_SAT=null; // saturazione di mercato (SPY, da riga A11 del foglio): {st,s200,z,s50,g,w,m,q}
let RISK_MOM_DATA=[
  {t:"HYG", n:"iShares iBoxx High Yield", p:79.00, g:null, w:null},
  {t:"CPER",n:"US Copper Index Fund",     p:30.00, g:null, w:null},
  {t:"USO", n:"US Oil Fund (WTI)",        p:78.00, g:null, w:null},
  {t:"UUP", n:"Invesco DB US Dollar Bull", p:28.00, g:null, w:null},
  {t:"FEZ", n:"SPDR Euro Stoxx 50 (Europa)", p:55.00, g:null, w:null},
];
function buildPriceMap(){
  const m={};
  SCENARIOS.forEach(s=>s.etfs.forEach(e=>{if(!m[e.t])m[e.t]=e;}));
  ETF_NAZIONALI.forEach(e=>{if(!m[e.t])m[e.t]=e;});
  RISK_MOM_DATA.forEach(e=>{m[e.t]=e;});
  return m;
}
function isUSOpen(){
  try{
    const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Rome",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());
    const wd=parts.find(p=>p.type==="weekday").value;
    if(wd==="Sat"||wd==="Sun")return false;   // weekend = mercati chiusi
    const h=parseInt(parts.find(p=>p.type==="hour").value,10);
    const mn=parseInt(parts.find(p=>p.type==="minute").value,10);
    return (h*60+mn)>=(15*60+30);
  }catch(e){return new Date().getHours()>=15;}
}
const RISK_MOM_CFG=[
  {label:"SPX",num:"INDEXSP:.INX",den:null,w:12,scale:2.5},
  {label:"SX5E",num:"SX5E",den:null,w:5,scale:2.5},
  {label:"NQ1!",num:"NQ1!",den:null,w:9,scale:3.0},
  {label:"RTY1!",num:"RTY1!",den:null,w:4,scale:3.0},
  {label:"HG/GC",num:"HG1!",den:"GC1!",w:10,scale:3.0},
  {label:"HG/CL",num:"HG1!",den:"CL1!",w:7,scale:8.0},
  {label:"DXY",num:"DXY",den:null,w:10,scale:1.5,inv:true},
  {label:"USDJPY",num:"USDJPY",den:null,w:6,scale:1.5},
  {label:"AUDUSD",num:"AUDUSD",den:null,w:2,scale:1.5},
  {label:"VIX",num:"VIX",den:null,w:10,scale:12.0,inv:true},
  {label:"MOVE",num:"MOVE",den:null,w:4,scale:8.0,inv:true},
  {label:"VVIX/VIX",num:"VVIX",den:"VIX",w:5,scale:6.0},
  {label:"COR1M",num:"COR1M",den:null,w:8,scale:25.0,inv:true},
  {label:"BTC/GC",num:"BTCUSD",den:"GC1!",w:4,scale:5.0},
  {label:"XLY/XLP",num:"XLY",den:"XLP",w:4,scale:2.0},
];
function riskMomBlend(e,morning){
  if(!e)return null;
  const g=e.g,w=e.w;
  const hasG=g!=null&&!isNaN(g),hasW=w!=null&&!isNaN(w);
  if(morning){return hasW?w:null;}
  if(hasG&&hasW)return g*0.70+w*0.30;
  if(hasG)return g;
  if(hasW)return w;
  return null;
}
function fmtMomVal(v){if(v==null||isNaN(v))return "\u2014";var a=Math.abs(v);if(a>=1000)return Math.round(v).toLocaleString("it-IT");if(a>=100)return v.toFixed(0);if(a>=10)return v.toFixed(1);if(a>=1)return v.toFixed(2);if(a>=0.01)return v.toFixed(3);return v.toFixed(4);}
function calcRiskMomDetail(){
  const map=buildPriceMap();
  const morning=false;
  const rows=[];let tw=0,ts=0;
  RISK_MOM_CFG.forEach(c=>{
    let pct=null;
    if(c.snap){
      const cur=INDICATORS[c.snap],prev=PREV_INDICATORS[c.snap];
      if(cur!=null&&prev!=null&&!isNaN(cur)&&!isNaN(prev))pct=cur-prev;
    }else if(c.den){
      const bn=riskMomBlend(map[c.num],morning),bd=riskMomBlend(map[c.den],morning);
      if(bn!=null&&bd!=null)pct=bn-bd;
    }else{
      pct=riskMomBlend(map[c.num],morning);
    }
    let score=null;
    if(pct!=null&&!isNaN(pct)){let pp=c.inv?-pct:pct;score=Math.max(0,Math.min(100,50+(pp/c.scale)*50));}
    let value=null;
    if(c.snap){value=INDICATORS[c.snap];}
    else if(c.den){const aa=map[c.num],bb=map[c.den];value=(aa&&bb&&aa.p!=null&&bb.p!=null&&!isNaN(aa.p)&&!isNaN(bb.p)&&bb.p!==0)?aa.p/bb.p:null;}
    else{const a1=map[c.num];value=(a1&&a1.p!=null&&!isNaN(a1.p))?a1.p:null;}
    rows.push({...c,pct,score,value});
    if(score!=null){ts+=score*c.w;tw+=c.w;}
  });
  return {score:tw>0?ts/tw:50,rows,morning};
}
const RISK_LEAD_CFG=[
 {id:"ism",good:55,bad:44,w:4},{id:"ismNewOrders",good:55,bad:44,w:4},{id:"ismEmployment",good:53,bad:44,w:3},
 {id:"lei",good:101.5,bad:98,w:4},{id:"cfnai",good:0.2,bad:-0.7,w:2},{id:"ifo",good:102,bad:85,w:2},
 {id:"retailSales",good:5,bad:1,w:2},{id:"housingStarts",good:1500,bad:1100,w:2},{id:"nfp",good:250,bad:80,w:3},
 {id:"jobless",good:180,bad:380,w:3},{id:"bdi",good:2500,bad:800,w:2},{id:"copperGold",good:0.003,bad:0.001,w:3},
 {id:"vix",good:13,bad:35,w:7},{id:"move",good:70,bad:120,w:3},{id:"pcc",good:0.7,bad:1.2,w:2},{id:"pcce",good:0.6,bad:1.1,w:2},
 {id:"hySpread",good:2.5,bad:7.0,w:6},{id:"igSpread",good:0.6,bad:2.0,w:3},{id:"emSpread",good:2.5,bad:6.0,w:2},
 {id:"yieldCurve",good:1.5,bad:-0.5,w:4},
 {id:"_deCurve",label:"DE Yield Curve (DE10Y-DE02Y)",good:1.5,bad:-0.3,w:3,valFn:I=>(I.de10y!=null&&I.de02y!=null)?(I.de10y-I.de02y):null},
 {id:"realYield",good:-0.5,bad:2.5,w:3},
 {id:"us2y",good:2.0,bad:5.0,w:2},{id:"de02y",good:1.5,bad:4.0,w:2},{id:"euribor",good:1.5,bad:4.0,w:2},
 {id:"spread2y",good:0.5,bad:2.0,w:1},{id:"spread10y",good:0.5,bad:2.0,w:1},
 {id:"ppiMom",good:0.0,bad:0.5,w:3},{id:"ppiCoreMom",good:0.0,bad:0.4,w:2},{id:"cpiMom",good:0.1,bad:0.4,w:3},
 {id:"cpiCoreMom",good:0.1,bad:0.35,w:3},{id:"pceMom",good:0.1,bad:0.35,w:3},{id:"ppi",good:1.5,bad:5.0,w:2},
 {id:"cpi",good:2.0,bad:4.5,w:2},{id:"pce",good:2.0,bad:4.0,w:2},{id:"breakeven",good:2.0,bad:3.0,w:2},{id:"ismPricesPaid",good:40,bad:90,w:2},
 {id:"m2Dxy",good:225,bad:200,w:3},{id:"dxy",good:90,bad:110,w:3},{id:"oil",good:50,bad:130,w:1},{id:"crb",good:260,bad:450,w:1},
 {id:"euCpiMom",good:0.1,bad:0.4,w:1},{id:"euPpiMom",good:-0.5,bad:0.5,w:1},
 {id:"athi",label:"NYSE AT TODAY'S HIGH",good:520,bad:180,w:3},
 {id:"atlo",label:"NYSE AT TODAY'S LOW",good:120,bad:440,w:2},
 {id:"trin",good:0.5,bad:1.5,w:3},{id:"spx",good:8000,bad:5000,w:5},
 {id:"us10y",good:2.0,bad:4.0,w:2},{id:"vvixVix",good:7,bad:3,w:2},
 {id:"dtb3",good:2.0,bad:3.5,w:1},{id:"sofr",good:2.0,bad:3.5,w:1},
 {id:"euCpiCoreMom",good:0,bad:0.17,w:1},{id:"euPpiYoy",good:-2,bad:1.5,w:1},
 {id:"btpBund",good:0.5,bad:0.9,w:2},{id:"euur",good:5,bad:7,w:1},
 {id:"eujvr",good:0.5,bad:1.5,w:1},{id:"de10y",good:1.0,bad:2.5,w:1},
 {id:"sx5e",good:6500,bad:3500,w:2},{id:"eursyy",good:4.0,bad:0,w:1},
 {id:"deppimm",good:-0.5,bad:0.5,w:1},{id:"deppiyy",good:-2,bad:4.0,w:1},
];
function calcRiskLead(){
  const IND=INDICATORS;
  function rs(v,g,b){ if(v==null||isNaN(v))return 50;
    if(g>b){if(v>=g)return 100;if(v<=b)return 0;return((v-b)/(g-b))*100;}
    if(v<=g)return 100;if(v>=b)return 0;return((b-v)/(b-g))*100; }
  let tw=0,ts=0;const rows=[];
  RISK_LEAD_CFG.forEach(c=>{
    let v=c.valFn?c.valFn(IND):IND[c.id];
    let sc=(v==null||isNaN(v))?50:(c.inv?100-rs(v,c.good,c.bad):rs(v,c.good,c.bad));
    rows.push({id:c.id,label:c.label,value:v,score:sc,w:c.w,good:c.good,bad:c.bad,inv:!!c.inv});
    ts+=sc*c.w;tw+=c.w;
  });
  return {score:tw>0?ts/tw:50,rows};
}
const REVERSAL_CFG=[
 {id:"vix",src:"ind",label:"VIX",w:10,zones:[{op:"<=",thr:13,near:2,dir:"rib"},{op:">=",thr:30,near:5,dir:"rial"}]},
 {id:"COR1M",src:"px",label:"COR1M (corr. implicita)",w:9,zones:[{op:"<=",thr:7.5,near:3,dir:"rib"},{op:">=",thr:40,near:8,dir:"rial"}]},
 {id:"move",src:"ind",label:"MOVE",w:7,zones:[{op:"<=",thr:80,near:8,dir:"rib"},{op:">=",thr:130,near:15,dir:"rial"}]},
 {id:"trin",src:"ind",label:"TRIN",w:8,zones:[{op:"<=",thr:0.5,near:0.15,dir:"rib"},{op:">=",thr:2.0,near:0.4,dir:"rial"}]},
 {id:"pcc",src:"ind",label:"Put/Call totale",w:6,zones:[{op:"<=",thr:0.72,near:0.08,dir:"rib"},{op:">=",thr:1.23,near:0.15,dir:"rial"}]},
 {id:"pcce",src:"ind",label:"Put/Call equity",w:8,zones:[{op:"<=",thr:0.55,near:0.07,dir:"rib"},{op:">=",thr:1.10,near:0.15,dir:"rial"}]},
 {id:"vvixVix",src:"ind",label:"VVIX/VIX",w:6,zones:[{op:">=",thr:7,near:1,dir:"rib"},{op:"<=",thr:4,near:0.7,dir:"rial"}]},
 {id:"igSpread",src:"ind",label:"IG spread",unit:"%",w:6,zones:[{op:"<=",thr:0.90,near:0.10,dir:"rib"},{op:">=",thr:1.75,near:0.25,dir:"rial"}]},
 {id:"hySpread",src:"ind",label:"HY spread",unit:"%",w:8,zones:[{op:"<=",thr:3.0,near:0.4,dir:"rib"},{op:">=",thr:6.0,near:0.8,dir:"rial"}]},
 {id:"emSpread",src:"ind",label:"EM HY spread",unit:"%",w:5,zones:[{op:"<=",thr:3.5,near:0.5,dir:"rib"},{op:">=",thr:6.5,near:0.8,dir:"rial"}]},
 {id:"yieldCurve",src:"ind",label:"2s10s (T10Y2Y)",unit:"%",w:7,zones:[{op:"<=",thr:0,near:0.5,dir:"rib"}]},
 {id:"us10y",src:"ind",label:"US10Y",unit:"%",w:5,zones:[{op:">=",thr:4.5,near:0.4,dir:"rib"}]},
 {id:"dxy",src:"ind",label:"DXY",w:5,zones:[{op:">=",thr:105,near:3,dir:"rib"}]},
 {id:"USDJPY",src:"px",label:"USDJPY (carry)",w:6,zones:[{op:">=",thr:160,near:3,dir:"rib"}]},
];
function zoneProx(v,op,thr,near){
  if(v==null||isNaN(v))return 0;
  if(op==="<="){ if(v<=thr){var d=(thr-v)/near;return Math.min(1,0.5+0.5*Math.min(1,d));} if(v<=thr+near){return 0.5*(1-(v-thr)/near);} return 0; }
  else { if(v>=thr){var d2=(v-thr)/near;return Math.min(1,0.5+0.5*Math.min(1,d2));} if(v>=thr-near){return 0.5*(1-(thr-v)/near);} return 0; }
}
function fmtRev(c,v){ if(v==null||isNaN(v))return "\u2014"; var s=v.toFixed(2); return c.unit?(s+c.unit):s; }
function revBarCol(p){ if(p==null||isNaN(p))return "#374151"; var x=Math.max(0,Math.min(1,p)); return "hsl("+Math.round(120*(1-x))+",72%,45%)"; }
function calcReversal(getVal,daysMap){
  daysMap=daysMap||{};
  var ribSum=0,rialSum=0,ribW=0,rialW=0,rows=[];
  REVERSAL_CFG.forEach(function(c){
    var v=getVal(c.id,c.src);
    var maxProx=0,active=null,hasRib=false,hasRial=false,thrParts=[];
    c.zones.forEach(function(z){
      if(z.dir==="rib")hasRib=true; else hasRial=true;
      thrParts.push((z.op==="<="?"\u2264":"\u2265")+z.thr);
      var pr=zoneProx(v,z.op,z.thr,z.near);
      var dd=(daysMap[c.id]&&daysMap[c.id].dir===z.dir)?daysMap[c.id].days:0;
      var bonus=(pr>=0.5)?Math.min(1+dd*0.12,2.2):1;
      var contrib=pr*bonus*c.w;
      if(z.dir==="rib")ribSum+=contrib; else rialSum+=contrib;
      if(pr>maxProx){maxProx=pr; active=(pr>=0.5)?z.dir:active;}
    });
    if(hasRib)ribW+=c.w; if(hasRial)rialW+=c.w;
    var dObj=daysMap[c.id];
    rows.push({id:c.id,label:c.label,value:v,valueStr:fmtRev(c,v),thrTxt:thrParts.join(" / "),active:active,days:(dObj&&active&&dObj.dir===active)?dObj.days:0,prox:maxProx});
  });
  var scoreRib=ribW>0?Math.min(100,ribSum/ribW*100):0;
  var scoreRial=rialW>0?Math.min(100,rialSum/rialW*100):0;
  var headline=Math.max(scoreRib,scoreRial);
  var direction=scoreRib>=scoreRial?"rib":"rial";
  var label=headline<10?"nessun estremo rilevante":(direction==="rib"?"Rischio reversal RIBASSISTA":"Possibile reversal RIALZISTA");
  return {scoreRib:scoreRib,scoreRial:scoreRial,headline:headline,direction:direction,label:label,rows:rows};
}
function calcAllocation(score,active){
  const t=Math.max(0,Math.min(100,score))/100;
  let pRisk=15+t*50;            // 15 (off) -> 40 (neutro) -> 65 (on)
  let pCash=30-t*20;            // 30 (off) -> 20 (neutro) -> 10 (on)
  let pDef=100-pRisk-pCash;     // 55 (off) -> 40 (neutro) -> 25 (on)
  if(active.includes("stagflation")||active.includes("debasement")){pDef+=5;pRisk-=5;}
  if(active.includes("recession")){pCash+=5;pRisk-=5;}
  if(active.includes("goldilocks")){pRisk+=5;pDef-=5;}
  pRisk=Math.max(0,pRisk);pCash=Math.max(0,pCash);pDef=Math.max(0,pDef);
  let rRisk=Math.round(pRisk/5)*5;
  let rCash=Math.round(pCash/5)*5;
  if(rRisk+rCash>100){rCash=Math.max(0,100-rRisk);}
  let rDef=100-rRisk-rCash;
  if(rDef<0){rDef=0;rCash=Math.max(0,100-rRisk);}
  return {pRisk:rRisk,pDef:rDef,pCash:rCash};
}
// ── GATE: 3 gruppi + nazionali, tutto su VARIAZIONI di prezzo (blend 70/30 come Risk Mom) ──
// driver = variazione % (blend daily/weekly) del ticker-proxy
function driverVar(ticker){
  const map=buildPriceMap();
  return riskMomBlend(map[ticker], !isUSOpen());
}
function driverContrib(ticker, weight, scale){
  const v=driverVar(ticker);
  if(v==null||isNaN(v)||!weight)return 0;
  let n=v/(scale||2.5); if(n>1)n=1; if(n<-1)n=-1;
  return weight*n;
}
// ticker -> scenari di appartenenza (base del gruppo 3 = score finale più alto fra questi)
const TICKER_SCENARIOS=(function(){var m={};SCENARIOS.forEach(function(s){s.etfs.forEach(function(e){(m[e.t]=m[e.t]||[]).push(s.id);});});return m;})();
// gruppo 2 (risk-off / difensivi), ITA incluso
const GATE_RISKOFF=new Set(["XLU","XLP","XLV","TLT","IEF","SHY","BIL","LQD","VDST","FXF","SCHD"]);
// gruppo 3 (scenario-dipendenti): pesi driver per ticker {dol=dollaro, oil=petrolio, cina, tsy=treasury}
const GROUP3_W={
  GLD:{dol:20,tsy:15}, SLV:{dol:20,tsy:15}, GDX:{dol:20,tsy:15}, SIL:{dol:20,tsy:15},
  XLE:{dol:8,oil:20}, DBC:{dol:8,oil:20},
  MOO:{dol:8,oil:10}, DBA:{dol:8,oil:10},
  TIP:{dol:3,tsy:20},
};
// scenari di RIFERIMENTO del gruppo 3 (base = MAX solo su questi, non su tutte le appartenenze)
const GROUP3_CORE={
  GLD:["debasement","stagflation"], SLV:["debasement","stagflation"], GDX:["debasement","stagflation"], SIL:["debasement","stagflation"],
  DBC:["stagflation","reflation"], XLE:["stagflation","reflation"], DBA:["stagflation","reflation"], MOO:["stagflation","reflation"],
  TIP:["stagflation"],
};
// driver ETF nazionali — petrolio col segno (export+ / import−); gli altri magnitudini positive
const OIL_NAZ={KSA:20,EWC:12,EWZ:10,EWA:8,EWW:5,ILF:5,EEM:-3,EZA:-5,EWL:-4,EWN:-6,EWQ:-6,EWS:-6,GREK:-8,EPOL:-10,EWP:-10,EWT:-10,MCHI:-10,VEA:-5,DVYA:-5,EWI:-12,EWY:-12,DXJ:-12,EWG:-15,INDY:-18,TUR:-18};
const DOLLAR_NAZ={EWZ:15,TUR:15,EZA:15,EWW:12,EEM:10,ILF:10,INDY:10,MCHI:8,EWY:6,EWT:6,THD:6};
const CHINA_NAZ={MCHI:20,EWA:15,EWZ:12,EWG:8,EEM:8,EWY:5,EWT:5,THD:5};
const SEMI_NAZ={EWT:18,EWY:15,MCHI:5};
const METALS_NAZ={EWA:12,EZA:12,EWZ:10,ILF:10,EWC:6,EEM:5};
// momentum REGIONALE (antenna per lo sganciamento non-USA): regione su = bonus, regione giu = malus
const REGION_W=10;
const REGION_EU=new Set(["EWG","EWQ","EWI","EWP","EWN","EWL","GREK","EPOL"]);                 // -> FEZ
const REGION_EM=new Set(["EWZ","EWW","ILF","MCHI","EWT","EWY","INDY","THD","EZA","TUR","KSA","EWS","DVYA","EWA"]); // -> EEM (escluso EEM stesso)
// tilt secondari su asset risk-on con sensibilità a una commodity (oltre al Risk Mom di base)
const RISKON_DRIVERS={URA:{oil:8}, COPX:{cina:12,dol:8}, XME:{cina:5,dol:12}, XLB:{cina:5,dol:12}};   // uranio~petrolio; rame/metalli/materiali (Dr. Copper)~risk-on + Cina/dollaro

function gateValue(ticker, riskMom, scenarioScores, national){
  let v, label;
  if(national){
    label="nazionale"; v=riskMom;
    v+=driverContrib("USO",  OIL_NAZ[ticker]||0);
    v+=driverContrib("UUP", -(DOLLAR_NAZ[ticker]||0));
    v+=driverContrib("MCHI", CHINA_NAZ[ticker]||0);
    v+=driverContrib("SMH",  SEMI_NAZ[ticker]||0);
    v+=driverContrib("XME",  METALS_NAZ[ticker]||0);
    if(REGION_EU.has(ticker)) v+=driverContrib("FEZ", REGION_W);        // Europa: momentum Euro Stoxx
    else if(REGION_EM.has(ticker)) v+=driverContrib("EEM", REGION_W);   // EM/Asia: momentum emergenti
  } else if(GATE_RISKOFF.has(ticker)){
    label="risk-off"; v=100-riskMom;
  } else if(GROUP3_W[ticker]!==undefined){
    label="scenario";
    var core=GROUP3_CORE[ticker]||TICKER_SCENARIOS[ticker]||[];
    var bestScore=-1;
    core.forEach(function(id){var sc=scenarioScores?scenarioScores[id]:null; if(sc!=null&&sc>bestScore)bestScore=sc;});
    if(bestScore<0){ v=50; }
    else {
      var rank=1;
      if(scenarioScores){ for(var k in scenarioScores){ if(scenarioScores[k]!=null && scenarioScores[k]>bestScore) rank++; } }
      var rf = rank<=1?1.0 : rank===2?0.88 : rank===3?0.72 : rank===4?0.62 : rank===5?0.52 : 0.42;
      v = bestScore*rf;
    }
    var w=GROUP3_W[ticker];
    if(w.dol) v+=driverContrib("UUP", -w.dol);   // dollaro su = malus (commodity contrarie al $)
    if(w.oil) v+=driverContrib("USO", w.oil);    // petrolio su = bonus
    if(w.cina)v+=driverContrib("MCHI",w.cina);   // cina su = bonus
    if(w.tsy) v+=driverContrib("TLT", w.tsy);    // TLT su (tassi giù) = bonus; TLT giù (tassi su) = malus
  } else {
    label="risk-on"; v=riskMom;
    var rd=RISKON_DRIVERS[ticker];
    if(rd){
      if(rd.oil) v+=driverContrib("USO", rd.oil);
      if(rd.cina)v+=driverContrib("MCHI", rd.cina);
      if(rd.dol) v+=driverContrib("UUP", -rd.dol);   // dollaro su = malus
    }
  }
  v=Math.max(0,Math.min(100,v));
  var col=v>=60?"#10B981":v>=50?"#EAB308":v>=40?"#F97316":"#EF4444";
  return {v:v,col:col,label:label};
}
function gateDot(col){return col==="#10B981"?"🟢":col==="#EAB308"?"🟡":col==="#F97316"?"🟠":"🔴";}
function GatePill({ticker,riskMom,scenarioScores,national,size="sm"}){
  const g=gateValue(ticker,riskMom,scenarioScores,national);
  const lg=size==="lg";
  return <div title={"GATE: "+g.label+" ("+Math.round(g.v)+")"} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:lg?2:1}}>
    <div style={lg?{fontSize:7,color:"#475569",letterSpacing:1}:{fontSize:6,color:"#475569"}}>GATE</div>
    <span style={{color:g.col,fontSize:lg?18:14,lineHeight:1}}>●</span>
  </div>;
}

// ── TERMOMETRO: saturazione/ipercomprato (z 30% · stoca 25% · SMA200 18% · SMA50 12% · tempo 15%) ──
function satTime(w,m,q){
  if(w===null||w===undefined||isNaN(w)||m===null||m===undefined||isNaN(m))return null;
  if(m<=0)return 0;                       // non in salita → niente esaurimento rialzista
  var pace=m/4.3;                         // passo settimanale medio del mese
  var exhaustion=pace>0?Math.max(0,Math.min(100,100-(w/pace)*50)):50; // rallenta mentre teso → tirato
  var up=0,tot=0;[w,m,q].forEach(function(x){if(x!==null&&x!==undefined&&!isNaN(x)){tot++;if(x>0)up++;}});
  var maturity=tot?(up/tot)*100:50;       // quante finestre in salita → rialzo prolungato
  return exhaustion*0.65+maturity*0.35;
}
function satScore(o){
  if(!o)return null;
  var num=0,den=0;
  function add(v,w){if(v!==null&&v!==undefined&&!isNaN(v)){num+=v*w;den+=w;}}
  var sStoch=(o.st!==null&&o.st!==undefined&&!isNaN(o.st))?Math.max(0,Math.min(100,o.st)):null;
  var sZ=(o.z!==null&&o.z!==undefined&&!isNaN(o.z))?Math.max(0,Math.min(100,50+o.z*25)):null;
  var sS200=(o.s200!==null&&o.s200!==undefined&&!isNaN(o.s200))?Math.max(0,Math.min(100,50+o.s200*2)):null;
  var sS50=(o.s50!==null&&o.s50!==undefined&&!isNaN(o.s50))?Math.max(0,Math.min(100,50+o.s50*4)):null;
  var sTime=satTime(o.w,o.m,o.q);
  add(sZ,0.30);add(sStoch,0.25);add(sS200,0.18);add(sS50,0.12);add(sTime,0.15);
  return den>0?num/den:null;              // re-normalizza sui pesi effettivamente presenti
}
function satColor(v){return (v===null||v===undefined||isNaN(v))?"#6b7280":v>=75?"#EF4444":v>=60?"#F97316":v>=45?"#EAB308":"#10B981";}
function satDot(v){return (v===null||v===undefined||isNaN(v))?"⚪":v>=75?"🔴":v>=60?"🟠":v>=45?"🟡":"🟢";}
function satLabel(v){return (v===null||v===undefined||isNaN(v))?"—":v>=75?"IPERCOMPRATO":v>=60?"TIRATO":v>=45?"CARICO":"SCARICO";}
function SatPill({v,size="sm"}){
  const c=satColor(v);
  const lg=size==="lg";
  return <div title={"SAT: Saturazione "+((v===null||v===undefined||isNaN(v))?"n/d":Math.round(v))} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:lg?2:1}}>
    <div style={lg?{fontSize:7,color:"#475569",letterSpacing:1}:{fontSize:6,color:"#475569"}}>SAT</div>
    {(v===null||v===undefined||isNaN(v))
      ? <span style={{color:"#374151",fontSize:lg?14:10}}>—</span>
      : <span style={{background:c+"22",border:"1px solid "+c,borderRadius:5,padding:lg?"4px 6px":"2px 5px",fontFamily:"monospace",fontSize:lg?14:10,fontWeight:800,color:c,minWidth:lg?52:0,display:"inline-block",textAlign:"center"}}>{Math.round(v)}</span>}
  </div>;
}

// ── PARSER ──────────────────────────────────────────────────────
function extractNum(s){
  if(!s||s==="-"||s==="#N/A"||s==="")return null;
  var tabs=s.trim().split("\t");
  for(var i=tabs.length-1;i>=0;i--){
    var p=tabs[i].trim();
    if(!p)continue;
    var raw=p.split("%")[0].split("USD")[0].split("EUR")[0]
             .split("POINT")[0].split("K PSN")[0].split("PSN")[0]
             .split("MUNIT")[0].split(" B")[0].trim();
    if(!raw)continue;
    var neg=raw.charAt(0)==="-";
    if(neg)raw=raw.substring(1);
    var numStr="";
    var hasComma=raw.indexOf(",")>=0;
    var hasDot=raw.indexOf(".")>=0;
    if(hasComma&&hasDot){
      var di=raw.indexOf(".");var ci=raw.indexOf(",");
      if(di<ci){numStr=raw.split(".").join("").split(",").join(".");}
      else{numStr=raw.split(",").join("");}
    } else if(hasComma&&!hasDot){
      var parts=raw.split(",");
      var after=parts[parts.length-1];
      var before=parts[0];
      if(after.length===3&&(after==="000"||parseFloat(before)>=1000)){numStr=raw.split(",").join("");}
      else{numStr=raw.split(",").join(".");}
    } else if(!hasComma&&hasDot){
      var parts2=raw.split(".");
      if(parts2.length>2){numStr=raw.split(".").join("");}
      else{
        var after2=parts2[1];
        var before2=parts2[0];
        if(after2==="000"){numStr=raw.split(".").join("");}
        else if(after2.length===3&&parseFloat(before2)>=1000){numStr=raw.split(".").join("");}
        else{numStr=raw;}
      }
    } else {numStr=raw;}
    if(neg)numStr="-"+numStr;
    var n=parseFloat(numStr);
    if(!isNaN(n))return n;
  }
  return null;
}
function pPct(s){
  if(!s||s==="#N/A"||s==="-"||s==="")return null;
  var t=s.toString().split("%")[0].split(" ")[0].split(" ")[0];
  t=t.split(",").join(".");
  var n=parseFloat(t);
  return isNaN(n)?null:n;
}
function pPx(s){if(!s)return null;return extractNum(s);}
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
  var SCEN_MAP={"GOLDILOCKS ECONOMY":"goldilocks","RECESSION":"recession","STAGFLATION":"stagflation","REFLATION":"reflation","DISINFLATION/SOFT LANDING":"disinflation","DOLLAR WEAKNESS/GLOBAL REBALANCING +BITCOIN":"dollarweaknessbtc","DOLLAR WEAKNESS/GLOBAL REBALANCING":"dollarweakness","DEFLATION":"deflation","DEBASEMENT AGGRESSIVO":"debasementbtc","DEBASEMENT (SENZA BITCOIN)":"debasement"};
  var lines=text.split("\n");
  var upd={};var cur=null;var etfs=[];
  var riskMom=[];var inRiskMom=false;var spySat=null;
  function flush(){ if(cur&&etfs.length){if(!upd[cur])upd[cur]={etfs:[],avg:{}};upd[cur].etfs=etfs.slice();} }
  for(var li=0;li<lines.length;li++){
    var line=lines[li].split("\r").join("");
    var cols=pCSV(line);
    var f=(cols[0]||"").trim().toUpperCase();
    if(f==="SPY"&&cols[2]){spySat={st:pPct(cols[12]),s200:pPct(cols[13]),z:pPct(cols[14]),s50:pPct(cols[15]),g:pPct(cols[3]),w:pPct(cols[4]),m:pPct(cols[5]),q:pPct(cols[6])};}
    if(!f){ flush(); continue; }
    if(f==="RISK MOM"){ flush(); cur=null; inRiskMom=true; etfs=[]; continue; }
    var sid=SCEN_MAP[f];
    if(sid){ flush(); cur=sid; inRiskMom=false; etfs=[]; continue; }
    if(inRiskMom){
      if(f==="TICKER"||!cols[0]||!cols[2])continue;
      var rm={t:cols[0].trim(),n:cols[1]||"",p:pPx(cols[2]),g:pPct(cols[3]),w:pPct(cols[4]),m:pPct(cols[5]),q:pPct(cols[6]),s:pPct(cols[7]),y:pPct(cols[8]),st:pPct(cols[12]),s200:pPct(cols[13]),z:pPct(cols[14]),s50:pPct(cols[15])};
      if(rm.p)riskMom.push(rm);
      continue;
    }
    if(!cur)continue;
    if(f==="VAR.% MEDIA"){
      if(!upd[cur])upd[cur]={etfs:[],avg:{}};
      upd[cur].avg={g:pPct(cols[3]),w:pPct(cols[4]),m:pPct(cols[5]),q:pPct(cols[6]),s:pPct(cols[7]),y:pPct(cols[8]),y2:pPct(cols[9]),y3:pPct(cols[10]),y5:pPct(cols[11])};
      continue;
    }
    if(f==="TICKER"||!cols[0]||!cols[2])continue;
    var e={t:cols[0].trim(),n:cols[1]||"",p:pPx(cols[2]),g:pPct(cols[3]),w:pPct(cols[4]),m:pPct(cols[5]),q:pPct(cols[6]),s:pPct(cols[7]),y:pPct(cols[8]),y2:pPct(cols[9]),y3:pPct(cols[10]),y5:pPct(cols[11]),st:pPct(cols[12]),s200:pPct(cols[13]),z:pPct(cols[14]),s50:pPct(cols[15])};
    if(e.p)etfs.push(e);
  }
  flush();
  return {scenari:upd, riskMom:riskMom, spySat:spySat};
}
function parseNazionaliCSV(text){
  var lines=text.split("\n");
  var etfs=[];var ok=false;
  for(var li=0;li<lines.length;li++){
    var line=lines[li].split("\r").join("");
    var cols=pCSV(line);
    if((cols[0]||"").trim().toUpperCase()==="TICKER"){ok=true;continue;}
    if(!ok||!cols[0]||!cols[2])continue;
    var e={t:cols[0].trim(),n:cols[1]||"",p:pPx(cols[2]),g:pPct(cols[3]),w:pPct(cols[4]),m:pPct(cols[5]),q:pPct(cols[6]),s:pPct(cols[7]),y:pPct(cols[8]),y2:pPct(cols[9]),y3:pPct(cols[10]),y5:pPct(cols[11]),st:pPct(cols[12]),s200:pPct(cols[13]),z:pPct(cols[14]),s50:pPct(cols[15])};
    if(e.p)etfs.push(e);
  }
  return etfs;
}
function itNum(s){
  if(s==null)return null;
  s=String(s).replace(/%/g,"").replace(/"/g,"").trim();
  if(!s||s==="-"||s==="#N/A"||s==="#REF!"||s==="#DIV/0!"||s==="#VALUE!")return null;
  var neg=false; if(s.charAt(0)==="-"){neg=true;s=s.substring(1);}
  if(s.indexOf(".")>=0&&s.indexOf(",")>=0){ s=s.split(".").join("").split(",").join("."); }
  else if(s.indexOf(",")>=0){ s=s.split(",").join("."); }
  var n=parseFloat(s); if(isNaN(n))return null; return neg?-n:n;
}
function parseIndicatoriCSV(text){
  var TM={"T10Y2Y":"yieldCurve","VIX":"vix","MOVE":"move","USBCOI":"ism","USBCOL":"ism","USMNO":"ismNewOrders","USMEMP":"ismEmployment","USMPR":"ismPricesPaid","USCIR":"cpi","USPPIYY":"ppi","USCPCEPIAC":"pce","USCCEPIAC":"pce","USPPIMM":"ppiMom","USCPCEPIMM":"pceMom","USCCEPIMM":"pceMom","USIRMM":"cpiMom","DTB3":"dtb3","SOFR":"sofr","EUJVR":"eujvr","EUUR":"euur","EUIRYY":"euCpi","EUIRMM":"euCpiMom","EUCIRMM":"euCpiCoreMom","EUPPIMM":"euPpiMom","EUPPIYY":"euPpiYoy","DEPPIMM":"deppimm","DEPPIYY":"deppiyy","EURSYY":"eursyy","USRSYY":"retailSales","USHST":"housingStarts","M2SL/DXY":"m2Dxy","VVIX/VIX":"vvixVix","USNFP":"nfp","TRIN.NY":"trin","ATHI.NY":"athi","ATLO.NY":"atlo","USALOLITOAASTSAM":"lei","TRJEFFCRB":"crb","BDI":"bdi","DEIFOE":"ifo","USIJC":"jobless","USCFNAI":"cfnai","USCENAI":"cfnai","BAMLCOA0CM":"igSpread","BAMLCOAOCM":"igSpread","BAMLC0A0CM":"igSpread","BAMLCOACM":"igSpread","BAMLHOAOHYM2":"hySpread","BAMLH0A0HYM2":"hySpread","BAMLEMHBHYCRPIOAS":"emSpread","PCC":"pcc","PCCE":"pcce","US10Y":"us10y","DFII10":"realYield","T5YIE":"breakeven","USO2Y":"us2y","US02Y":"us2y","US10Y-DE10Y":"spread10y","US1OY-DE10Y":"spread10y","DE10Y-DE02Y":"deCurve","DE10Y-DEO2Y":"deCurve","USO2Y-DEO2Y":"spread2y","US02Y-DE02Y":"spread2y","IT10Y-DE10Y":"btpBund","IT1OY-DE10Y":"btpBund","DE10Y":"de10y","DEO2Y":"de02y","DE02Y":"de02y","EURUSD":"eurusd","DXY":"dxy","USOIL":"oil","USOLL":"oil","HG1!/GC1!":"copperGold","HG 1!/GC1!":"copperGold","SPX":"spx","SX5E":"sx5e","11!":"euribor","USCPPMM":"ppiCoreMom","USCIRMM":"cpiCoreMom","INDEXSP:.INX":"spx","CL1!":"oil","I1!":"euribor","SPX COMPANION":"spxComp","GAMMA FLIP":"gammaFlip","PUT WALL DOMINANTE":"putWallDom","PUT WALL NEAREST":"putWallNear","CALL WALL DOMINANTE":"callWallDom","CALL WALL NEAREST":"callWallNear","POC VOLUME":"pocVol","HIGH VOL LINE":"highVol","LOW VOL LINE":"lowVol"};
  var rows=[],row=[],f="",q=false;
  for(var i=0;i<text.length;i++){var c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){f+='"';i++;} else q=false; } else f+=c; }
    else { if(c==='"')q=true;
      else if(c===','){row.push(f);f="";}
      else if(c==='\n'){row.push(f);rows.push(row);row=[];f="";}
      else if(c==='\r'){}
      else f+=c; } }
  if(f.length||row.length){row.push(f);rows.push(row);}
  var upd={};
  rows.forEach(function(r){
    if(!r||r.length<3)return;
    var tk=(r[0]||"").trim().toUpperCase(); if(!tk)return;
    var key=TM[tk]; if(!key)return;
    var val=itNum(r[2]); if(val===null)return;
    if(key==="euribor"&&val>90)val=100-val;
    if(key==="housingStarts"&&val<10)val=val*1000;
    if(key==="bdi"&&val<100)val=val*1000;
    if(key==="spx"&&val<1000)val=val*1000;
    if(key==="sx5e"&&val<1000)val=val*1000;
    
    
    if((key==="igSpread"||key==="hySpread"||key==="emSpread")&&val>20)val=val/100;
    upd[key]=val;
  });
  if(upd.de10y!=null&&upd.euCpi!=null)upd.euRealYield=Math.round((upd.de10y-upd.euCpi)*1000)/1000;
  return upd;
}
function parseRiskMomFromIndic(text){
  var rows=[],row=[],f="",q=false;
  for(var i=0;i<text.length;i++){var c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){f+='"';i++;} else q=false; } else f+=c; }
    else { if(c==='"')q=true;
      else if(c===','){row.push(f);f="";}
      else if(c==='\n'){row.push(f);rows.push(row);row=[];f="";}
      else if(c==='\r'){}
      else f+=c; } }
  if(f.length||row.length){row.push(f);rows.push(row);}
  var out=[];
  rows.forEach(function(r){
    if(!r||r.length<4)return;
    var t=(r[0]||"").trim(); if(!t)return;
    var pp=itNum(r[2]),gg=itNum(r[3]);
    if(pp===null||gg===null)return;
    out.push({t:t,n:r[1]||"",p:pp,g:gg,w:itNum(r[4]),m:itNum(r[5]),q:itNum(r[6]),s:itNum(r[7]),y:itNum(r[8]),st:itNum(r[12]),s200:itNum(r[13]),z:itNum(r[14]),s50:itNum(r[15])});
  });
  return out;
}
function parseMacroText(text){
  var TM={"T10Y2Y":"yieldCurve","VIX":"vix","MOVE":"move","USBCOI":"ism","USMNO":"ismNewOrders","USMEMP":"ismEmployment","USMPR":"ismPricesPaid","USCIR":"cpi","USPPIYY":"ppi","USCPCEPIAC":"pce","USCCEPIAC":"pce","USPPIMM":"ppiMom","USCPCEPIMM":"pceMom","USIRMM":"cpiMom","DTB3":"dtb3","SOFR":"sofr","EUJVR":"eujvr","EUUR":"euur","EUIRYY":"euCpi","EUIRMM":"euCpiMom","EUCIRMM":"euCpiCoreMom","EUPPIMM":"euPpiMom","EUPPIYY":"euPpiYoy","DEPPIMM":"deppimm","DEPPIYY":"deppiyy","EURSYY":"eursyy","USRSYY":"retailSales","USHST":"housingStarts","M2SL/DXY":"m2Dxy","VVIX/VIX":"vvixVix","USNFP":"nfp","TRIN.NY":"trin","ATHI.NY":"athi","ATLO.NY":"atlo","USALOLITOAASTSAM":"lei","TRJEFFCRB":"crb","BDI":"bdi","DEIFOE":"ifo","USIJC":"jobless","USCFNAI":"cfnai","USCENAI":"cfnai","BAMLCOA0CM":"igSpread","BAMLCOAOCM":"igSpread","BAMLC0A0CM":"igSpread","BAMLHOAOHYM2":"hySpread","BAMLH0A0HYM2":"hySpread","BAMLEMHBHYCRPIOAS":"emSpread","PCC":"pcc","PCCE":"pcce","US10Y":"us10y","DFII10":"realYield","T5YIE":"breakeven","USO2Y":"us2y","US02Y":"us2y","US10Y-DE10Y":"spread10y","US1OY-DE10Y":"spread10y","US10Y-DE1OY":"spread10y","DE10Y-DE02Y":"deCurve","USO2Y-DEO2Y":"spread2y","US02Y-DE02Y":"spread2y","USO2Y-DE02Y":"spread2y","US02Y-DEO2Y":"spread2y","IT10Y-DE10Y":"btpBund","IT1OY-DE10Y":"btpBund","DE10Y":"de10y","DEO2Y":"de02y","DE02Y":"de02y","EURUSD":"eurusd","DXY":"dxy","USOIL":"oil","HG1!/GC1!":"copperGold","HG 1!/GC1!":"copperGold","SPX":"spx","SX5E":"sx5e","11!":"euribor","USCPPMM":"ppiCoreMom","USCIRMM":"cpiCoreMom","USBCOL":"ism","USOLL":"oil","BAMLCOACM":"igSpread"};
  var upd={};
  var lines=text.split("\n");
  for(var li=0;li<lines.length;li++){
    var line=lines[li].split("\r").join("").trim();
    if(!line)continue;
    var parts=line.split("\t");
    var tk=parts[0].trim().toUpperCase();
    var key=TM[tk];
    if(key){
      var val=null;
      if(parts.length>=2){val=extractNum(parts.slice(1).join("\t"));}
      if(val===null&&li+1<lines.length){val=extractNum(lines[li+1]);}
      if(val===null&&li+2<lines.length){val=extractNum(lines[li+2]);}
      if(key==="euribor"&&val!==null&&val>90)val=100-val;
      if(key==="housingStarts"&&val!==null&&val<10)val=val*1000;
      if(key==="bdi"&&val!==null&&val<100)val=val*1000;
      if(key==="spx"&&val!==null&&val<1000)val=val*1000;
      if(key==="sx5e"&&val!==null&&val<1000)val=val*1000;
      
      
      if(val!==null)upd[key]=val;
    }
  }
  return upd;
}

// ── APP ─────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("scenarios");
  const [rlDetailOpen,setRlDetailOpen]=useState(null);
  const [revDays,setRevDays]=useState(function(){try{return JSON.parse(localStorage.getItem("pr_reversal_days"))||{};}catch(e){return {};}});
  const [revOpen,setRevOpen]=useState(false);
  const [sel,setSel]=useState(null);
  const [per,setPer]=useState("y");
  const [history,setHistory]=useState([]);
  const [selLead,setSelLead]=useState(null);
  const [selRiskBox,setSelRiskBox]=useState(null);
  const [refreshing,setRefreshing]=useState(false);
  const [refreshMsg,setRefreshMsg]=useState("");
  const [macroText,setMacroText]=useState("");
  const [renderKey,setRenderKey]=useState(0);
  const [fetchStatus,setFetchStatus]=useState({sc:null,naz:null,macro:null,rm:null,time:null});

  const sc=sel?SCENARIOS.find(s=>s.id===sel):null;

  const SEED_HISTORY=[
    {week:15,update:"08/04/2026",scores:{goldilocks:81.6,recession:10.2,stagflation:48.6,reflation:90.2,disinflation:25.5,dollarweakness:70.8,deflation:0.0,dollarweaknessbtc:34.4,debasementbtc:61.8,debasement:100.0}},
    {week:16,update:"13/04/2026",scores:{goldilocks:81.6,recession:10.2,stagflation:48.6,reflation:90.2,disinflation:25.5,dollarweakness:70.8,deflation:0.0,dollarweaknessbtc:34.4,debasementbtc:61.8,debasement:100.0}},
    {week:17,update:"20/04/2026",scores:{goldilocks:90.5,recession:12.5,stagflation:45.2,reflation:70.1,disinflation:26.9,dollarweakness:59.5,deflation:0.0,dollarweaknessbtc:35.2,debasementbtc:80.9,debasement:100.0}},
    {week:18,update:"27/04/2026",scores:{goldilocks:100,recession:9,stagflation:47,reflation:65,disinflation:25,dollarweakness:55,deflation:0,dollarweaknessbtc:34,debasementbtc:78,debasement:87}},
    {week:19,update:"29/04/2026",scores:{goldilocks:100,recession:0,stagflation:73,reflation:81,disinflation:34,dollarweakness:64,deflation:10,dollarweaknessbtc:23,debasementbtc:46,debasement:55}},
  ];

  useEffect(function(){
    try{
      var savedScen=localStorage.getItem("pr_scenarios");
      if(savedScen){try{var scn=JSON.parse(savedScen);SCENARIOS.forEach(function(s){if(scn[s.id]&&scn[s.id].etfs&&scn[s.id].etfs.length>0){s.etfs=scn[s.id].etfs;if(scn[s.id].avg)Object.assign(s.avg,scn[s.id].avg);}});}catch(e){}}
      var savedNaz=localStorage.getItem("pr_nazionali");
      if(savedNaz){try{var naz=JSON.parse(savedNaz);if(naz&&naz.length>0){ETF_NAZIONALI.length=0;naz.forEach(function(e){ETF_NAZIONALI.push(e);});}}catch(e){}}
      var savedRm=localStorage.getItem("pr_riskmom");
      if(savedRm){try{var rm=JSON.parse(savedRm);if(rm&&rm.length>0){RISK_MOM_DATA.length=0;rm.forEach(function(e){RISK_MOM_DATA.push(e);});}}catch(e){}}
      var savedSpySat=localStorage.getItem("pr_spysat");
      if(savedSpySat){try{SPY_SAT=JSON.parse(savedSpySat);}catch(e){}}
      var savedInd=localStorage.getItem("pr_indicators");
      if(savedInd){var ind=JSON.parse(savedInd);Object.keys(ind).forEach(function(k){INDICATORS[k]=ind[k];});}
      var savedPrev=localStorage.getItem("pr_prev_indicators");
      if(savedPrev){var prev=JSON.parse(savedPrev);Object.keys(prev).forEach(function(k){PREV_INDICATORS[k]=prev[k];});}
      var savedFinals=localStorage.getItem("pr_finals_hist");
      if(savedFinals){var fh=JSON.parse(savedFinals);Object.keys(fh).forEach(function(k){FINALS_HIST[k]=fh[k];});}
    }catch(e){}
    fetch("https://drive.google.com/uc?export=download&id=1s6nF7_paJNgNJmuRotNPOpZKRodp8jMl")
      .then(function(r){return r.json();})
      .then(function(data){
        if(data&&data.history&&data.history.length>0){
          setHistory(function(h){
            var merged=[...SEED_HISTORY];
            data.history.forEach(function(entry){
              var exists=merged.findIndex(function(x){return x.week===entry.week;});
              if(exists>=0)merged[exists]=entry;
              else merged.push(entry);
            });
            return merged.sort(function(a,b){return a.week-b.week;});
          });
        }
      })
      .catch(function(){
        try{
          var bl=JSON.parse(localStorage.getItem("pr_week_baseline")||"null");
          if(bl){setHistory(function(h){var m=h.filter(function(x){return x.week!==bl.week;});m.push({week:bl.week,scores:bl.scores,update:"auto"});return m.sort(function(a,b){return a.week-b.week;});});}
        }catch(e){}
      })
      .finally(function(){setRenderKey(function(k){return k+1;});});
  },[]);

  function autoSavePrevScores(){
    try{
      var prevWeek=CURRENT_WEEK-1;
      var existing=localStorage.getItem("pr_week_baseline");
      if(existing){var bl=JSON.parse(existing);if(bl.week===prevWeek)return;}
      var scores={};
      calcAllScores().forEach(function(s){scores[s.id]=s.composite;});
      localStorage.setItem("pr_week_baseline",JSON.stringify({week:prevWeek,scores:scores,savedAt:new Date().toISOString()}));
    }catch(e){}
  }

  async function fetchOneSheet(url){
    for(var i=0;i<10;i++){
      try{
        var r=await fetch(url+"&t="+Date.now(),{cache:"no-store"}).then(function(x){return x.text();});
        if(!r.trim().startsWith("<"))return r;
      }catch(e){}
      await new Promise(function(res){setTimeout(res,2000);});
    }
    return null;
  }
  async function fetchEtfData(){
    const URL_SC="https://docs.google.com/spreadsheets/d/1lAR8AO3c_7UiCnhvz_FW-r97Wh21ZjzR5D6QSiGZtrk/export?format=csv&gid=0";
    const URL_MACRO="https://docs.google.com/spreadsheets/d/1lAR8AO3c_7UiCnhvz_FW-r97Wh21ZjzR5D6QSiGZtrk/export?format=csv&gid=576696521";
    const URL_NAZ="https://docs.google.com/spreadsheets/d/1lAR8AO3c_7UiCnhvz_FW-r97Wh21ZjzR5D6QSiGZtrk/export?format=csv&gid=2023978700";
    autoSavePrevScores();
    setRefreshing(true);setRefreshMsg("Carico...");setFetchStatus({sc:null,naz:null,macro:null,rm:null,time:null});
    var stSc=false,stNaz=false,stMacro=false,stRm=false;
    var r1=await fetchOneSheet(URL_SC);
    await new Promise(function(res){setTimeout(res,500);});
    var r2=await fetchOneSheet(URL_NAZ);
    await new Promise(function(res){setTimeout(res,500);});
    var r3=await fetchOneSheet(URL_MACRO);
    if(r1){
      var res=parseScenariCSV(r1);
      var su=res.scenari;
      var scOk=0;
      SCENARIOS.forEach(function(s){
        var u=su[s.id];
        if(u&&u.etfs&&u.etfs.length>0){
          var valid=u.etfs.filter(function(e){return e.p&&e.w!=null&&e.m!=null;});
          if(valid.length>=s.etfs.length*0.7){s.etfs=u.etfs;if(u.avg)Object.assign(s.avg,u.avg);scOk++;}
        }
      });
      stSc=scOk>=SCENARIOS.length*0.7;
      if(stSc){try{var so={};SCENARIOS.forEach(function(s){so[s.id]={etfs:s.etfs,avg:s.avg};});localStorage.setItem("pr_scenarios",JSON.stringify(so));}catch(e){}}
      if(res.riskMom&&res.riskMom.length>0){
        RISK_MOM_DATA.length=0;res.riskMom.forEach(function(e){RISK_MOM_DATA.push(e);});
        stRm=true;
        try{localStorage.setItem("pr_riskmom",JSON.stringify(RISK_MOM_DATA));}catch(e){}
      }
      if(res.spySat){SPY_SAT=res.spySat;try{localStorage.setItem("pr_spysat",JSON.stringify(SPY_SAT));}catch(e){}}
    }
    if(r2){
      var naz=parseNazionaliCSV(r2);
      var validNaz=naz?naz.filter(function(e){return e.p&&e.w!=null&&e.m!=null;}):[];
      if(validNaz.length>=ETF_NAZIONALI.length*0.7&&validNaz.length>0){
        ETF_NAZIONALI.length=0;naz.forEach(function(e){ETF_NAZIONALI.push(e);});
        stNaz=true;
        try{localStorage.setItem("pr_nazionali",JSON.stringify(ETF_NAZIONALI));}catch(e){}
      }
    }
    if(r3){
      var macroUpd=parseIndicatoriCSV(r3);
      var rmIndic=parseRiskMomFromIndic(r3);
      if(rmIndic&&rmIndic.length>0){RISK_MOM_DATA.length=0;rmIndic.forEach(function(e){RISK_MOM_DATA.push(e);});try{localStorage.setItem("pr_riskmom",JSON.stringify(RISK_MOM_DATA));}catch(e){}}
      var totalInd=Object.keys(INDICATORS).length;
      var updKeys=Object.keys(macroUpd).filter(function(k){return INDICATORS.hasOwnProperty(k);});
      var macroCount=new Set(updKeys).size;
      if(macroCount>0){
        ensureDailyBaseline(updKeys);              // baseline = chiusura di ieri, fisso per tutta la giornata
        updKeys.forEach(function(k){INDICATORS[k]=macroUpd[k];});   // aggiorno SEMPRE i valori correnti
        try{localStorage.setItem("pr_indicators",JSON.stringify(INDICATORS));}catch(e){}
        stMacro=macroCount>=totalInd*0.5;
      }
    }
    const now=new Date();
    var ts=now.getHours()+":"+String(now.getMinutes()).padStart(2,"0");
    setFetchStatus({sc:stSc,naz:stNaz,macro:stMacro,rm:stRm,time:ts});
    setRefreshing(false);setRenderKey(function(k){return k+1;});
  }

  // ── AUTO-REFRESH: all'avvio, ogni 60s, e quando torno sull'app ──
  // Sicuro: il baseline e' giornaliero (ensureDailyBaseline), quindi 1 o 100 refresh
  // al giorno NON spostano il "precedente" e non falsano la variazione/leading.
  const fetchRef=useRef(fetchEtfData); fetchRef.current=fetchEtfData;
  const refreshingRef=useRef(refreshing); refreshingRef.current=refreshing;
  useEffect(function(){
    function tick(){
      if(typeof document!=="undefined"&&document.hidden)return; // in background: salto
      if(refreshingRef.current)return;                          // refresh gia' in corso: salto
      if(fetchRef.current)fetchRef.current();
    }
    tick();                                   // all'avvio / ad ogni montaggio
    var iv=setInterval(tick,60000);           // ogni minuto
    function onVis(){if(typeof document==="undefined"||!document.hidden)tick();}
    if(typeof document!=="undefined")document.addEventListener("visibilitychange",onVis);
    if(typeof window!=="undefined")window.addEventListener("focus",onVis);
    return function(){
      clearInterval(iv);
      if(typeof document!=="undefined")document.removeEventListener("visibilitychange",onVis);
      if(typeof window!=="undefined")window.removeEventListener("focus",onVis);
    };
  },[]);

  function applyMacroText(){
    if(!macroText.trim()){setRefreshMsg("Incolla prima il testo");return;}
    const upd=parseMacroText(macroText);
    const n=Object.keys(upd).length;
    if(n===0){setRefreshMsg("Nessun ticker riconosciuto");return;}
    ensureDailyBaseline(Object.keys(upd));        // stesso baseline giornaliero del refresh
    Object.keys(upd).forEach(function(k){INDICATORS[k]=upd[k];});
    if(!window._macroUpdated)window._macroUpdated={};
    Object.keys(upd).forEach(function(k){window._macroUpdated[k]=true;});
    const SKIP_IND=["tedSpread","euRealYield","deCurve"];
    const allKeys=Object.keys(INDICATORS).filter(function(k){return SKIP_IND.indexOf(k)<0;});
    const targetInd=allKeys.length;
    const totalUpd=allKeys.filter(function(k){return !!window._macroUpdated[k];}).length;
    const missing=allKeys.filter(function(k){return !window._macroUpdated[k];});
    var msg="Incolla: +"+n+" | Aggiornati: "+totalUpd+"/"+targetInd;
    if(missing.length>0)msg+=" | Mancanti: "+missing.join(", ");
    try{localStorage.setItem("pr_indicators",JSON.stringify(INDICATORS));}catch(e){}
    setRefreshMsg(msg);
    setRenderKey(function(k){return k+1;});
  }

  const allMomScores=calcAllScores();
  const allEtfScores=calcAllEtfScores();
  const momMap=Object.fromEntries(allMomScores.map(s=>[s.id,s]));
  const etfMap=Object.fromEntries(allEtfScores.map(e=>[e.t,e]));
  const _satSrc=buildPriceMap();
  const satMap=Object.fromEntries(Object.keys(_satSrc).map(t=>{const e=_satSrc[t];return [t,satScore({st:e.st,s200:e.s200,z:e.z,s50:e.s50,w:e.w,m:e.m,q:e.q})];}));
  const spyMarketSat=satScore(SPY_SAT);
  const leadMap=Object.fromEntries(SCENARIOS.map(s=>[s.id,calcLeadingScore(s.id)]));
  const finalMap=Object.fromEntries(SCENARIOS.map(s=>{const m=momMap[s.id]?.composite,l=leadMap[s.id];return[s.id,calcFinalScore(m,l,s.id,history)];}));

  const riskMomDetail=calcRiskMomDetail();
  const riskMomScore=riskMomDetail.score;
  const riskLeadDetail=calcRiskLead();
  const riskLeadScore=riskLeadDetail.score;
  const riskOnOff=riskMomScore*0.6+riskLeadScore*0.4;
  // ===== GEX: SPX companion vs Gamma Flip / wall =====
  var gexData=null;
  (function(){
    var spx=INDICATORS.spxComp, flip=INDICATORS.gammaFlip,
        cwd=INDICATORS.callWallDom, cwn=INDICATORS.callWallNear,
        pwd=INDICATORS.putWallDom, pwn=INDICATORS.putWallNear;
    var vals=[spx,flip,cwd,cwn,pwd,pwn];
    if(vals.some(function(v){return v==null||isNaN(v);}))return;
    var levels=[
      {key:"cwd",label:"Call Wall dom",val:cwd,col:"#EF4444"},
      {key:"cwn",label:"Call Wall near",val:cwn,col:"#F97316"},
      {key:"flip",label:"Gamma Flip",val:flip,col:"#ffffff"},
      {key:"pwn",label:"Put Wall near",val:pwn,col:"#84CC16"},
      {key:"pwd",label:"Put Wall dom",val:pwd,col:"#10B981"}
    ];
    var poc=INDICATORS.pocVol, hiv=INDICATORS.highVol, lov=INDICATORS.lowVol;
    var volLevels=[];
    if(poc!=null&&!isNaN(poc))volLevels.push({key:"poc",label:"POC volume",val:poc,col:"#EAB308"});
    if(hiv!=null&&!isNaN(hiv))volLevels.push({key:"hiv",label:"High vol",val:hiv,col:"#38BDF8"});
    if(lov!=null&&!isNaN(lov))volLevels.push({key:"lov",label:"Low vol",val:lov,col:"#38BDF8"});
    var arr=levels.map(function(l){return l.val;}).concat([spx]).concat(volLevels.map(function(l){return l.val;}));
    var lo=Math.min.apply(null,arr), hi=Math.max.apply(null,arr);
    var pad=(hi-lo)*0.10||1, min=lo-pad, max=hi+pad, span=max-min;
    var posPct=function(v){return (max-v)/span*100;};
    var regime=spx>=flip?"GEX+":"GEX-";
    var regCol=spx>=flip?"#10B981":"#EF4444";
    var flipDistPct=(spx-flip)/flip*100;
    var nearest=levels[0], nd=Infinity;
    levels.forEach(function(l){var d=Math.abs(spx-l.val);if(d<nd){nd=d;nearest=l;}});
    var nearestPct=(spx-nearest.val)/nearest.val*100;
    var walls=[{label:"Call Wall dom",val:cwd},{label:"Call Wall near",val:cwn},{label:"Put Wall dom",val:pwd},{label:"Put Wall near",val:pwn}];
    var below=walls.filter(function(w){return w.val<spx;}).sort(function(a,b){return b.val-a.val;});
    var above=walls.filter(function(w){return w.val>spx;}).sort(function(a,b){return a.val-b.val;});
    var rangeLo=below.length?below[0].val:null, rangeHi=above.length?above[0].val:null;
    var rangeW=(rangeLo!=null&&rangeHi!=null)?(rangeHi-rangeLo)/spx*100:null;
    var pinWall=walls.filter(function(w){return Math.abs(spx-w.val)/w.val*100<=0.15;}).sort(function(a,b){return Math.abs(spx-a.val)-Math.abs(spx-b.val);})[0]||null;
    var adv = regime==="GEX+" ? {
      intro:"I market maker stabilizzano il mercato: se sale troppo lo riportano gi\u00f9, se scende troppo lo riportano su. Giornata probabilmente tranquilla, dentro un range.",
      car:["Volatilit\u00e0 pi\u00f9 bassa.","Prezzi che tendono a tornare verso livelli di equilibrio.","Maggiore probabilit\u00e0 di movimenti laterali o di range."],
      app:["Buy the dip su supporti importanti.","Vendere i rally vicino alle resistenze.","Strategie mean-reversion.","Target di profitto pi\u00f9 ravvicinati."]
    } : {
      intro:"I market maker amplificano i movimenti: se scende vendono ancora, se sale comprano ancora. Movimenti pi\u00f9 ampi e veloci, pi\u00f9 rischio di strappi e gap.",
      car:["Volatilit\u00e0 pi\u00f9 elevata.","Trend pi\u00f9 aggressivi.","Possibili accelerazioni e squeeze."],
      app:["Non comprare automaticamente il dip.","Seguire la direzione dominante del mercato.","Attendere conferme prima di entrare controtrend.","Ridurre la dimensione delle posizioni perch\u00e9 gli swing possono essere molto pi\u00f9 ampi."]
    };
    var allMk=levels.concat(volLevels).map(function(l){return {key:l.key,val:l.val,col:l.col,left:100-posPct(l.val)};});
    allMk.sort(function(a,b){return a.left-b.left;});
    var laneEnds=[]; var MINGAP=10;
    allMk.forEach(function(mk){var lane=0;while(lane<laneEnds.length&&(mk.left-laneEnds[lane])<MINGAP){lane++;}if(lane===laneEnds.length)laneEnds.push(mk.left);else laneEnds[lane]=mk.left;mk.lane=lane;});
    gexData={spx:spx,levels:levels,volLevels:volLevels,barMarkers:allMk,barLanes:Math.max(1,laneEnds.length),flipTop:posPct(flip),posPct:posPct,regime:regime,regCol:regCol,flipDistPct:flipDistPct,nearest:nearest,nearestPct:nearestPct,rangeLo:rangeLo,rangeHi:rangeHi,rangeW:rangeW,pinWall:pinWall,adv:adv};
  })();
  // ===== Reversal: valori, persistenza giorni-in-zona, punteggio =====
  var revPriceMap=buildPriceMap();
  var getRevVal=function(id,src){return src==="px"?(revPriceMap[id]?revPriceMap[id].p:null):INDICATORS[id];};
  useEffect(function(){
    var today=new Date().toISOString().slice(0,10);
    var next=Object.assign({},revDays),changed=false;
    REVERSAL_CFG.forEach(function(c){
      var v=getRevVal(c.id,c.src),dir=null;
      c.zones.forEach(function(z){ if(zoneProx(v,z.op,z.thr,z.near)>=0.5)dir=z.dir; });
      var prev=next[c.id]||{days:0,date:null,dir:null};
      if(dir){
        if(prev.date===today){ if(prev.dir!==dir){next[c.id]={days:1,date:today,dir:dir};changed=true;} }
        else { var d=(prev.dir===dir?prev.days:0)+1; next[c.id]={days:d,date:today,dir:dir}; changed=true; }
      } else { if(prev.days!==0||prev.dir!==null){ next[c.id]={days:0,date:today,dir:null}; changed=true; } }
    });
    if(changed){ setRevDays(next); try{localStorage.setItem("pr_reversal_days",JSON.stringify(next));}catch(e){} }
  },[REVERSAL_CFG.map(function(c){return getRevVal(c.id,c.src);}).join(",")]);
  var reversalData=calcReversal(getRevVal,revDays);
  var revHeadCol=reversalData.headline>=66?"#EF4444":reversalData.headline>=33?"#F59E0B":"#10B981";
  // Scenario "attivo" deciso dai DATI: i 2 con punteggio finale più alto (niente flag a mano)
  const activeIds=[...SCENARIOS].sort((a,b)=>(finalMap[b.id]??-1)-(finalMap[a.id]??-1)).slice(0,2).map(s=>s.id);
  SCENARIOS.forEach(s=>{s.active=activeIds.includes(s.id);});

  useEffect(()=>{
    const curScores=Object.fromEntries(allMomScores.map(s=>[s.id,s.composite]));
    const curFinals=Object.fromEntries(SCENARIOS.map(s=>[s.id,finalMap[s.id]]));
    FINALS_HIST[CURRENT_WEEK]=curFinals;
    try{localStorage.setItem("pr_finals_hist",JSON.stringify(FINALS_HIST));}catch(e){}
    setHistory(function(prevH){
      var base=prevH.length>0?prevH:[...SEED_HISTORY];
      var merged=base.filter(function(h){return h.week!==CURRENT_WEEK;});
      merged.push({week:CURRENT_WEEK,update:LAST_UPDATE,scores:curScores});
      return merged.sort(function(a,b){return a.week-b.week;}).slice(-8);
    });
  },[renderKey]);

  // Δ TREND settimana-su-settimana puro
  function getSmoothedDelta(sid){
    if(history.length<2)return null;
    const s=[...history].sort((a,b)=>a.week-b.week);
    const vals=s.map(h=>h.scores[sid]).filter(v=>v!=null);
    if(vals.length<2)return null;
    return vals[vals.length-1]-vals[vals.length-2];
  }
  function getFinalDeltaPct(sid){
    const weeks=Object.keys(FINALS_HIST).map(Number).sort((a,b)=>a-b);
    const vals=weeks.map(w=>(FINALS_HIST[w]&&FINALS_HIST[w][sid]!=null)?FINALS_HIST[w][sid]:null).filter(v=>v!=null);
    if(vals.length<2)return null;
    const prev=vals[vals.length-2], last=vals[vals.length-1];
    if(prev==null||prev===0)return null;
    return (last-prev)/prev*100;
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
    return <span style={{...base,background:c+"22",border:"1px solid "+c,color:c}}>{(d>=0?"+":"")+d.toFixed(1)+"%"}{a}</span>;
  }
  function MiniGate({ticker,national,size="sm"}){return <div style={{display:"flex",alignItems:"center",gap:size==="lg"?8:6}}><GatePill ticker={ticker} riskMom={riskMomScore} scenarioScores={finalMap} national={national} size={size}/><SatPill v={satMap[ticker]} size={size}/></div>;}
  function PillRow({e,score,national,size="sm"}){
    const arr=scoreArrow(score==null?0:score);
    const lg=size==="lg";
    const lab=lg?{fontSize:7,color:"#475569",letterSpacing:1}:{fontSize:6,color:"#475569"};
    const col={display:"flex",flexDirection:"column",alignItems:"center",gap:lg?2:1};
    return <div style={{display:"flex",alignItems:"center",gap:lg?8:6,justifyContent:"center"}}>
      <div style={col}><div style={lab}>AVG.MOM</div><AvgMomPill v={calcAvgMom(e)} size={size}/></div>
      <span style={{fontSize:13,color:arr.c,fontWeight:800}}>{arr.a}</span>
      <div style={col}><div style={lab}>SCORE</div><ScorePill v={score} size={size}/></div>
      <SatPill v={satMap[e.t]} size={size}/>
      <GatePill ticker={e.t} riskMom={riskMomScore} scenarioScores={finalMap} national={national} size={size}/>
    </div>;
  }

  const sortedByFinal=[...SCENARIOS].sort((a,b)=>(finalMap[b.id]??-999)-(finalMap[a.id]??-999));

  return <div style={{minHeight:"100vh",background:"#080812",color:"#e2e8f0",fontFamily:"system-ui,sans-serif",padding:16}}>
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:8,letterSpacing:4,color:"#F59E0B",textTransform:"uppercase",marginBottom:3}}>PORTAFOGLI RADAR · CALC v36</div>
          <h1 style={{fontSize:18,fontWeight:800,margin:0,color:"#f8fafc"}}>Macro Scenari</h1>
        </div>
      </div>
    </div>

    <div style={{display:"flex",gap:2,marginBottom:16,borderBottom:"1px solid #1f2937",flexWrap:"wrap"}}>
      {[{id:"scenarios",l:"📁 Scenari"},{id:"riskonoff",l:"🎯 Risk"},{id:"etfattivi",l:"⭐ ETF Attivi"},{id:"etfnaz",l:"🌍 ETF Nazionali"},{id:"indicatori",l:"📡 Indicatori"},{id:"banche",l:"🏦 Banche Centrali"},{id:"charts",l:"📈 Grafici"},{id:"aggiorna",l:"⚙️ Aggiorna"}].map(t=>(
        <button key={t.id} onClick={()=>{setTab(t.id);setSel(null);setSelLead(null);setSelRiskBox(null);}} style={{background:"none",border:"none",padding:"7px 12px",cursor:"pointer",fontSize:11,fontWeight:600,color:tab===t.id?"#F59E0B":"#6b7280",borderBottom:tab===t.id?"2px solid #F59E0B":"2px solid transparent",marginBottom:-1}}>{t.l}</button>
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
          const delta=getFinalDeltaPct(s.id);
          const fcol=scoreColor(final);
          const isCore=coreIds.has(s.id);
          return <div key={s.id} onClick={()=>setSel(s.id)} style={{background:isCore?"#0f172a":"#080812",border:"2px solid "+(isCore?s.color:"#1f2937"),borderRadius:12,padding:14,cursor:"pointer",boxShadow:isCore?"0 0 10px "+s.color+"55":"none"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{background:"#1e293b",color:"#6b7280",fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:4}}>#{rank+1}</div>
                <div style={{fontSize:13,color:s.color,letterSpacing:1,fontWeight:800}}>{s.name}</div>
              </div>
              <div style={{fontSize:11,color:"#4b5563"}}>›</div>
            </div>
            <div style={{fontSize:10,color:"#6b7280",marginBottom:10}}>{s.desc}</div>
            <div style={{display:"flex",gap:0,marginBottom:10}}>
              {[{label:"MOMENTUM",v:mom},{label:"Δ TREND",v:null,delta:true},{label:"LEADING",v:lead},{label:"FINAL SCORE",v:final,hi:true}].map(({label,v,hi,delta:isDelta},i)=>(
                <div key={i} style={{flex:1,textAlign:"center",borderRight:i<3?"1px solid #1e293b":"none",paddingRight:4,paddingLeft:i>0?4:0}}>
                  <div style={{fontSize:7,color:hi?"#F59E0B":"#4b5563",fontWeight:hi?700:400,marginBottom:4,letterSpacing:1}}>{label}</div>
                  {isDelta?<DeltaPill d={delta}/>:<ScorePill v={v} size="lg"/>}
                </div>
              ))}
            </div>
            <div style={{height:4,background:"#1e293b",borderRadius:2,overflow:"hidden",marginBottom:10}}>
              <div style={{height:"100%",width:(final??0)+"%",background:fcol,borderRadius:2,transition:"width 0.5s"}}/>
            </div>
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
            const d=getFinalDeltaPct(sc.id);
            const items=[
              {label:"MOM",    v:momMap[sc.id]?.composite, hi:false, isDelta:false},
              {label:"Δ TREND",v:null,                     hi:false, isDelta:true},
              {label:"LEAD",   v:leadMap[sc.id],           hi:false, isDelta:false},
              {label:"FINAL",  v:finalMap[sc.id],          hi:true,  isDelta:false},
            ];
            return items.map(({label,v,hi,isDelta})=>(
              <div key={label} style={{textAlign:"center"}}>
                <div style={{fontSize:8,color:hi?"#F59E0B":"#4b5563",marginBottom:3,fontWeight:hi?700:400}}>{label}</div>
                {isDelta?<DeltaPill d={d}/>:<ScorePill v={v} size="lg"/>}
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
              <th style={{textAlign:"right",padding:"5px 6px",fontSize:9,color:"#4b5563"}}>PREZZO</th>
              <th style={{textAlign:"center",padding:"5px 6px",fontSize:9,color:"#F59E0B"}}>MOM / GATE / SAT</th>
              {PERS.map(p=> <th key={p.k} style={{textAlign:"right",padding:"5px 4px",fontSize:9,color:per===p.k?"#F59E0B":"#4b5563",fontWeight:per===p.k?700:500}}>{p.l}</th>)}
            </tr>
          </thead>
          <tbody>
            {[...sc.etfs].sort((a,b)=>(etfMap[b.t]?.composite??-999)-(etfMap[a.t]?.composite??-999)).map((e,i)=> (
              <tr key={i} style={{borderTop:"1px solid #0f172a"}}>
                <td style={{padding:"9px 8px",fontFamily:"monospace",fontSize:11,fontWeight:700,color:sc.color}}>{e.t}</td>
                <td style={{padding:"9px 8px",fontSize:9,color:"#6b7280"}}>{e.n}</td>
                <td style={{padding:"9px 6px",textAlign:"right",verticalAlign:"bottom",fontFamily:"monospace",fontSize:10,color:"#e2e8f0"}}>${e.p.toFixed(2)}</td>
                <td style={{padding:"9px 6px",textAlign:"center",verticalAlign:"bottom"}}>
                  <PillRow e={e} score={etfMap[e.t]?.composite}/>
                </td>
                {PERS.map(p=> <td key={p.k} style={{padding:"9px 4px",textAlign:"right",verticalAlign:"bottom",background:per===p.k?"rgba(245,158,11,0.05)":"transparent"}}><Pct v={e[p.k]}/></td>)}
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
      const activeScenarios=SCENARIOS.filter(s=>s.active).map(s=>s.id);
      const alloc=calcAllocation(riskOnOff,activeScenarios);
      const pRisk=alloc.pRisk,pDef=alloc.pDef,pCash=alloc.pCash;

      function riskLabel(s){if(s>=75)return"RISK ON FORTE";if(s>=60)return"RISK ON";if(s>=45)return"NEUTRALE";if(s>=30)return"RISK OFF";return"RISK OFF FORTE";}
      function riskColor(s){if(s>=70)return"#10B981";if(s>=55)return"#84CC16";if(s>=45)return"#F59E0B";if(s>=30)return"#F97316";return"#EF4444";}

      const allEtfs=[];const seen2=new Set();
      SCENARIOS.forEach(s=>s.etfs.forEach(e=>{if(!seen2.has(e.t)){seen2.add(e.t);allEtfs.push({...e,scenarioId:s.id,scenarioColor:s.color});}}));
      const CASH_IDS=new Set(["SHY","BIL"]);
      // risk / difensivo DERIVATI dal gate: unica fonte di verità (niente liste separate che divergono)
      const isRiskOnT=(t)=>!GATE_RISKOFF.has(t)&&GROUP3_W[t]===undefined;
      const riskEtfs=allEtfs.filter(e=>!CASH_IDS.has(e.t)&&isRiskOnT(e.t)).sort((a,b)=>(etfMap[b.t]?.composite??0)-(etfMap[a.t]?.composite??0));
      const defEtfs=allEtfs.filter(e=>!CASH_IDS.has(e.t)&&!isRiskOnT(e.t)).sort((a,b)=>(etfMap[b.t]?.composite??0)-(etfMap[a.t]?.composite??0));
      const cashEtfs=allEtfs.filter(e=>CASH_IDS.has(e.t)).sort((a,b)=>(etfMap[b.t]?.composite??0)-(etfMap[a.t]?.composite??0));

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
                  <PillRow e={e} score={score} size="lg"/>
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

      const momCol=riskColor(riskMomScore),leadCol=riskColor(riskLeadScore),offCol=riskColor(riskOnOff);
      function MiniBox({title,sub,score,col,onClick,open}){
        return <div onClick={onClick} style={{flex:1,background:"#0f172a",border:"1px solid "+col+"66",borderRadius:12,padding:14,cursor:onClick?"pointer":"default"}}>
          <div style={{fontSize:12,fontWeight:800,color:"#f8fafc"}}>{title}</div>
          <div style={{fontSize:9,color:"#6b7280",marginBottom:10,minHeight:24}}>{sub}</div>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:4,marginBottom:8}}>
            <span style={{fontFamily:"monospace",fontSize:32,fontWeight:900,color:col}}>{Math.round(score)}</span>
            <span style={{fontSize:12,color:"#6b7280"}}>/100</span>
          </div>
          <div style={{height:8,borderRadius:5,background:"linear-gradient(to right,#EF4444,#F59E0B,#10B981)",position:"relative"}}>
            <div style={{position:"absolute",top:-3,left:"calc("+Math.max(0,Math.min(100,score))+"% - 6px)",width:12,height:14,background:"#fff",borderRadius:3,border:"2px solid #0f172a"}}/>
          </div>
          <div style={{textAlign:"center",fontSize:9,fontWeight:700,color:col,marginTop:8,letterSpacing:1}}>{riskLabel(score)}</div>
          {onClick&&<div style={{textAlign:"center",fontSize:8,color:"#6b7280",marginTop:6}}>{open?"\u25be chiudi dettaglio":"\u25b8 vedi dettaglio"}</div>}
        </div>;
      }

      return <div>
        <div style={{fontSize:8,color:"#6b7280",letterSpacing:2,marginBottom:14}}>RISK ON / RISK OFF</div>

        {/* Risk Mom (sx) + Risk Lead (dx) */}
        <div style={{display:"flex",gap:12,marginBottom:12}}>
          <MiniBox title="Risk Mom" sub="70% daily + 30% settimanale (gate orario sempre attivo)" score={riskMomScore} col={momCol} onClick={()=>setRlDetailOpen(rlDetailOpen==="mom"?null:"mom")} open={rlDetailOpen==="mom"}/>
          <MiniBox title="Risk Lead" sub="Score macro da 60 indicatori (leading, lento)" score={riskLeadScore} col={leadCol} onClick={()=>setRlDetailOpen(rlDetailOpen==="lead"?null:"lead")} open={rlDetailOpen==="lead"}/>
        </div>

        {/* Dettaglio Risk Mom (al click sul riquadro) */}
        {rlDetailOpen==="mom" && <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:"#6b7280",letterSpacing:2,marginBottom:8}}>RISK MOM — 17 VOCI · score 0=risk-off, 100=risk-on</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {riskMomDetail.rows.map((r,i)=>{
              const sCol=r.score==null?"#374151":scoreColor(r.score);
              const hasVal=r.value!=null&&!isNaN(r.value);
              return <div key={i} style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:8,flexWrap:"wrap"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#94a3b8"}}>{r.label}</div>
                  <div style={{fontFamily:"monospace",fontSize:20,fontWeight:800,color:hasVal?sCol:"#374151"}}>{hasVal?fmtMomVal(r.value):"\u2014"}</div>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:6}}>
                  <div style={{flex:1,background:"#080812",borderRadius:6,padding:"5px 8px",textAlign:"center",border:"1px solid #F59E0B44"}}>
                    <div style={{fontSize:7,color:"#F59E0B",marginBottom:2,fontWeight:700}}>SCORE</div>
                    <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:sCol}}>{r.score==null?"\u2014":Math.round(r.score)}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:16,fontSize:9,color:"#4b5563",flexWrap:"wrap"}}>
                  <div>Momentum: <span style={{fontFamily:"monospace",color:"#94a3b8",fontWeight:700}}>{r.pct==null?"\u2014":(r.pct>0?"+":"")+r.pct.toFixed(2)}</span></div>
                  <div>Peso: <span style={{color:"#F59E0B",fontWeight:700}}>{r.w}</span></div>
                  <div>Direzione: <span style={{color:"#94a3b8",fontWeight:700}}>{r.inv?"\u2193 inv (sale=risk-off)":"\u2191 dir (sale=risk-on)"}</span></div>
                </div>
              </div>;
            })}
          </div>
        </div>}

        {/* Dettaglio Risk Lead (al click sul riquadro) */}
        {rlDetailOpen==="lead" && <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:"#6b7280",letterSpacing:2,marginBottom:8}}>RISK LEAD — {riskLeadDetail.rows.length} INDICATORI · score 0=risk-off, 100=risk-on</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[...riskLeadDetail.rows].sort((a,b)=>b.score-a.score).map((r,i)=>{
              const meta=IND_META[r.id];
              const label=r.label||(meta&&meta.label)||r.id;
              const hasVal=r.value!=null&&!isNaN(r.value);
              const valStr=hasVal?((meta&&meta.fmt)?meta.fmt(r.value):r.value.toFixed(2)):"\u2014";
              const sCol=scoreColor(r.score);
              return <div key={i} style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:8,flexWrap:"wrap"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#94a3b8"}}>{label}</div>
                  <div style={{fontFamily:"monospace",fontSize:20,fontWeight:800,color:hasVal?sCol:"#374151"}}>{valStr}</div>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:6}}>
                  <div style={{flex:1,background:"#080812",borderRadius:6,padding:"5px 8px",textAlign:"center",border:"1px solid #F59E0B44"}}>
                    <div style={{fontSize:7,color:"#F59E0B",marginBottom:2,fontWeight:700}}>SCORE</div>
                    <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:sCol}}>{Math.round(r.score)}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:16,fontSize:9,color:"#4b5563",flexWrap:"wrap"}}>
                  <div>Peso: <span style={{color:"#F59E0B",fontWeight:700}}>{r.w}</span></div>
                  <div>Direzione: <span style={{color:"#94a3b8",fontWeight:700}}>{(r.good>r.bad?!r.inv:r.inv)?"\u2191 dir":"\u2193 inv"}</span></div>
                </div>
              </div>;
            })}
          </div>
        </div>}

        {/* Risk On/Off composito a tutta larghezza */}
        <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:14,padding:20,marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:800,color:"#f8fafc",marginBottom:4}}>Risk On / Risk Off</div>
          <div style={{fontSize:10,color:"#6b7280",marginBottom:20}}>Media ponderata: 60% Risk Mom + 40% Risk Lead</div>
          <div style={{position:"relative",marginBottom:8}}>
            <div style={{height:14,borderRadius:7,background:"linear-gradient(to right, #EF4444, #F97316, #F59E0B, #84CC16, #10B981)",position:"relative"}}>
              <div style={{position:"absolute",top:-6,left:"calc("+Math.max(0,Math.min(100,riskOnOff))+"% - 8px)",width:16,height:26,background:"#fff",borderRadius:3,boxShadow:"0 0 8px rgba(255,255,255,0.6)",border:"2px solid #0f172a"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <div style={{fontSize:8,color:"#EF4444",fontWeight:600}}>Ext. Risk Off</div>
              <div style={{fontSize:8,color:"#F59E0B",fontWeight:600}}>Neutral</div>
              <div style={{fontSize:8,color:"#10B981",fontWeight:600}}>Ext. Risk On</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:16,marginBottom:8}}>
            <div style={{background:offCol+"22",border:"1px solid "+offCol,borderRadius:8,padding:"6px 16px",fontSize:13,fontWeight:800,color:offCol,letterSpacing:1}}>{riskLabel(riskOnOff)}</div>
            <div style={{fontFamily:"monospace",fontSize:36,fontWeight:900,color:offCol}}>{Math.round(riskOnOff)}<span style={{fontSize:14,color:"#6b7280"}}>%</span></div>
          </div>
        </div>

        {/* Saturazione di mercato (SPY) */}
        <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:14,padding:20,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <div style={{fontSize:13,fontWeight:800,color:"#f8fafc"}}>Saturazione di mercato (SPY)</div>
          </div>
          <div style={{fontSize:10,color:"#6b7280",marginBottom:20}}>Quanto è tirato il mercato — z-score 30% · stocastico 25% · SMA200 18% · SMA50 12% · tempo 15%</div>
          {(spyMarketSat===null||spyMarketSat===undefined||isNaN(spyMarketSat))
            ? <div style={{fontSize:11,color:"#6b7280"}}>Dati SPY non disponibili (colonne M–P del foglio su riga SPY)</div>
            : <div>
                <div style={{position:"relative",marginBottom:8}}>
                  <div style={{height:14,borderRadius:7,background:"linear-gradient(to right, #10B981, #84CC16, #F59E0B, #F97316, #EF4444)",position:"relative"}}>
                    <div style={{position:"absolute",top:-6,left:"calc("+Math.max(0,Math.min(100,spyMarketSat))+"% - 8px)",width:16,height:26,background:"#fff",borderRadius:3,boxShadow:"0 0 8px rgba(255,255,255,0.6)",border:"2px solid #0f172a"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                    <div style={{fontSize:8,color:"#10B981",fontWeight:600}}>Scarico</div>
                    <div style={{fontSize:8,color:"#F59E0B",fontWeight:600}}>Carico</div>
                    <div style={{fontSize:8,color:"#EF4444",fontWeight:600}}>Ipercomprato</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:16,marginBottom:8}}>
                  <div style={{background:satColor(spyMarketSat)+"22",border:"1px solid "+satColor(spyMarketSat),borderRadius:8,padding:"6px 16px",fontSize:13,fontWeight:800,color:satColor(spyMarketSat),letterSpacing:1}}>{satLabel(spyMarketSat)}</div>
                  <div style={{fontFamily:"monospace",fontSize:36,fontWeight:900,color:satColor(spyMarketSat)}}>{Math.round(spyMarketSat)}<span style={{fontSize:14,color:"#6b7280"}}>%</span></div>
                </div>
              </div>}
        </div>
        {/* Reversal */}
        <div onClick={()=>setRevOpen(!revOpen)} style={{background:"#0f172a",border:"1px solid "+revHeadCol+"66",borderRadius:14,padding:20,marginBottom:12,cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:18}}>🔁</span>
            <div style={{fontSize:13,fontWeight:800,color:"#f8fafc"}}>Reversal — rischio cambio regime</div>
          </div>
          <div style={{fontSize:10,color:"#6b7280",marginBottom:14}}>Estremi di sentiment/volatilità/credito + persistenza (giorni in zona)</div>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:6,marginBottom:8}}>
            <span style={{fontFamily:"monospace",fontSize:36,fontWeight:900,color:revHeadCol}}>{Math.round(reversalData.headline)}</span>
            <span style={{fontSize:13,color:"#6b7280"}}>%</span>
          </div>
          <div style={{height:10,borderRadius:6,background:"linear-gradient(to right,#10B981,#F59E0B,#EF4444)",position:"relative"}}>
            <div style={{position:"absolute",top:-4,left:"calc("+Math.max(0,Math.min(100,reversalData.headline))+"% - 7px)",width:14,height:18,background:"#fff",borderRadius:3,border:"2px solid #0f172a"}}/>
          </div>
          <div style={{textAlign:"center",fontSize:11,fontWeight:800,color:revHeadCol,marginTop:10,letterSpacing:1}}>{reversalData.label}</div>
          <div style={{textAlign:"center",fontSize:8,color:"#6b7280",marginTop:6}}>{revOpen?"▾ chiudi dettaglio":"▸ vedi dettaglio"} · ribassista {Math.round(reversalData.scoreRib)} / rialzista {Math.round(reversalData.scoreRial)}</div>
        </div>
        {revOpen && <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:"#6b7280",letterSpacing:2,marginBottom:8}}>REVERSAL — {reversalData.rows.length} INDICATORI · ordinati per prossimità</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {reversalData.rows.slice().sort(function(a,b){return b.prox-a.prox;}).map(function(r,i){
              var barCol=revBarCol(r.prox);
              var valCol=(r.value==null||isNaN(r.value))?"#374151":(r.active?barCol:"#94a3b8");
              var stCol=r.active?barCol:"#6b7280";
              var stTxt=r.active==="rib"?"compiacenza → rischio ribassista":r.active==="rial"?"panico → possibile bottom":"neutro";
              return <div key={i} style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:10,padding:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,gap:8,flexWrap:"wrap"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#94a3b8"}}>{r.label}</div>
                  <div style={{fontFamily:"monospace",fontSize:18,fontWeight:800,color:valCol}}>{r.valueStr}</div>
                </div>
                <div style={{display:"flex",gap:12,fontSize:9,color:"#4b5563",flexWrap:"wrap",alignItems:"center"}}>
                  <div style={{color:stCol,fontWeight:700}}>{stTxt}</div>
                  <div>soglie: <span style={{fontFamily:"monospace",color:"#94a3b8"}}>{r.thrTxt}</span></div>
                  <div>giorni in zona: <span style={{fontFamily:"monospace",color:stCol,fontWeight:700}}>{r.days}</span></div>
                </div>
                <div style={{marginTop:6,height:4,borderRadius:2,background:"#1f2937"}}>
                  <div style={{height:4,borderRadius:2,width:Math.round(r.prox*100)+"%",background:barCol}}/>
                </div>
              </div>;
            })}
          </div>
        </div>}
        {/* GEX - barra orizzontale */}
        <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:14,padding:20,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:18}}>🧲</span>
            <div style={{fontSize:13,fontWeight:800,color:"#f8fafc"}}>GEX - Regime opzioni</div>
          </div>
          <div style={{fontSize:10,color:"#6b7280",marginBottom:8}}>SPX companion vs Gamma Flip e wall</div>
          {!gexData
            ? <div style={{fontSize:11,color:"#6b7280"}}>Dati GEX non disponibili (sezione GEX del foglio).</div>
            : <div>
                <div style={{position:"relative",height:(54+gexData.barLanes*13),marginTop:22,marginBottom:10}}>
                  <div style={{position:"absolute",left:0,right:0,top:34,height:12,borderRadius:6,background:"linear-gradient(to right, #EF4444 0%, #EF4444 "+(100-gexData.flipTop)+"%, #10B981 "+(100-gexData.flipTop)+"%, #10B981 100%)"}}/>
                  {gexData.barMarkers.map(function(m){
                    var labTop=50+m.lane*13;
                    return [<div key={m.key+"-t"} style={{position:"absolute",left:"calc("+m.left+"% - 1px)",top:34,width:2,height:(labTop-34),background:m.col,opacity:0.85}}/>,<div key={m.key+"-v"} style={{position:"absolute",left:"calc("+m.left+"% - 18px)",top:labTop,width:36,textAlign:"center",fontSize:9,fontWeight:700,color:m.col,fontFamily:"monospace"}}>{Math.round(m.val)}</div>];
                  })}
                  <div style={{position:"absolute",left:"calc("+(100-gexData.posPct(gexData.spx))+"% - 24px)",top:-8,width:48,textAlign:"center",zIndex:4}}>
                    <div style={{display:"inline-block",background:"#fff",color:"#0f172a",fontFamily:"monospace",fontSize:9,fontWeight:800,padding:"1px 5px",borderRadius:3,whiteSpace:"nowrap"}}>SPX {Math.round(gexData.spx)}</div>
                    <div style={{margin:"2px auto 0",width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderTop:"9px solid #fff"}}/>
                  </div>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"4px 16px",marginBottom:12}}>
                  {gexData.levels.concat(gexData.volLevels).map(function(l){
                    var d=(gexData.spx-l.val)/l.val*100;
                    return <div key={l.key} style={{display:"flex",alignItems:"center",gap:6,fontSize:9}}>
                      <span style={{width:8,height:8,borderRadius:2,background:l.col,display:"inline-block"}}/>
                      <span style={{color:"#94a3b8",fontWeight:700}}>{l.label}</span>
                      <span style={{fontFamily:"monospace",color:"#e2e8f0"}}>{Math.round(l.val)}</span>
                      <span style={{fontFamily:"monospace",color:"#6b7280"}}>({(d>=0?"+":"")+d.toFixed(2)}%)</span>
                    </div>;
                  })}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <div style={{background:gexData.regCol+"22",border:"1px solid "+gexData.regCol,borderRadius:8,padding:"5px 14px",fontSize:14,fontWeight:800,color:gexData.regCol,letterSpacing:1}}>{gexData.regime}</div>
                  <div style={{fontSize:10,color:"#94a3b8"}}>dal Gamma Flip <span style={{fontFamily:"monospace",fontWeight:700,color:"#e2e8f0"}}>{(gexData.flipDistPct>=0?"+":"")+gexData.flipDistPct.toFixed(2)}%</span> ({gexData.flipDistPct>=0?"sopra":"sotto"})</div>
                  <div style={{fontSize:10,color:"#94a3b8"}}>Soglia vicina: <span style={{fontWeight:700,color:gexData.nearest.col}}>{gexData.nearest.label}</span> ({(gexData.nearestPct>=0?"+":"")+gexData.nearestPct.toFixed(2)}%)</div>
                  {gexData.rangeW!=null && <div style={{fontSize:10,color:"#94a3b8"}}>Range implicito <span style={{fontFamily:"monospace",color:"#e2e8f0"}}>{Math.round(gexData.rangeLo)}–{Math.round(gexData.rangeHi)}</span> ({gexData.rangeW.toFixed(2)}%)</div>}
                </div>
              </div>}
        </div>

        {/* GEX - pinning + consigli */}
        {gexData && <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:14,padding:20,marginBottom:12}}>
          {gexData.pinWall && <div style={{fontSize:11,color:"#F59E0B",fontWeight:700,marginBottom:12,background:"#F59E0B14",border:"1px solid #F59E0B55",borderRadius:8,padding:"8px 12px"}}>⚠ Rischio pinning: SPX incollato a {gexData.pinWall.label} ({Math.round(gexData.pinWall.val)})</div>}
          <div style={{fontSize:13,fontWeight:800,color:gexData.regCol,marginBottom:8}}>Consigli del giorno — {gexData.regime}</div>
          <div style={{fontSize:11,color:"#cbd5e1",lineHeight:1.6,marginBottom:12}}>{gexData.adv.intro}</div>
          <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",marginBottom:4}}>Caratteristiche tipiche</div>
          <ul style={{margin:"0 0 12px 0",paddingLeft:18,fontSize:11,color:"#cbd5e1",lineHeight:1.6}}>
            {gexData.adv.car.map(function(t,i){return <li key={i}>{t}</li>;})}
          </ul>
          <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",marginBottom:4}}>Approcci spesso utilizzati</div>
          <ul style={{margin:0,paddingLeft:18,fontSize:11,color:"#cbd5e1",lineHeight:1.6}}>
            {gexData.adv.app.map(function(t,i){return <li key={i}>{t}</li>;})}
          </ul>
        </div>}

        {/* Ripartizione continua */}
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
        <div style={{fontSize:8,color:"#374151",textAlign:"center",marginTop:6}}>Scenario attivo: {activeScenarios.join(" + ").toUpperCase()||"nessuno"} · Risk On/Off {Math.round(riskOnOff)}/100</div>
      </div>;
    })()}

    {tab==="etfattivi"&&<div>
      {(()=>{
        const seen=new Set(),allU=[];
        SCENARIOS.forEach(s=>s.etfs.forEach(e=>{if(!seen.has(e.t)){seen.add(e.t);allU.push(e);}}));
        const top2=[...SCENARIOS].sort((a,b)=>{
          const aS=(a.avg.s??-999)*0.70+(a.avg.q??-999)*0.30;
          const bS=(b.avg.s??-999)*0.70+(b.avg.q??-999)*0.30;
          return bS-aS;
        }).slice(0,2);
        const coreTickers=new Set();
        top2.forEach(s=>s.etfs.forEach(e=>coreTickers.add(e.t)));
        const coreEtfs=allU.filter(e=>coreTickers.has(e.t)).sort((a,b)=>(etfMap[b.t]?.composite??0)-(etfMap[a.t]?.composite??0));
        const satelliteEtfs=allU.sort((a,b)=>(etfMap[b.t]?.composite??-999)-(etfMap[a.t]?.composite??-999));

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
              <PillRow e={e} score={score} size="lg"/>
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
              ?<div style={{padding:16,textAlign:"center",fontSize:11,color:"#6b7280"}}>Nessun ETF</div>
              :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                {coreEtfs.map((e,i)=><EtfCard key={e.t} e={e} i={i} border="rgba(245,158,11,0.4)"/>)}
              </div>
            }
          </div>
          <div>
            <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:8,padding:"8px 12px",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:800,color:"#818cf8",marginBottom:2}}>SATELLITE</div>
              <div style={{fontSize:8,color:"#6b7280"}}>Tutti gli scenari · ordinati per score</div>
            </div>
            {satelliteEtfs.length===0
              ?<div style={{padding:16,textAlign:"center",fontSize:11,color:"#6b7280"}}>Nessun ETF</div>
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
        const nazRaw=ETF_NAZIONALI.map(e=>{
          let s=0,tw=0;
          const W={w:0.45,m:0.35,q:0.12,s:0.05,y:0.03};
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
              <PillRow e={e} score={e.score} national size="lg"/>
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
          <div style={{fontSize:8,color:"#6b7280",letterSpacing:1,marginBottom:4}}>ETF NAZIONALI — 26 paesi · ordinati per momentum ↓</div>
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
        <div style={{fontSize:8,color:"#374151",marginBottom:10}}>45 indicatori macro da claude checklist — </div>
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
                    {trendArrowEl(id,value,null)}
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

      // Freccia: usa trendArrowEl module-level (valore attuale vs precedente, colore vs direzione buona)

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
        const c=valueColor(ind.id,ind.val);
        const scoreVal=Math.max(2,ind.score||0);
        const arrow=trendArrowEl(ind.id,ind.val,ind.goodDir);
        const meta=IND_META[ind.id];
        const desc=meta?meta.desc:(ind.id==="dtb3sofr"?"Spread DTB3−SOFR — tensione di liquidità a breve termine.\n🟢 ~0 = funding normale\n🔴 ampio = stress di liquidità USA":"");
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
          {desc?<div style={{fontSize:9,color:"#6b7280",lineHeight:1.6,whiteSpace:"pre-line",marginTop:4}}>{desc}</div>:null}
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
        <div style={{fontSize:8,color:"#6b7280",letterSpacing:2,marginBottom:12}}>POSIZIONAMENTO BANCHE CENTRALI —  · score normalizzato per categoria</div>
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
        <div style={{fontSize:8,color:"#374151",marginBottom:10}}>45 indicatori macro — </div>
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
          <div style={{fontSize:11,color:"#94a3b8",letterSpacing:2,fontWeight:700,marginBottom:8}}>ANDAMENTO BREVE PERIODO — fonte Lops </div>
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
          <div style={{fontSize:11,color:"#94a3b8",letterSpacing:2,fontWeight:700,marginBottom:8}}>ANDAMENTO MEDIO-LUNGO PERIODO — fonte Lops </div>
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
        <div style={{fontSize:10,color:"#6b7280",marginBottom:12}}>Fetch parallelo con 2 retry. Se un foglio fallisce vengono mantenuti i dati salvati.</div>
        <button onClick={fetchEtfData} disabled={refreshing} style={{background:refreshing?"#1f2937":"#F59E0B",color:"#000",border:"none",borderRadius:8,padding:"10px 20px",fontSize:12,fontWeight:800,cursor:"pointer",width:"100%"}}>
          {refreshing?"⏳ Caricamento...":"🔄 REFRESH ETF"}
        </button>
        {/* Status checkmarks per foglio */}
        {(fetchStatus.time||refreshing)&&<div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
          {[
            {key:"sc",   label:"Scenari Macro"},
            {key:"naz",  label:"ETF Nazionali"},
            {key:"macro",label:"Indicatori Macro"},
            {key:"rm",   label:"Risk Mom (HYG/CPER/USO)"},
          ].map(function(row){
            var st=fetchStatus[row.key];
            var icon=refreshing?"⏳":st===true?"✅":st===false?"❌":"⏳";
            var col=refreshing?"#6b7280":st===true?"#10B981":st===false?"#EF4444":"#6b7280";
            return <div key={row.key} style={{display:"flex",alignItems:"center",gap:8,background:"#080812",borderRadius:6,padding:"6px 10px"}}>
              <span style={{fontSize:14}}>{icon}</span>
              <span style={{fontSize:10,color:col,fontWeight:700}}>{row.label}</span>
              {!refreshing&&st===false&&<span style={{fontSize:9,color:"#4b5563",marginLeft:"auto"}}>dati localStorage mantenuti</span>}
              {!refreshing&&st===true&&fetchStatus.time&&<span style={{fontSize:9,color:"#374151",marginLeft:"auto"}}>{fetchStatus.time}</span>}
            </div>;
          })}
        </div>}
        <div style={{fontSize:9,color:"#4b5563",marginTop:8,padding:"6px 10px",background:"#080812",borderRadius:6}}>
        </div>
      </div>
    </div>}

  </div>;
}const TRENDS = {
  yieldCurve:  {dir:"↑", note:""},
  vix:         {dir:"↓", note:""},
  move:        {dir:"↑", note:""},
  ism:         {dir:"-", note:""},
  cpi:         {dir:"-", note:""},
  ppi:         {dir:"-", note:""},
  pce:         {dir:"-", note:""},
  tedSpread:   {dir:"-", note:""},
  crb:         {dir:"↑", note:""},
  bdi:         {dir:"↑", note:""},
  ifo:         {dir:"-", note:""},
  euCpi:       {dir:"-", note:""},
  jobless:     {dir:"-", note:""},
  lei:         {dir:"-", note:""},
  cfnai:       {dir:"-", note:""},
  igSpread:    {dir:"-", note:""},
  hySpread:    {dir:"↓", note:""},
  emSpread:    {dir:"-", note:""},
  pcc:         {dir:"↑", note:""},
  pcce:        {dir:"↑", note:""},
  realYield:   {dir:"↓", note:""},
  breakeven:   {dir:"↑", note:""},
  us2y:        {dir:"↑", note:""},
  us10y:       {dir:"↑", note:""},
  dxy:         {dir:"↑", note:""},
  oil:         {dir:"↑", note:""},
  euribor:     {dir:"↑", note:""},
  copperGold:  {dir:"-", note:""},
  ismNewOrders:{dir:"-", note:""},
  ismEmployment:{dir:"-",note:""},
  ismPricesPaid:{dir:"-",note:""},
  retailSales: {dir:"-", note:""},
  housingStarts:{dir:"↑", note:""},
  m2Dxy:       {dir:"↓", note:""},
  nfp:         {dir:"-", note:""},
  ppiMom:      {dir:"-", note:""},
  ppiCoreMom:  {dir:"-", note:""},
  cpiMom:      {dir:"-", note:""},
  cpiCoreMom:  {dir:"-", note:""},
  euCpiMom:    {dir:"-", note:""},
  euCpiCoreMom:{dir:"-", note:""},
  euPpiMom:    {dir:"-", note:""},
  euPpiYoy:    {dir:"-", note:""},
  de02y:       {dir:"↑", note:""},
  spread2y:    {dir:"↓", note:""},
  spread10y:   {dir:"↓", note:""},
  pceMom:      {dir:"-", note:""},
  athi:        {dir:"↓", note:""},
  atlo:        {dir:"↑", note:""},
  trin:        {dir:"↓", note:""},
  spx:         {dir:"↓", note:""},
  btpBund:     {dir:"↑", note:""},
  vvixVix:     {dir:"↑", note:""},
  dtb3:        {dir:"↓", note:""},
  sofr:        {dir:"-", note:""},
  euur:        {dir:"-", note:""},
  eujvr:       {dir:"-", note:""},
  de10y:       {dir:"↑", note:""},
  eurusd:      {dir:"-", note:""},
  sx5e:        {dir:"↓", note:""},
  eursyy:      {dir:"-", note:""},
  deppimm:     {dir:"↑", note:""},
  deppiyy:     {dir:"↑", note:""},
  deCurve:     {dir:"↑", note:""},
  euRealYield: {dir:"↑", note:""},
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
  de10y:"↓", deCurve:"↑", euRealYield:"↓", btpBund:"↓", eursyy:"↑",
  euur:"↓", eujvr:"↑", sx5e:"↑", deppimm:"↓", deppiyy:"↓",
  dtb3:"↓", sofr:"↓", dtb3sofr:"↓", spx:"↑", eurusd:"↑",
};
// Freccia condivisa (Banche Centrali + Indicatori): direzione = valore attuale vs precedente; colore = vs direzione buona.
function trendArrowEl(id, val, customGoodDir){
  var prev=PREV_INDICATORS[id];
  if(id==="dtb3sofr"&&(prev===null||prev===undefined||isNaN(prev))&&PREV_INDICATORS.dtb3!=null&&PREV_INDICATORS.sofr!=null){prev=PREV_INDICATORS.dtb3-PREV_INDICATORS.sofr;}
  if(val===null||val===undefined||isNaN(val)||prev===null||prev===undefined||isNaN(prev))return null; // niente dato → niente freccia
  if(val===prev)return null;                                  // nessun movimento → niente freccia
  var dir=val>prev?"↑":"↓";
  var good=customGoodDir||GOOD_DIR[id];
  if(!good)return null;                                       // niente bussola → niente freccia
  var color=dir===good?"#10B981":"#EF4444";
  return <span style={{fontSize:14,fontWeight:900,color:color}}>{dir}</span>;
}
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
    case "athi":         return v<180?"#EF4444":v<520?"#F59E0B":"#10B981";
    case "atlo":         return v<120?"#10B981":v<440?"#F59E0B":"#EF4444";
    case "spx":          return v<5000?"#EF4444":v<6500?"#EF4444":"#10B981";
    case "dtb3sofr":   {var a=Math.abs(v);return a<0.1?"#10B981":a<0.25?"#F59E0B":"#EF4444";}
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
    desc:"Tasso overnight garantito da Treasury — proxy Fed Funds più affidabile di LIBOR.\n🟢 <3% = Fed accomodante\n🟡 3-4.5% = neutro\n🔴 >4.5% = Fed restrittiva"},
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
  athi:        {label:"NYSE AT TODAY'S HIGH",           fmt:v=>`${Math.round(v)}`,
    desc:"Numero titoli NYSE che fanno nuovi massimi oggi — breadth rialzista.\n🔴 <180 = breadth debole\n🟡 180-520 = normale\n🟢 >520 = breadth forte"},
  atlo:        {label:"NYSE AT TODAY'S LOW",            fmt:v=>`${Math.round(v)}`,
    desc:"Numero titoli NYSE che fanno nuovi minimi oggi — breadth ribassista.\n🟢 <120 = pressione ribassista bassa\n🟡 120-440 = normale\n🔴 >440 = deterioramento breadth"},
  spx:         {label:"S&P 500",                        fmt:v=>`${v.toFixed(0)}`,
    desc:"Indice azionario USA — barometro risk-on globale.\n🔴 <5000 = risk-off\n🟡 5000-6500 = neutro/bull\n🟢 >6500 = bull market"},
  pceMom:      {label:"PCE Core MoM USA", fmt:v=>`${v>=0?"+":""}${v.toFixed(2)}%`,
    desc:"PCE Core MoM — misura mensile dell'inflazione di fondo USA, indicatore strutturale preferito dalla Fed.\n🎯 Target implicito: 0.17% mensile (=2% annualizzato)\n🟢 <0.15% = Fed può tagliare\n🟡 0.15-0.25% = al limite\n🔴 >0.25% = Fed bloccata — nessun taglio possibile"},
};
