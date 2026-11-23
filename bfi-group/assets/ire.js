(function(){
  var top=document.getElementById('top'),bg=document.getElementById('burger'),nav=document.getElementById('nav');
  bg.addEventListener('click',function(){var o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o)});
  nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');bg.setAttribute('aria-expanded','false')}});

  var OBJ={1:{name:'Divistabu dzīvoklis',max:4},2:{name:'Vienistabas dzīvoklis',max:2},3:{name:'Trīsistabu dzīvoklis',max:6}};
  var MON=['janvāris','februāris','marts','aprīlis','maijs','jūnijs','jūlijs','augusts','septembris','oktobris','novembris','decembris'];
  var DW=['P','O','T','C','Pk','S','Sv'];
  var today=new Date();today.setHours(0,0,0,0);
  var base=new Date(today.getFullYear(),today.getMonth(),1);
  var off=today.getDate()>20?1:0,MAXOFF=10,a=null,b=null;
  var q=new URLSearchParams(location.search).get('objekts');
  var obj=OBJ[q]?q:'1';
  var radios=document.querySelectorAll('input[name=obj]');
  radios.forEach(function(r){r.checked=(r.value===obj);r.closest('.obj').classList.toggle('sel',r.checked);
    r.addEventListener('change',function(){obj=r.value;radios.forEach(function(x){x.closest('.obj').classList.toggle('sel',x.checked)});a=b=null;fillGuests();render();sum()})});

  function key(d){return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
  function rng(seed){return function(){seed=(seed*1103515245+12345)%2147483648;return seed/2147483648}}
  var busyCache={};
  function busyMonth(y,m){
    var k=obj+'-'+y+'-'+m;if(busyCache[k])return busyCache[k];
    var r=rng(y*131+m*17+(+obj)*7919),set={},dim=new Date(y,m+1,0).getDate(),n=2+Math.floor(r()*2);
    for(var i=0;i<n;i++){var s=1+Math.floor(r()*(dim-4)),len=2+Math.floor(r()*4);for(var j=0;j<len&&s+j<=dim;j++)set[s+j]=1}
    return busyCache[k]=set;
  }
  function isBusy(d){return !!busyMonth(d.getFullYear(),d.getMonth())[d.getDate()]}
  function rangeFree(x,y){for(var d=new Date(x);d<y;d.setDate(d.getDate()+1)){if(isBusy(d))return false}return true}
  function fmt(d){return ('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+d.getFullYear()}
  function nights(){return Math.round((b-a)/864e5)}
  function nWord(n){return (n%10===1&&n%100!==11)?'nakts':'naktis'}

  var monthsEl=document.getElementById('months'),hint=document.getElementById('hint');
  function render(){
    monthsEl.innerHTML='';
    for(var k=0;k<2;k++){
      var first=new Date(base.getFullYear(),base.getMonth()+off+k,1),y=first.getFullYear(),m=first.getMonth();
      var box=document.createElement('div');box.className='mon m'+(k+1);
      box.innerHTML='<h3>'+MON[m]+' '+y+'</h3>';
      var g=document.createElement('div');g.className='grid7';
      DW.forEach(function(w){var e=document.createElement('span');e.className='dw';e.textContent=w;g.appendChild(e)});
      var lead=(first.getDay()+6)%7;
      for(var i=0;i<lead;i++){var e=document.createElement('span');e.className='day empty';g.appendChild(e)}
      var dim=new Date(y,m+1,0).getDate();
      for(var dd=1;dd<=dim;dd++){
        var d=new Date(y,m,dd),btn=document.createElement('button');btn.type='button';btn.className='day';btn.textContent=dd;
        btn.dataset.k=key(d);
        var lbl=dd+'. '+MON[m]+' '+y;
        if(d<today){btn.classList.add('past');btn.disabled=true}
        else if(isBusy(d)){btn.classList.add('busy');btn.setAttribute('aria-disabled','true');lbl+=', aizņemts'}
        if(a&&key(d)===key(a))btn.classList.add('a');
        if(b&&key(d)===key(b))btn.classList.add('b');
        if(a&&b&&d>a&&d<b)btn.classList.add('in');
        btn.setAttribute('aria-label',lbl);
        (function(d){btn.addEventListener('click',function(){pick(d)})})(d);
        g.appendChild(btn);
      }
      box.appendChild(g);monthsEl.appendChild(box);
    }
    document.getElementById('prev').disabled=off<=0;
    document.getElementById('next').disabled=off>=MAXOFF;
    hint.textContent=!a?'Izvēlieties ierašanās datumu':(!b?'Izvēlieties izbraukšanas datumu':fmt(a)+' – '+fmt(b));
  }
  function pick(d){
    if(d<today)return;
    if(!a||b||d<=a){
      if(isBusy(d)){hint.textContent='Šis datums ir aizņemts';return}
      a=d;b=null;
    }else{
      if(!rangeFree(a,d)){hint.textContent='Periodā ir aizņemti datumi';a=isBusy(d)?a:d;b=null;render();sum();return}
      b=d;
    }
    render();sum();
  }
  document.getElementById('prev').addEventListener('click',function(){if(off>0){off--;render()}});
  document.getElementById('next').addEventListener('click',function(){if(off<MAXOFF){off++;render()}});

  var sumEl=document.getElementById('sum');
  function sum(){
    var o=OBJ[obj];
    if(a&&b){sumEl.className='sum ok';sumEl.innerHTML='<b>'+fmt(a)+' – '+fmt(b)+' · '+nights()+' '+nWord(nights())+'</b><span>'+o.name+'</span>';
      document.getElementById('st1').className='ok';document.getElementById('st2').className='on'}
    else{sumEl.className='sum';sumEl.innerHTML='<b>'+(a?'Ierašanās '+fmt(a):'Datumi nav izvēlēti')+'</b><span>'+(a?'Tagad atzīmējiet izbraukšanas dienu':'Atzīmējiet ierašanās un izbraukšanas dienu kalendārā')+'</span>';
      document.getElementById('st1').className='on';document.getElementById('st2').className=''}
  }
  var gs=document.getElementById('viesi');
  function fillGuests(){var v=+gs.value||2,mx=OBJ[obj].max;gs.innerHTML='';for(var i=1;i<=mx;i++){var o=document.createElement('option');o.value=i;o.textContent=i+(i===1?' viesis':' viesi');gs.appendChild(o)}gs.value=Math.min(v,mx)}
  fillGuests();render();sum();

  var form=document.getElementById('req'),err=document.getElementById('err'),done=document.getElementById('done');
  form.addEventListener('submit',function(e){
    e.preventDefault();err.textContent='';
    form.querySelectorAll('.bad').forEach(function(x){x.classList.remove('bad')});
    var f=form.elements,bad=[];
    if(!f.vards.value.trim())bad.push(f.vards);
    if(f.talrunis.value.replace(/\D/g,'').length<8)bad.push(f.talrunis);
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.epasts.value.trim()))bad.push(f.epasts);
    bad.forEach(function(x){x.classList.add('bad')});
    if(!(a&&b)){err.textContent='Izvēlieties ierašanās un izbraukšanas datumu kalendārā.';return}
    if(bad.length){err.textContent='Lūdzu, aizpildiet vārdu, tālruni un e-pastu.';bad[0].focus();return}
    var o=OBJ[obj],line=fmt(a)+' – '+fmt(b)+' ('+nights()+' '+nWord(nights())+')';
    var body='Mājoklis: '+o.name+'\nDatumi: '+line+'\nViesi: '+f.viesi.value+'\nVārds: '+f.vards.value.trim()+'\nTālrunis: '+f.talrunis.value.trim()+'\nE-pasts: '+f.epasts.value.trim()+(f.zina.value.trim()?'\nZiņa: '+f.zina.value.trim():'');
    document.getElementById('mailBtn').href='mailto:info@bfi-group.lv?subject='+encodeURIComponent('Brīvdienu īre: '+o.name+', '+fmt(a))+'&body='+encodeURIComponent(body);
    document.getElementById('doneTx').textContent=o.name+', '+line+', '+f.viesi.value+' '+(f.viesi.value==='1'?'viesis':'viesi')+'. Nosūtiet pieprasījumu e-pastā vai piezvaniet, un mēs apstiprināsim rezervāciju.';
    form.hidden=true;done.hidden=false;
    document.getElementById('st2').className='ok';document.getElementById('st3').className='on';
    done.scrollIntoView({behavior:'smooth',block:'start'});
  });
  document.getElementById('back').addEventListener('click',function(){done.hidden=true;form.hidden=false;sum();document.getElementById('st3').className=''});
})();
