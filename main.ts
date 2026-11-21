import f from"node:fs";
let e=process.env,I=e.MAKEFUN_INPUT_DIR||"/input",O=e.MAKEFUN_OUTPUT_DIR||"/output",D,L="udlrUDLR",n;
for(let k=1;k<6;){let d="i00"+k++,t=f.readFileSync(I+"/"+d+"/level.txt","utf8"),w=t.indexOf("\n"),T=t.replace(/\n/g,""),G=[],B=[],p,M="",P;
n=T.length;D=[-w,w,-1,1];
[...T].forEach((g,i)=>{let c=".*+$@".indexOf(g);if(c>-1){if(c<3)G.push(i);if(c==1||c==3)B.push(i);if(c==2||c==4)p=i}});
B.sort((a,b)=>a-b);
let W0=[...T].map(c=>c=="#"|0),r0=p/w|0,H=[...W0],rm=[];
H.fill(1,r0*w,r0*w+w);
while(B.length){let a=R2(H,[],B[0])[1],rb=B.filter(x=>a[x]>=0);B=B.filter(x=>a[x]<0);rm.push([rb,G.filter(x=>a[x]>=0)])}
P=p;
for(let r of rm){
let W2=[...W0];rm.forEach(o=>o!=r&&o[0].forEach(b=>W2[b]=1));
let s=Q(W2,r[1],r[0],P);
if(!s){M="";break}M+=s[0];P=s[1];r[0]=r[1]}
f.mkdirSync(O+"/"+d,{recursive:!0});f.writeFileSync(O+"/"+d+"/solution.txt",M)}
function Q(W,G,B,P){
let q=[[B,P,""]],s=new Set([B+","+R2(W,B,P)[0]]),i=0;
while(i<q.length){
let[b,p,m]=q[i++];
if(b+""==G+"")return[m,p];
let a=R2(W,b,p)[1];
for(let j in b)for(let k=4;k--;){let f=b[j]-D[k],t=b[j]+D[k];
if(a[f]<0||W[t]||b.includes(t))continue;
let v=[...b];v[j]=t;v.sort((x,y)=>x-y);
let y=v+","+R2(W,v,b[j])[0];
if(s.has(y))continue;s.add(y);
let w="";for(let z=f;z!=p;z=a[z])w=L[D.indexOf(z-a[z])]+w;
q.push([v,b[j],m+w+L[4+k]])}}
return""}
function R2(W,B,P){
let o=[...W];for(let x of B)o[x]=1;
let a=Array(n).fill(-1),s=[P],l=P;a[P]=P;
for(let x of s){if(x<l)l=x;for(let k=4;k--;){let z=x+D[k];if(!o[z]&&a[z]<0)a[z]=x,s.push(z)}}
return[l,a]}
