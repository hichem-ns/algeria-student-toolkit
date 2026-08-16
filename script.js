const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const store={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const toast=msg=>{const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)};

if(store.get("ast-theme","light")==="dark")document.body.classList.add("dark");
$("#themeToggle").onclick=()=>{document.body.classList.toggle("dark");store.set("ast-theme",document.body.classList.contains("dark")?"dark":"light");$("#themeToggle").textContent=document.body.classList.contains("dark")?"☀":"☾"};

const modules=$("#modules");
function addModule(name="",cc="",exam="",coef=1){
 const row=document.createElement("div");row.className="module-row";
 row.innerHTML='<input placeholder="Ex. Algorithmique" value="'+name+'"><input type="number" min="0" max="20" step=".01" placeholder="/20" value="'+cc+'"><input type="number" min="0" max="20" step=".01" placeholder="/20" value="'+exam+'"><input type="number" min=".1" step=".1" value="'+coef+'"><button class="remove" title="Supprimer">×</button>';
 row.querySelector(".remove").onclick=()=>{row.remove();calculate(false)};modules.appendChild(row);
}
const savedModules=store.get("ast-modules",[]);
if(savedModules.length)savedModules.forEach(m=>addModule(m.name,m.cc,m.exam,m.coef));else{addModule();addModule();addModule()}
$("#addModule").onclick=()=>addModule();

function calculate(show=true){
 const w=Number($("#ccWeight").value),round=Number($("#rounding").value),rows=$$(".module-row");
 let total=0,coefTotal=0,valid=0,filled=0,credits=0,data=[];
 rows.forEach(r=>{
   const name=r.children[0].value.trim(),cc=Number(r.children[1].value),exam=Number(r.children[2].value),coef=Number(r.children[3].value);
   if(name||r.children[1].value||r.children[2].value)data.push({name,cc:r.children[1].value,exam:r.children[2].value,coef:r.children[3].value});
   if(r.children[1].value!==""&&r.children[2].value!==""&&Number.isFinite(cc)&&Number.isFinite(exam)&&cc>=0&&cc<=20&&exam>=0&&exam<=20&&coef>0){
     const note=cc*w+exam*(1-w);total+=note*coef;coefTotal+=coef;filled++;
     if(note>=10)valid++;if(note>=10)credits+=6;
   }
 });
 store.set("ast-modules",data);$("#moduleCount").textContent=rows.length+" module"+(rows.length>1?"s":"");
 $("#totalCoef").textContent=coefTotal.toFixed(1).replace(".0","");$("#validatedModules").textContent=valid;$("#credits").textContent=credits;
 if(!coefTotal){$("#semesterAverage").textContent="—";$("#heroScore").textContent="—";$("#semesterStatus").textContent="Ajoute tes notes pour commencer." ;$("#progressBar").style.width="0%";return}
 const avg=Number((total/coefTotal).toFixed(round));$("#semesterAverage").textContent=avg.toFixed(round);$("#heroScore").textContent=avg.toFixed(2);$("#progressBar").style.width=Math.min(100,avg/20*100)+"%";
 $("#semesterStatus").textContent=avg>=10?"✓ Semestre potentiellement validé":"⚠ Moyenne sous 10 — à travailler";
 $("#heroSubjects").textContent=filled;if(show)toast("Moyenne calculée");
}
$("#calculate").onclick=()=>calculate(true);$("#ccWeight").onchange=()=>calculate(false);$("#rounding").onchange=()=>calculate(false);
$("#clearModules").onclick=()=>{modules.innerHTML="";addModule();addModule();store.set("ast-modules",[]);calculate(false);toast("Calculateur réinitialisé")};
$$(".mode").forEach(b=>b.onclick=()=>{$$(".mode").forEach(x=>x.classList.remove("active"));b.classList.add("active");toast(b.dataset.mode==="simple"?"Mode notes simples bientôt disponible":"Mode modules actif")});
calculate(false);

const presets={focus:1500,short:300,long:900};let current=1500,interval=null,mode="focus";
let sessions=store.get("ast-sessions",0),focusMinutes=store.get("ast-focus-minutes",0);
$("#sessionCount").textContent=sessions;$("#focusMinutes").textContent=focusMinutes;$("#heroSessions").textContent=sessions;
function renderTimer(){const m=Math.floor(current/60),s=current%60;$("#timer").textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");$("#timerLabel").textContent=mode==="focus"?"Focus":mode==="short"?"Pause courte":"Pause longue"}
function setTimer(sec,newMode="focus"){clearInterval(interval);interval=null;current=sec;mode=newMode;renderTimer();$("#startTimer").textContent="▶"}
function nextCycle(){if(mode==="focus"){sessions++;focusMinutes+=25;store.set("ast-sessions",sessions);store.set("ast-focus-minutes",focusMinutes);$("#sessionCount").textContent=sessions;$("#focusMinutes").textContent=focusMinutes;$("#heroSessions").textContent=sessions;setTimer(300,"short")}else setTimer(mode==="short"?1500:1500,"focus")}
function finish(){toast(mode==="focus"?"Focus terminé. Bien joué.":"Pause terminée. On repart.");nextCycle();if($("#autoCycle").checked)startTimer()}
function startTimer(){if(interval)return;$("#startTimer").textContent="Ⅱ";interval=setInterval(()=>{if(current<=0){clearInterval(interval);interval=null;finish()}else{current--;renderTimer()}},1000)}
$$(".timer-preset").forEach(b=>b.onclick=()=>{const t=Number(b.dataset.time),m=t===1500?"focus":t===300?"short":"long";$$(".timer-preset").forEach(x=>x.classList.remove("active"));b.classList.add("active");setTimer(t,m)});
$("#startTimer").onclick=()=>{if(interval){clearInterval(interval);interval=null;$("#startTimer").textContent="▶"}else startTimer()};
$("#resetTimer").onclick=()=>setTimer(presets[mode],mode);$("#skipTimer").onclick=()=>{clearInterval(interval);interval=null;nextCycle();if($("#autoCycle").checked)startTimer()};renderTimer();

let todos=store.get("ast-todos",[]),taskFilter="all";
const priorityLabels={high:"Haute",medium:"Moyenne",low:"Basse"};
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function renderTodos(){
 const list=$("#todoList");list.innerHTML="";
 const shown=todos.filter(t=>taskFilter==="all"||(taskFilter==="done"?t.done:!t.done));
 shown.forEach(t=>{
   const real=todos.indexOf(t),li=document.createElement("li");li.className="task "+(t.done?"done":"");
   li.innerHTML='<button class="task-check" aria-label="Terminer"></button><span class="task-text">'+escapeHtml(t.text)+'</span><span class="priority-tag '+t.priority+'">'+priorityLabels[t.priority]+'</span><button class="delete-task" aria-label="Supprimer">×</button>';
   li.querySelector(".task-check").onclick=()=>{todos[real].done=!todos[real].done;saveTodos()};
   li.querySelector(".delete-task").onclick=()=>{todos.splice(real,1);saveTodos()};list.appendChild(li);
 });
 $("#heroTasks").textContent=todos.filter(t=>!t.done).length;store.set("ast-todos",todos);
}
function saveTodos(){store.set("ast-todos",todos);renderTodos()}
$("#addTodo").onclick=()=>{const text=$("#todoInput").value.trim();if(!text)return;todos.push({text,priority:$("#priority").value,done:false});$("#todoInput").value="";saveTodos();toast("Tâche ajoutée")};
$("#todoInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("#addTodo").click()});
$$(".filter").forEach(b=>b.onclick=()=>{$$(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");taskFilter=b.dataset.filter;renderTodos()});
$("#clearTasks").onclick=()=>{todos=[];saveTodos();toast("Liste effacée")};renderTodos();

const priorities=store.get("ast-priorities",["","",""]);
$$("[data-priority]").forEach(i=>{i.value=priorities[Number(i.dataset.priority)]||"";i.addEventListener("input",()=>{priorities[Number(i.dataset.priority)]=i.value;store.set("ast-priorities",priorities)})});
