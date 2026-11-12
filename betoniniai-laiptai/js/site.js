(function(){
  var top=document.getElementById('top'),mcall=document.getElementById('mcall'),burger=top&&top.querySelector('.burger');
  function onScroll(){var y=window.scrollY||0;top.classList.toggle('solid',y>40);if(mcall)mcall.classList.toggle('on',y>innerHeight*.6);}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  function menu(o){top.classList.toggle('open',o);burger.setAttribute('aria-expanded',o?'true':'false');burger.setAttribute('aria-label',o?'Uždaryti meniu':'Atidaryti meniu');}
  if(burger){
    burger.addEventListener('click',function(){menu(!top.classList.contains('open'));});
    [].forEach.call(top.querySelectorAll('.mnav a'),function(a){a.addEventListener('click',function(){menu(false);});});
    addEventListener('resize',function(){if(innerWidth>900&&top.classList.contains('open'))menu(false);});
  }
  var lb=document.getElementById('lb'),list=[],cur=0,opener=null,sx=null;
  if(lb){
    var im=lb.querySelector('img'),cap=lb.querySelector('.c');
    var srcOf=function(b){return b.getAttribute('data-full')||b.querySelector('img').getAttribute('src');};
    var show=function(i){cur=(i+list.length)%list.length;var b=list[cur],s=b.querySelector('img');im.src=srcOf(b);im.alt=s.alt;cap.textContent=s.alt+' · '+(cur+1)+' / '+list.length;
      [cur+1,cur-1].forEach(function(k){var nb=list[(k+list.length)%list.length];if(nb){var p=new Image();p.src=srcOf(nb);}});};
    var open=function(b){var g=b.closest('.gal');list=[].filter.call(g.querySelectorAll('button'),function(x){return !x.classList.contains('hide');});opener=b;show(list.indexOf(b));lb.classList.add('on');document.documentElement.style.overflow='hidden';lb.querySelector('.x').focus();};
    var close=function(){lb.classList.remove('on');document.documentElement.style.overflow='';if(opener){try{opener.focus({preventScroll:true});}catch(e){opener.focus();}}};
    [].forEach.call(document.querySelectorAll('.gal button'),function(b){b.addEventListener('click',function(){open(b);});});
    lb.querySelector('.x').addEventListener('click',close);
    lb.querySelector('.p').addEventListener('click',function(e){e.stopPropagation();show(cur-1);});
    lb.querySelector('.nx').addEventListener('click',function(e){e.stopPropagation();show(cur+1);});
    lb.addEventListener('click',function(e){if(e.target===lb)close();});
    lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
    lb.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>45)show(cur+(dx<0?1:-1));});
  }
  document.addEventListener('keydown',function(e){
    if(lb&&lb.classList.contains('on')){
      if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(cur-1);else if(e.key==='ArrowRight')show(cur+1);
      else if(e.key==='Tab'){var f=[].slice.call(lb.querySelectorAll('button')),i=f.indexOf(document.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();}
      return;
    }
    if(e.key==='Escape'&&burger&&top.classList.contains('open')){menu(false);burger.focus();}
  });
  [].forEach.call(document.querySelectorAll('.tabs[data-for]'),function(tb){
    var g=document.getElementById(tb.getAttribute('data-for')),bs=[].slice.call(tb.querySelectorAll('button'));
    bs.forEach(function(t){t.addEventListener('click',function(){bs.forEach(function(x){x.setAttribute('aria-pressed',x===t?'true':'false');});var f=t.getAttribute('data-f');
      [].forEach.call(g.querySelectorAll('button'),function(b){b.classList.toggle('hide',f!=='all'&&b.getAttribute('data-t')!==f);});});});
  });
  var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -6% 0px'}):null;
  [].forEach.call(document.querySelectorAll('.rv'),function(el,i){if(el.closest('.hero,.phero')){setTimeout(function(){el.classList.add('in');},80+i*90);}else if(io){io.observe(el);}else{el.classList.add('in');}});
})();
