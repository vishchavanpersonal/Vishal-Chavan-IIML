"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, ListTodo, CalendarDays, CheckCircle2, Clock3, AlertCircle,
  Plus, Search, MoreHorizontal, X, Trash2, Pencil, ChevronLeft, ChevronRight,
  Target, Zap, CircleCheck, CalendarClock, Menu
} from "lucide-react";

type Status = "Pending" | "In Progress" | "Completed";
type Priority = "High" | "Medium" | "Low";
type Task = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  expiryDate: string;
  priority: Priority;
  status: Status;
  createdAt: string;
};

const STORAGE_KEY = "taskflow-tasks-v1";
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const demoTasks: Task[] = [
  { id:"demo-1", title:"Review weekly operations report", description:"Review key performance indicators and open action items.", startDate:todayISO(), dueDate:todayISO(), expiryDate:"", priority:"High", status:"In Progress", createdAt:new Date().toISOString() },
  { id:"demo-2", title:"Prepare project status update", description:"Share progress, risks and next steps with stakeholders.", startDate:todayISO(), dueDate:addDays(todayISO(),2), expiryDate:"", priority:"Medium", status:"Pending", createdAt:new Date().toISOString() },
  { id:"demo-3", title:"Update team documentation", description:"Refresh the operating procedures and ownership details.", startDate:todayISO(), dueDate:addDays(todayISO(),5), expiryDate:"", priority:"Low", status:"Pending", createdAt:new Date().toISOString() },
];
function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate()+days);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function formatDate(value: string) {
  if (!value) return "No date";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
}
function isOverdue(task: Task) { return task.status !== "Completed" && !!task.dueDate && task.dueDate < todayISO(); }
function dayMonth(value: string) {
  const d = new Date(`${value}T12:00:00`);
  return { day: d.getDate(), month: d.toLocaleDateString("en-IN",{month:"short"}) };
}

export default function Home() {
  const [tasks,setTasks] = useState<Task[]>([]);
  const [loaded,setLoaded] = useState(false);
  const [view,setView] = useState<"overview"|"tasks"|"calendar">("overview");
  const [modal,setModal] = useState(false);
  const [editing,setEditing] = useState<Task|null>(null);
  const [query,setQuery] = useState("");
  const [statusFilter,setStatusFilter] = useState("All");
  const [priorityFilter,setPriorityFilter] = useState("All");
  const [month,setMonth] = useState(new Date());
  const [toast,setToast] = useState("");
  const [form,setForm] = useState({title:"",description:"",startDate:todayISO(),dueDate:todayISO(),expiryDate:"",priority:"Medium" as Priority,status:"Pending" as Status});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setTasks(saved ? JSON.parse(saved) as Task[] : demoTasks);
    } catch { setTasks(demoTasks); }
    setLoaded(true);
  },[]);
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY,JSON.stringify(tasks)); },[tasks,loaded]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(()=>setToast(""),2600);
    return () => window.clearTimeout(timer);
  },[toast]);

  const completed = tasks.filter(t=>t.status==="Completed").length;
  const overdue = tasks.filter(isOverdue).length;
  const dueToday = tasks.filter(t=>t.status!=="Completed" && t.dueDate===todayISO()).length;
  const progress = tasks.length ? Math.round(completed/tasks.length*100) : 0;
  const filtered = useMemo(()=>tasks.filter(t=>{
    const matchesQuery = `${t.title} ${t.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter==="All" || (statusFilter==="Overdue" ? isOverdue(t) : t.status===statusFilter);
    const matchesPriority = priorityFilter==="All" || t.priority===priorityFilter;
    return matchesQuery && matchesStatus && matchesPriority;
  }).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)),[tasks,query,statusFilter,priorityFilter]);
  const upcoming = tasks.filter(t=>t.status!=="Completed" && t.dueDate>=todayISO()).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).slice(0,4);

  function openNew() {
    setEditing(null);
    setForm({title:"",description:"",startDate:todayISO(),dueDate:todayISO(),expiryDate:"",priority:"Medium",status:"Pending"});
    setModal(true);
  }
  function openEdit(task: Task) {
    setEditing(task);
    setForm({title:task.title,description:task.description,startDate:task.startDate,dueDate:task.dueDate,expiryDate:task.expiryDate,priority:task.priority,status:task.status});
    setModal(true);
  }
  function saveTask(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (form.startDate && form.dueDate && form.dueDate < form.startDate) { setToast("Due date cannot be before the start date."); return; }
    if (editing) {
      setTasks(prev=>prev.map(t=>t.id===editing.id?{...t,...form,title:form.title.trim()}:t));
      setToast("Task updated successfully");
    } else {
      setTasks(prev=>[{...form,id:crypto.randomUUID(),title:form.title.trim(),createdAt:new Date().toISOString()},...prev]);
      setToast("Task added successfully");
    }
    setModal(false);
  }
  function toggleComplete(task: Task) {
    const next: Status = task.status==="Completed" ? "Pending" : "Completed";
    setTasks(prev=>prev.map(t=>t.id===task.id?{...t,status:next}:t));
    setToast(next==="Completed"?"Task marked as completed":"Task reopened");
  }
  function deleteTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setTasks(prev=>prev.filter(t=>t.id!==task.id));
    setToast("Task deleted");
  }
  function statusClass(task: Task) {
    if (isOverdue(task)) return "status-overdue";
    return task.status==="Completed"?"status-completed":task.status==="In Progress"?"status-progress":"status-pending";
  }
  function statusLabel(task: Task) { return isOverdue(task) ? "Overdue" : task.status; }

  const monthYear = month.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
  const firstDay = new Date(month.getFullYear(),month.getMonth(),1).getDay();
  const daysInMonth = new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const calendarCells = [...Array(firstDay).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
  const monthTasks = tasks.filter(t=>t.dueDate && new Date(`${t.dueDate}T12:00:00`).getMonth()===month.getMonth() && new Date(`${t.dueDate}T12:00:00`).getFullYear()===month.getFullYear());

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Zap size={19}/></span> taskflow</div>
        <nav>
          <div className="nav-label">Workspace</div>
          <button className={`nav-item ${view==="overview"?"active":""}`} onClick={()=>setView("overview")}><LayoutDashboard size={17}/> Overview</button>
          <button className={`nav-item ${view==="tasks"?"active":""}`} onClick={()=>setView("tasks")}><ListTodo size={17}/> All tasks <span className="nav-count">{tasks.length}</span></button>
          <button className={`nav-item ${view==="calendar"?"active":""}`} onClick={()=>setView("calendar")}><CalendarDays size={17}/> Calendar</button>
          <div className="nav-label" style={{marginTop:28}}>Quick filters</div>
          <button className="nav-item" onClick={()=>{setView("tasks");setStatusFilter("Pending");}}><Clock3 size={17}/> Pending</button>
          <button className="nav-item" onClick={()=>{setView("tasks");setStatusFilter("In Progress");}}><Target size={17}/> In progress</button>
          <button className="nav-item" onClick={()=>{setView("tasks");setStatusFilter("Overdue");}}><AlertCircle size={17}/> Overdue</button>
          <button className="nav-item" onClick={()=>{setView("tasks");setStatusFilter("Completed");}}><CircleCheck size={17}/> Completed</button>
        </nav>
        <div className="sidebar-bottom">Stay focused. Make progress.<br/>Your personal task space.</div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <div className="eyebrow">{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
            <h1 className="page-title">{view==="overview"?"Good to see you!":view==="tasks"?"All tasks":"Your calendar"}</h1>
            <div className="sub-title">{view==="overview"?"Here’s what’s happening with your tasks today.":view==="tasks"?"Manage, prioritize and track all your work.":"Plan ahead and keep your deadlines in view."}</div>
          </div>
          <button className="primary-btn" onClick={openNew}><Plus size={16}/> Add new task</button>
        </div>

        {view==="overview" && <>
          <div className="stats-grid">
            <Stat icon={<ListTodo size={16}/>} label="Total tasks" value={tasks.length} note="All tasks in your workspace" tint="#f0efff" color="#6258e8"/>
            <Stat icon={<CheckCircle2 size={16}/>} label="Completed" value={completed} note={`${progress}% completion rate`} tint="#eaf8f3" color="#20a77e"/>
            <Stat icon={<Clock3 size={16}/>} label="Due today" value={dueToday} note="Tasks to focus on today" tint="#fff6e8" color="#d49a36"/>
            <Stat icon={<AlertCircle size={16}/>} label="Overdue" value={overdue} note="Past their due date" tint="#fff0f0" color="#df6268"/>
          </div>
          <div className="content-grid">
            <section className="panel">
              <div className="panel-head"><div><div className="panel-title">Recent tasks</div><div className="panel-sub">Your latest task activity</div></div><button className="text-btn" onClick={()=>setView("tasks")}>View all tasks →</button></div>
              {tasks.length===0?<div className="empty-state">No tasks yet. Add your first task to get started.</div>:<div className="task-list">{[...tasks].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,6).map(task=><TaskRow key={task.id} task={task} onToggle={()=>toggleComplete(task)} onEdit={()=>openEdit(task)} onDelete={()=>deleteTask(task)} statusClass={statusClass(task)} statusLabel={statusLabel(task)}/>)}</div>}
            </section>
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              <section className="panel">
                <div className="panel-head"><div><div className="panel-title">Overall progress</div><div className="panel-sub">Your completion snapshot</div></div><span style={{color:"#6258e8",fontWeight:800,fontSize:17}}>{progress}%</span></div>
                <div className="progress-track"><div className="progress-fill" style={{width:`${progress}%`}}/></div>
                <div className="progress-label"><span>{completed} completed</span><span>{tasks.length-completed} remaining</span></div>
              </section>
              <section className="panel">
                <div className="panel-head"><div><div className="panel-title">Coming up</div><div className="panel-sub">Your next deadlines</div></div><CalendarClock size={17} color="#969fb0"/></div>
                {upcoming.length===0?<div className="empty-state">No upcoming deadlines.</div>:upcoming.map(t=>{const d=dayMonth(t.dueDate);return <div className="upcoming-item" key={t.id}><div className="date-box"><strong>{d.day}</strong><span>{d.month}</span></div><div><div className="upcoming-name">{t.title}</div><div className="upcoming-date">Due {formatDate(t.dueDate)}</div></div></div>})}
              </section>
            </div>
          </div>
        </>}

        {view==="tasks" && <section className="panel">
          <div className="panel-head"><div><div className="panel-title">Task list</div><div className="panel-sub">{filtered.length} task{filtered.length===1?"":"s"} found</div></div></div>
          <div className="toolbar">
            <div className="search-wrap"><Search size={15}/><input className="search-input" placeholder="Search tasks..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
            <select className="filter-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option><option>Pending</option><option>In Progress</option><option>Completed</option><option>Overdue</option></select>
            <select className="filter-select" value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select>
          </div>
          {filtered.length===0?<div className="empty-state">No matching tasks. Try changing your filters or add a task.</div>:<div className="task-list">{filtered.map(task=><TaskRow key={task.id} task={task} onToggle={()=>toggleComplete(task)} onEdit={()=>openEdit(task)} onDelete={()=>deleteTask(task)} statusClass={statusClass(task)} statusLabel={statusLabel(task)}/>)}</div>}
        </section>}

        {view==="calendar" && <section className="panel">
          <div className="panel-head"><div><div className="panel-title">{monthYear}</div><div className="panel-sub">Tasks are shown on their due dates</div></div><div style={{display:"flex",gap:5}}><button className="icon-btn" aria-label="Previous month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft size={18}/></button><button className="icon-btn" aria-label="Next month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight size={18}/></button></div></div>
          <div className="calendar-grid">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div className="calendar-head" key={d}>{d}</div>)}
            {calendarCells.map((day,i)=>{if(!day)return <div key={`blank-${i}`}/>;const date=`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;const dayTasks=monthTasks.filter(t=>t.dueDate===date);return <div key={date} className={`calendar-day ${date===todayISO()?"today":""}`}><div className="day-number">{day}</div>{dayTasks.slice(0,3).map(t=><div key={t.id} className="day-task" title={t.title}>{t.title}</div>)}{dayTasks.length>3&&<div style={{fontSize:8,color:"#6258e8",marginTop:3}}>+{dayTasks.length-3} more</div>}</div>})}
          </div>
          <div style={{marginTop:20,borderTop:"1px solid #f0f1f5",paddingTop:16}}><div className="panel-title" style={{marginBottom:10}}>Tasks this month</div>{monthTasks.length===0?<div className="empty-state">No tasks scheduled for this month.</div>:monthTasks.sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).map(t=><TaskRow key={t.id} task={t} onToggle={()=>toggleComplete(t)} onEdit={()=>openEdit(t)} onDelete={()=>deleteTask(t)} statusClass={statusClass(t)} statusLabel={statusLabel(t)}/>)}</div>
        </section>}
      </main>

      {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false);}}>
        <form className="modal" onSubmit={saveTask}>
          <div className="modal-head"><div className="modal-title">{editing?"Edit task":"Create a task"}</div><button type="button" className="icon-btn" onClick={()=>setModal(false)} aria-label="Close"><X size={18}/></button></div>
          <div className="form-grid">
            <div className="field full"><label htmlFor="title">Task title *</label><input id="title" autoFocus required maxLength={120} placeholder="What needs to get done?" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
            <div className="field full"><label htmlFor="description">Description</label><textarea id="description" placeholder="Add some details (optional)" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
            <div className="field"><label htmlFor="start">Start date</label><input id="start" type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></div>
            <div className="field"><label htmlFor="due">Due date *</label><input id="due" type="date" required value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div>
            <div className="field"><label htmlFor="expiry">Expiry date (optional)</label><input id="expiry" type="date" min={form.dueDate||undefined} value={form.expiryDate} onChange={e=>setForm({...form,expiryDate:e.target.value})}/></div>
            <div className="field"><label htmlFor="priority">Priority</label><select id="priority" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as Priority})}><option>High</option><option>Medium</option><option>Low</option></select></div>
            <div className="field full"><label htmlFor="status">Status</label><select id="status" value={form.status} onChange={e=>setForm({...form,status:e.target.value as Status})}><option>Pending</option><option>In Progress</option><option>Completed</option></select></div>
          </div>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="primary-btn">{editing?"Save changes":"Create task"}</button></div>
        </form>
      </div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Stat({icon,label,value,note,tint,color}:{icon:React.ReactNode;label:string;value:number;note:string;tint:string;color:string}) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon" style={{background:tint,color}}>{icon}</span></div><div className="stat-number">{value}</div><div className="stat-note">{note}</div></div>;
}
function TaskRow({task,onToggle,onEdit,onDelete,statusClass,statusLabel}:{task:Task;onToggle:()=>void;onEdit:()=>void;onDelete:()=>void;statusClass:string;statusLabel:string}) {
  return <div className="task-row">
    <button className={`check-btn ${task.status==="Completed"?"done":""}`} onClick={onToggle} aria-label={task.status==="Completed"?"Reopen task":"Complete task"}>{task.status==="Completed"&&<CheckCircle2 size={14}/>}</button>
    <div className="task-info"><div className={`task-name ${task.status==="Completed"?"completed":""}`}>{task.title}</div><div className="task-meta"><span>Due {formatDate(task.dueDate)}</span>{task.expiryDate&&<span>Expires {formatDate(task.expiryDate)}</span>}</div></div>
    <span className={`pill priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
    <span className={`pill ${statusClass}`}>{statusLabel}</span>
    <div className="task-actions"><button className="icon-btn" onClick={onEdit} aria-label="Edit task"><Pencil size={14}/></button><button className="icon-btn" onClick={onDelete} aria-label="Delete task"><Trash2 size={14}/></button></div>
  </div>;
}