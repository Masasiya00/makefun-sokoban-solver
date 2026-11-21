import f from"node:fs";
const I=process.env.MAKEFUN_INPUT_DIR||"/input",O=process.env.MAKEFUN_OUTPUT_DIR||"/output";let D,L="udlrUDLR",n;
for(let k=0;k<5;){let d="i00"+ ++k,s=S(f.readFileSync(I+"/"+d+"/level.txt","utf8"));f.mkdirSync(O+"/"+d,{recursive:!0});f.writeFileSync(O+"/"+d+"/solution.txt",s)}
function S(t){
let w=t.indexOf("\n"),T=t.replace(/\n/g,"");n=T.length;D=[-w,w,-1,1];
let G=[],B=[],p;
for(let i=0;i<n;i++){let g=T[i];if(g=="#")continue;if(".*+".includes(g))G.push(i);if("$*".includes(g))B.push(i);if("@+".includes(g))p=i}
B.sort((a,b)=>a-b);
let W0=[...T].map(c=>+(c=="#")),r0=p/w|0,H=W0.slice(),rm=[];
for(let x=0;x<w;x++)H[r0*w+x]=1;
while(B.length){let b=B[0],a=R2(H,[],b)[1],rb=B.filter(x=>a[x]>=0);B=B.filter(x=>a[x]<0);rm.push({b:rb,g:G.filter(x=>a[x]>=0)})}
let P=p,M="";
for(let r of rm){
let W2=W0.slice();
for(let o of rm)if(o!=r)for(let b of o.b)W2[b]=1;
let s=Q(W2,r.g,r.b,P);
if(!s)return"";M+=s[0];P=s[1];r.b=r.g}
return M}
function Q(W,G,B,P){
let q=[[B,P,""]],s=new Set([B.join()+","+R2(W,B,P)[0]]),i=0;
while(i<q.length){
let[b,p,m]=q[i++];
if(b.join()==G.join())return[m,p];
let a=R2(W,b,p)[1];
for(let j=0;j<b.length;j++)for(let k=4;k--;){let d=D[k],f=b[j]-d,t=b[j]+d;
if(a[f]<0||W[t]||b.includes(t))continue;
let v=b.slice();v[j]=t;v.sort((x,y)=>x-y);
let y=v.join()+","+R2(W,v,b[j])[0];
if(s.has(y))continue;s.add(y);
let w="";for(let z=f;z!=p;z=a[z])w=L[D.indexOf(z-a[z])]+w;
q.push([v,b[j],m+w+L[4+k]])}}
return""}
function R2(W,B,P){
let o=W.slice();B.forEach(x=>o[x]=1);
let a=Array(n).fill(-1),s=[P],l=P;a[P]=P;
for(let i=0;i<s.length;i++){let x=s[i];if(x<l)l=x;for(let k=4;k--;){let z=x+D[k];if(!o[z]&&a[z]<0)a[z]=x,s.push(z)}}
return[l,a]}
