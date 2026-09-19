/* CrowRules Entertainment Admin shared JS */
(function(){
  "use strict";
  window.CrowRulesAdmin={
    version:"1.1.0",
    showMessage:function(message){window.alert(String(message));},
    ready:function(fn){
      if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",fn);}
      else{fn();}
    }
  };
  window.CrowRulesAdmin.ready(function(){
    document.querySelectorAll(".nav a").forEach(function(link){
      link.addEventListener("click",function(){
        document.querySelectorAll(".nav a.active").forEach(function(x){x.classList.remove("active");});
        link.classList.add("active");
      });
    });
  });
})();
