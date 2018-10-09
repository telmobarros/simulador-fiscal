var app=angular.module("app",["ngRoute","ngAnimate"]);app.config(function(c,a){c.when("/",{templateUrl:"partials/index.htm",controller:"indexCtrl"}).when("/calculo",{templateUrl:"partials/calculo.htm",controller:"calculoCtrl"}).when("/resultado",{templateUrl:"partials/resultado.htm",controller:"resultadoCtrl"}).otherwise({redirectTo:"/"});a.html5Mode(!0)});
app.controller("footerCtrl",function(c,a,e,b,d){a.all=null;a.ano=b.current.params.ano||"2018";a.CAE=b.current.params.CAE;a.rendimentos=parseInt(b.current.params.rendimentos);a.gastos=parseInt(b.current.params.gastos);a.tipo=b.current.params.tipo;a.results={};a.calculateResults=function(){if(a.ano&&a.CAE&&a.rendimentos&&a.gastos&&a.tipo)return a.all?(a.loading=!1,!0):!1;"/resultado"===d.path()&&(d.path("/calculo"),a.loading=!1);return!1};e.get("./data.json").then(function(b){b.data&&(a.all=b.data,
console.log(b.data),a.calculateResults())})});app.controller("indexCtrl",function(c){});app.controller("calculoCtrl",function(c){});
app.controller("resultadoCtrl",function(c,a){a.loading=!0;a.calculateResults&&a.calculateResults();c.export=function(){html2canvas(document.getElementById("exportable"),{onrendered:function(a){a={content:[{image:a.toDataURL(),width:500}]};var b=new Date;timestamp=b.getFullYear().toString();timestamp+=(9>b.getMonth()?"0":"")+(b.getMonth()+1).toString();timestamp+=(10>b.getDate()?"0":"")+b.getDate().toString();timestamp+="_"+(10>b.getHours()?"0":"")+b.getHours().toString();timestamp+=(10>b.getMinutes()?
"0":"")+b.getMinutes().toString();pdfMake.createPdf(a).download("resultado-"+timestamp+".pdf")}})}});