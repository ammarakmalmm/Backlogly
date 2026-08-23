export type ItemType = 'game'|'book'|'assignment'|'knowledge'|'video'|'other';
export type Status = 'backlog'|'in-progress'|'completed';
export type Priority = 'low'|'medium'|'high';
export interface BacklogItem { id:string; type:ItemType; title:string; description:string; notes:string; link:string; image?:string; tags:string[]; priority:Priority; status:Status; favorite:boolean; createdAt:string; completedAt?:string; dueDate?:string; progress:number; fields:Record<string,string>; }
export const typeMeta:Record<ItemType,{label:string;icon:string;color:string}>={game:{label:'Games',icon:'🎮',color:'#635bff'},book:{label:'Books',icon:'📚',color:'#e25c8c'},assignment:{label:'Assignments',icon:'📝',color:'#ed8c3e'},knowledge:{label:'Knowledge',icon:'🧠',color:'#1aab8b'},video:{label:'Videos',icon:'🎥',color:'#d95959'},other:{label:'Others',icon:'📌',color:'#77829a'}};
