function createCompletionView({record,client,solver,dialog,onSummary,openCompletion}) {
  const old=solver.querySelector('.completion-community');if(old)old.remove();
  dialog.querySelector('.completion-entry')?.remove();
  if(!record.publishedId)return {updateEligibility(){},destroy(){}};
  let destroyed=false,recorded=false,busy=false,cursor=null,reading=false,readVersion=0,hadSummary=false;
  const controller=new AbortController();
  const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
  const section=el('section',undefined,'completion-community');section.setAttribute('aria-labelledby','completion-community-title');
  const heading=el('h3','Solvers');heading.id='completion-community-title';
  const count=el('p','Loading completions…','completion-count');count.setAttribute('role','status');
  const note=el('p','Names are optional. The count includes unnamed completions.','completion-note');
  const list=el('ul',undefined,'completion-solvers');
  const listStatus=el('p','', 'completion-note');listStatus.setAttribute('role','status');
  const more=el('button','Load more solvers');more.type='button';more.hidden=true;
  const retryRead=el('button','Retry loading');retryRead.type='button';retryRead.hidden=true;
  const addName=el('button','Add your name to the solvers');addName.type='button';addName.hidden=true;
  section.append(heading,count,note,list,listStatus,more,retryRead,addName);solver.append(section);
  const entry=el('section',undefined,'completion-entry');entry.hidden=true;
  const message=el('p');message.setAttribute('role','status');
  const form=el('form');form.hidden=true;
  const label=el('label','Display name (optional)');label.htmlFor='completion-name';
  const input=el('input');input.id='completion-name';input.name='displayName';input.autocomplete='nickname';input.setAttribute('aria-describedby','completion-public-note');
  const disclosure=el('p','Your name will be public beneath this puzzle.','completion-note');disclosure.id='completion-public-note';
  const submit=el('button','Add my name','solid-button');submit.type='submit';
  const formStatus=el('p');formStatus.setAttribute('role','status');
  const retry=el('button','Retry recording completion');retry.type='button';retry.hidden=true;
  form.append(label,input,disclosure,submit,formStatus);entry.append(message,retry,form);
  dialog.querySelector('.dialog-actions').before(entry);
  function presentSummary(summary,append=false) {
    hadSummary=true;
    count.textContent=`${summary.count} ${summary.count===1?'completion':'completions'}`;
    if(!append)list.replaceChildren();
    for(const solver of summary.solvers){const item=el('li');const name=el('span',solver.name);const date=el('time',new Date(solver.completedAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}));date.dateTime=solver.completedAt;item.append(name,date);list.append(item);}
    cursor=summary.nextCursor;more.hidden=!cursor;listStatus.textContent=list.children.length?'':'No names yet. You can be the first.';
    retryRead.hidden=true;onSummary?.(summary);
  }
  async function load(append=false) {
    if(reading)return;reading=true;more.disabled=true;retryRead.disabled=true;
    const version=++readVersion;
    try {const summary=await client.getSummary(record.publishedId,append?cursor:null);if(!destroyed&&version===readVersion)presentSummary(summary,append);}
    catch {if(!destroyed&&version===readVersion){if(!hadSummary)count.textContent='Completion tracking is not available right now.';listStatus.textContent='Could not load solvers. Please try again.';retryRead.hidden=!client.configured;}}
    finally {reading=false;if(!destroyed){more.disabled=false;retryRead.disabled=false;}}
  }
  async function recordCompletion() {
    if(destroyed||busy||!isCompletionEligible(record))return;
    busy=true;retry.hidden=true;form.hidden=true;entry.hidden=false;
    message.textContent='Recording your completion…';
    try {
      const result=await client.record(record.publishedId,record.revision);
      if(destroyed)return;
      recorded=true;message.textContent='Completion recorded. Add your name below, or keep it anonymous.';
      form.hidden=false;addName.hidden=false;input.value=result.name||'';submit.textContent=result.name?'Update my name':'Add my name';
      ++readVersion;presentSummary(result);
    } catch(error) {
      if(!destroyed){message.textContent=client.configured?`Your completion has not been confirmed. ${error.message}`:'Completion tracking is not available yet. Your solve is saved in this browser.';retry.hidden=!client.configured;}
    } finally {busy=false;}
  }
  function updateEligibility() {
    if(isCompletionEligible(record)){entry.hidden=false;if(!recorded)recordCompletion();}
    else {entry.hidden=true;addName.hidden=true;}
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!recorded)return;
    if([...input.value.trim()].length<1||[...input.value.trim()].length>40){formStatus.textContent='Use a name between 1 and 40 characters.';input.focus();return;}
    busy=true;submit.disabled=true;formStatus.textContent='Saving your name…';
    try {const result=await client.setName(record.publishedId,record.revision,input.value);if(destroyed)return;++readVersion;presentSummary(result);formStatus.textContent='Your name is on the solver list.';input.value=result.name;submit.textContent='Update my name';}
    catch(error){if(!destroyed)formStatus.textContent=`Your name was not saved. ${error.message}`;}
    finally {busy=false;if(!destroyed)submit.disabled=false;}
  },{signal:controller.signal});
  retry.addEventListener('click',recordCompletion,{signal:controller.signal});
  retryRead.addEventListener('click',()=>load(false),{signal:controller.signal});
  more.addEventListener('click',()=>load(true),{signal:controller.signal});
  addName.addEventListener('click',()=>{openCompletion();input.focus();},{signal:controller.signal});
  load();updateEligibility();
  return {updateEligibility,destroy(){destroyed=true;++readVersion;controller.abort();section.remove();entry.remove();}};
}
