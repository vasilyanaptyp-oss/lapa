(function(){
  var bg=document.getElementById('burger'),nav=document.getElementById('nav');
  bg.addEventListener('click',function(){var o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o)});
  nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');bg.setAttribute('aria-expanded','false')}});

  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});els.forEach(function(e){io.observe(e)})}else{els.forEach(function(e){e.classList.add('in')})}

  var MON=['janvāris','februāris','marts','aprīlis','maijs','jūnijs','jūlijs','augusts','septembris','oktobris','novembris','decembris'];
  var DW=['P','O','T','C','Pk','S','Sv'];
  var today=new Date();today.setHours(0,0,0,0);
  var base=new Date(today.getFullYear(),today.getMonth(),1);
  var off=today.getDate()>20?1:0,MINOFF=0,MAXOFF=11,a=null,b=null;

  function key(d){return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
  function rng(seed){return function(){seed=(seed*1103515245+12345)%2147483648;return seed/2147483648}}
  var cache={};
  function busyMonth(y,m){
    var k=y+'-'+m;if(cache[k])return cache[k];
    var r=rng(y*131+m*17+7919),set={},dim=new Date(y,m+1,0).getDate(),n=1+Math.floor(r()*2);
    for(var i=0;i<n;i++){var s=1+Math.floor(r()*(dim-3)),len=1+Math.floor(r()*3);for(var j=0;j<len&&s+j<=dim;j++)set[s+j]=1}
    return cache[k]=set;
  }
  function isBusy(d){return !!busyMonth(d.getFullYear(),d.getMonth())[d.getDate()]}
  function rangeFree(x,y){for(var d=new Date(x);d<y;d.setDate(d.getDate()+1)){if(isBusy(d))return false}return true}
  function fmt(d){return ('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+d.getFullYear()}
  function nights(){return Math.round((b-a)/864e5)}
  function nWord(n){return (n%10===1&&n%100!==11)?'nakts':'naktis'}
  function el(t,c,tx){var e=document.createElement(t);if(c)e.className=c;if(tx!=null)e.textContent=tx;return e}

  var monthsEl=document.getElementById('months'),hint=document.getElementById('hint');
  function render(msg){
    monthsEl.innerHTML='';
    for(var k=0;k<2;k++){
      var first=new Date(base.getFullYear(),base.getMonth()+off+k,1),y=first.getFullYear(),m=first.getMonth();
      var box=el('div','mon m'+(k+1));box.appendChild(el('h3',null,MON[m]+' '+y));
      var g=el('div','grid7');
      DW.forEach(function(w){g.appendChild(el('span','dw',w))});
      var lead=(first.getDay()+6)%7;
      for(var i=0;i<lead;i++)g.appendChild(el('span','day empty'));
      var dim=new Date(y,m+1,0).getDate();
      for(var dd=1;dd<=dim;dd++){
        var d=new Date(y,m,dd),btn=el('button','day',dd);btn.type='button';btn.dataset.k=key(d);
        var lbl=dd+'. '+MON[m]+' '+y;
        if(d<today){btn.classList.add('past');btn.disabled=true}
        else if(isBusy(d)){btn.classList.add('busy');btn.setAttribute('aria-disabled','true');lbl+=', viss aizņemts'}
        if(a&&key(d)===key(a))btn.classList.add('a');
        if(b&&key(d)===key(b))btn.classList.add('b');
        if(a&&b&&d>a&&d<b)btn.classList.add('in');
        btn.setAttribute('aria-label',lbl);
        (function(d){btn.addEventListener('click',function(){pick(d)})})(d);
        g.appendChild(btn);
      }
      box.appendChild(g);monthsEl.appendChild(box);
    }
    document.getElementById('prev').disabled=off<=MINOFF;
    document.getElementById('next').disabled=off>=MAXOFF;
    hint.textContent=msg||(!a?'Izvēlieties ierašanās datumu':(!b?'Izvēlieties izbraukšanas datumu':fmt(a)+' – '+fmt(b)));
  }
  function pick(d){
    if(d<today)return;
    if(!a||b||d<=a){
      if(isBusy(d)){render('Šajā datumā viss aizņemts');return}
      a=d;b=null;render();
    }else if(!rangeFree(a,d)){
      if(isBusy(d)){render('Periodā ir aizņemti datumi');return}
      a=d;b=null;render('Periodā bija aizņemti datumi, izvēlieties izbraukšanu');
    }else{b=d;render()}
    sum();
  }
  document.getElementById('prev').addEventListener('click',function(){if(off>MINOFF){off--;render()}});
  document.getElementById('next').addEventListener('click',function(){if(off<MAXOFF){off++;render()}});

  var sumEl=document.getElementById('sum'),st=[1,2,3].map(function(i){return document.getElementById('st'+i)});
  function steps(c){st.forEach(function(s,i){s.className=c[i]||''})}
  function sum(){
    sumEl.innerHTML='';
    if(a&&b){sumEl.className='sum ok';sumEl.appendChild(el('b',null,fmt(a)+' – '+fmt(b)+' · '+nights()+' '+nWord(nights())));sumEl.appendChild(el('span',null,'Pērse, Lāčplēša iela 6, Aizkraukle'));steps(['ok','on',''])}
    else{sumEl.className='sum';sumEl.appendChild(el('b',null,a?'Ierašanās '+fmt(a):'Datumi nav izvēlēti'));sumEl.appendChild(el('span',null,a?'Tagad atzīmējiet izbraukšanas dienu':'Atzīmējiet ierašanās un izbraukšanas dienu kalendārā'));steps(['on','',''])}
  }
  function fill(sel,max,def){for(var i=1;i<=max;i++){var o=document.createElement('option');o.value=i;o.textContent=i;sel.appendChild(o)}sel.value=def}
  fill(document.getElementById('apt'),8,1);
  fill(document.getElementById('viesi'),16,2);
  render();sum();

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
    var line=fmt(a)+' – '+fmt(b)+' ('+nights()+' '+nWord(nights())+')',na=+f.apt.value,nv=+f.viesi.value,ap=na+' '+(na===1?'apartaments':'apartamenti'),vi=nv+' '+(nv%10===1&&nv%100!==11?'viesis':'viesi');
    var body='Pērse, Aizkraukle\nDatumi: '+line+'\nApartamenti: '+ap+'\nViesi: '+vi+'\nVārds: '+f.vards.value.trim()+'\nTālrunis: '+f.talrunis.value.trim()+'\nE-pasts: '+f.epasts.value.trim()+(f.zina.value.trim()?'\nZiņa: '+f.zina.value.trim():'');
    document.getElementById('mailBtn').href='mailto:info@bfi-group.lv?subject='+encodeURIComponent('Pērse: rezervācija no '+fmt(a))+'&body='+encodeURIComponent(body);
    document.getElementById('doneTx').textContent=line+', '+ap+', '+vi+'. Nosūtiet pieprasījumu e-pastā vai piezvaniet, un mēs apstiprināsim rezervāciju.';
    form.hidden=true;done.hidden=false;steps(['ok','ok','on']);
    done.scrollIntoView({behavior:'smooth',block:'center'});
  });
  document.getElementById('back').addEventListener('click',function(){done.hidden=true;form.hidden=false;sum()});
})();
