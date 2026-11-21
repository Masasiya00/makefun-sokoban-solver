import{readFileSync as a,writeFileSync as b,mkdirSync as c}from"node:fs";
const I=process.env.MAKEFUN_INPUT_DIR||"/input",O=process.env.MAKEFUN_OUTPUT_DIR||"/output";
for(let k=1;k<6;k++){let d="i00"+k,s=S(a(I+"/"+d+"/level.txt","utf8"));c(O+"/"+d,{recursive:!0});b(O+"/"+d+"/solution.txt",s+"\n")}
function S(t){
let R=t.split("\n").filter(x=>x),w=Math.max(...R.map(x=>x.length)),n=w*R.length,W=new Uint8Array(n).fill(1),G=[],B=[],p,D=[-w,w,-1,1],L="udlrUDLR",U="UDLR";
R.forEach((r,y)=>{for(let x=0;x<r.length;x++){let i=y*w+x,g=r[x];if(g!="#"){W[i]=0;if(".*+".includes(g))G.push(i);if("$*".includes(g))B.push(i);if("@+".includes(g))p=i}}});
B.sort((a,b)=>a-b);
let r0=p/w|0,pt=new Int32Array(n).fill(-1),rm=[];
for(let b of B)if(pt[b]<0){let q=[b];pt[b]=rm.length;for(let i=0;i<q.length;i++)for(let k=0;k<4;k++){let z=q[i]+D[k];if(!W[z]&&(z/w|0)!=r0&&pt[z]<0){pt[z]=rm.length;q.push(z)}}rm.push({b:[],g:[]})}
B.forEach(b=>rm[pt[b]].b.push(b));G.forEach(g=>{if(pt[g]>=0)rm[pt[g]].g.push(g)});
let P=p,M="";
for(let r of rm.filter(r=>r.b.length)){
let W2=W.slice();
rm.forEach(o=>{if(o!=r)(o.d?o.g:o.b).forEach(b=>W2[b]=1)});
let s=Q(W2,r.g.sort((a,b)=>a-b),r.b.sort((a,b)=>a-b),P,D,L,U,n);
if(!s)return"";M+=s;P=E(P,s,D,L);r.d=1}
return M}
function Q(W,G,B,P,D,L,U,n){
let q=[{b:B,p:P,m:""}],seen=new Set([B.join()+","+R(W,B,P,D,n)]),i=0;
while(i<q.length){
let{b,p,m}=q[i++];
if(b.join()==G.join())return m;
let oc=new Uint8Array(n);b.forEach(x=>oc[x]=1);
let par=R2(W,oc,p,D,n)[1];
for(let j=0;j<b.length;j++)for(let k=0;k<4;k++){
let d=D[k],f=b[j]-d,t=b[j]+d;
if(par[f]<0||W[t]||oc[t])continue;
let nb=b.slice();nb[j]=t;nb.sort((a,b)=>a-b);
let key=nb.join()+","+R(W,nb,b[j],D,n);
if(seen.has(key))continue;seen.add(key);
q.push({b:nb,p:b[j],m:m+W3(par,p,f,D,L)+U[k]})}}
return""}
function R(W,B,P,D,n){
let oc=new Uint8Array(n);B.forEach(x=>oc[x]=1);
return R2(W,oc,P,D,n)[0]}
function R2(W,oc,P,D,n){
let par=new Int32Array(n).fill(-1),st=[P],lo=P;par[P]=P;
for(let i=0;i<st.length;i++){let x=st[i];if(x<lo)lo=x;for(let k=0;k<4;k++){let z=x+D[k];if(!W[z]&&!oc[z]&&par[z]<0){par[z]=x;st.push(z)}}}
return[lo,par]}
function W3(par,p,t,D,L){
let s="";while(t!=p){let f=par[t];s=L[D.indexOf(t-f)]+s;t=f}return s}
function E(P,s,D,L){
for(let ch of s)P+=D[L.indexOf(ch)%4];return P}
