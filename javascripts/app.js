var app = angular.module("app", ["ngRoute", "ngAnimate",]);

/*app.filter("trustUrl", function($sce) {
	return function(Url) {
		return $sce.trustAsResourceUrl(Url);
	};
});*/

/* ROUTES CONFIGURATION START */
app.config(function($routeProvider,$locationProvider) {
	$routeProvider
		.when("/", {
			templateUrl : "partials/index.htm",
			controller : "indexCtrl"
		})
		.when("/calculo", {
			templateUrl : "partials/calculo.htm",
			controller : "calculoCtrl"
		})
		.when("/resultado", {
			templateUrl : "partials/resultado.htm",
			controller : "resultadoCtrl"
		})
		.otherwise({
			redirectTo: '/'
		});

	// use the HTML5 History API (to remove hashbang[#!] from url)
	$locationProvider.html5Mode(true);
});
/* ROUTES CONFIGURATION END */

/* CONTROLLERS START */
app.controller('footerCtrl', function($scope, $rootScope, $http, $route, $location, $filter) {
	$rootScope.all = null;

	$rootScope.ano = $route.current.params.ano || '2018';
	$rootScope.setorIRS = $route.current.params.setorIRS;
	$rootScope.setorIRC = $route.current.params.setorIRC;
	$rootScope.rendimentos = parseInt($route.current.params.rendimentos);
	$rootScope.gastos = parseInt($route.current.params.gastos);
	$rootScope.tipo = ($route.current.params.tipo === 'geral' || $route.current.params.tipo === 'PME' || $route.current.params.tipo === 'excecoes') ? $route.current.params.tipo : 'geral';

	$rootScope.results = {
	};

	$rootScope.calculateResults = function(){
		$rootScope.results = {
			naoSocietario: {
				regimeSimplificado: {
				},
				contabilidadeOrganizada: {}
			},
			societario: {
				regimeSimplificado: {},
				contabilidadeOrganizada: {}
			}
		};
		if ($rootScope.ano &&
			$rootScope.setorIRS &&
			$rootScope.setorIRC &&
			$rootScope.rendimentos &&
			$rootScope.gastos &&
			$rootScope.tipo){ //check if the file has already been retrieved
			if ($rootScope.all) {
				// maths
				var IRS = $rootScope.all[$rootScope.ano].IRS;
				var IRC = $rootScope.all[$rootScope.ano].IRC;
				var setores = $rootScope.all[$rootScope.ano].setores;
				var limites = $rootScope.all[$rootScope.ano].limites;
				var best = null;
				var tmp;

				// NAO SOCIETARIO - REGIME SIMPLIFICADO
				var nSrS = $rootScope.results.naoSocietario.regimeSimplificado;
				if ($rootScope.rendimentos <= limites.naoSocietario.regimeSimplificado.rendimentos){
					nSrS.coeficiente = setores.IRS[$rootScope.setorIRS].coeficiente;
					tmp = $rootScope.rendimentos * nSrS.coeficiente;
					nSrS.reducao = setores.IRS[$rootScope.setorIRS].reducao;
					tmp -= tmp * nSrS.reducao;
					nSrS.baseImposto = tmp;
					nSrS.baseImpostoString = $filter('largeNumber')(tmp) + '€ X ' + nSrS.coeficiente * 100 + '% X ' + (1 - nSrS.reducao) * 100 + '%';

					for(var i=0; i < IRS.length; i++){

						if(i === IRS.length-1 || (tmp > IRS[i].min && tmp <= IRS[i].max)){
							if(i === 0){ // primeiro escalão
								nSrS.total = tmp * IRS[i].A;
								nSrS.totalString = $filter('largeNumber')(tmp) + '€ X ' + Math.round(IRS[i].A * 100000) / 1000 + '%';
							} else { // outros escaloes
								nSrS.total = IRS[i-1].max * IRS[i-1].B + ((tmp - IRS[i-1].max) * IRS[i].A);
								nSrS.escalaoAnterior = IRS[i-1];
								nSrS.totalString = $filter('largeNumber')(IRS[i-1].max) + '€ X ' + Math.round(IRS[i-1].B * 100000) / 1000 + '% + ' + $filter('largeNumber')(tmp - IRS[i-1].max) + '€ X ' + Math.round(IRS[i].A * 100000) / 1000 + '%';
							}
							nSrS.escalao = IRS[i];
							nSrS.total = Math.round(nSrS.total * 100) / 100;
							break;
						}
					}
				} else {
					nSrS = null
				}
				if (nSrS){
					best = nSrS;
				}

				// NAO SOCIETARIO - CONTABILIDADE ORGANIZADA
				var nScO = $rootScope.results.naoSocietario.contabilidadeOrganizada;

				tmp = $rootScope.rendimentos - $rootScope.gastos;
				nScO.baseImposto = tmp;
				nScO.baseImpostoString = $filter('largeNumber')($rootScope.rendimentos) + '€ - ' + $filter('largeNumber')($rootScope.gastos) + '€';

				for(var i=0; i < IRS.length; i++){

					if(i === IRS.length-1 || (tmp > IRS[i].min && tmp <= IRS[i].max)){
						if(i === 0){ // primeiro escalão ou último escalão
							nScO.total = tmp * IRS[i].A;
							nScO.totalString = $filter('largeNumber')(tmp) + '€ X ' + Math.round(IRS[i].A * 100000) / 1000 + '%';
						} else { // outros escaloes
							nScO.total = IRS[i-1].max * IRS[i-1].B + ((tmp - IRS[i-1].max) * IRS[i].A);
							nScO.escalaoAnterior = IRS[i-1];
							nScO.totalString = $filter('largeNumber')(IRS[i-1].max) + '€ X ' + Math.round(IRS[i-1].B * 100000) / 1000 + '% + ' + $filter('largeNumber')(tmp - IRS[i-1].max) + '€ X ' + Math.round(IRS[i].A * 100000) / 1000 + '%';
						}
						nScO.escalao = IRS[i];
						nScO.total = Math.round(nScO.total * 100) / 100;
						break;
					}
				}
				if (!best || (nScO && nScO.total < best.total)){
					best = nScO;
				}


				// SOCIETARIO - REGIME SIMPLIFICADO
				var srS = $rootScope.results.societario.regimeSimplificado;
				if ($rootScope.rendimentos <= limites.societario.regimeSimplificado.rendimentos){
					srS.coeficiente = setores.IRC[$rootScope.setorIRC].coeficiente;
					tmp = $rootScope.rendimentos * srS.coeficiente;
					srS.reducao = setores.IRC[$rootScope.setorIRC].reducao;
					tmp -= tmp * srS.reducao;
					srS.baseImpostoString = $filter('largeNumber')(tmp) + '€ X ' + srS.coeficiente * 100 + '% X ' + (1 - srS.reducao) * 100 + '%';

					if(tmp < limites.societario.regimeSimplificado.baseImposto) { // TODO menor ou igual aos limites da baseImposto
						tmp = limites.societario.regimeSimplificado.baseImposto;
						srS.baseImpostoString = $filter('largeNumber')(tmp) + '€';
					}
					srS.baseImposto = tmp;


					if ($rootScope.tipo === 'geral'){
						srS.total = tmp * IRC.geral;
						srS.totalString = $filter('largeNumber')(tmp) + '€ X ' + IRC.geral * 100 + '%';
					} else if ($rootScope.tipo === 'PME'){
						if(tmp > IRC.PME.max){
							srS.total = IRC.PME.max * IRC.PME.taxa + (tmp - IRC.PME.max) * IRC.geral;
							srS.totalString = $filter('largeNumber')(IRC.PME.max) + '€ X ' + IRC.PME.taxa * 100 + '% + ' + $filter('largeNumber')(tmp - IRC.PME.max) + '€ X ' + IRC.geral * 100 + '%' ;
						} else {
							srS.total = tmp * IRC.PME.taxa;
							srS.totalString = $filter('largeNumber')(tmp) + '€ X ' + IRC.PME.taxa * 100 + '%';
						}
					} else if ($rootScope.tipo === 'excecoes'){
						srS.total = tmp * IRC.excecoes;
						srS.totalString = $filter('largeNumber')(tmp) + '€ X ' + IRC.excecoes * 100 + '%';
					}
					srS.total = Math.round(srS.total * 100) / 100;
				} else {
					srS = null
				}
				if (!best || (srS && srS.total < best.total)){
					best = srS;
				}

				// SOCIETARIO - CONTABILIDADE ORGANIZADA
				var scO = $rootScope.results.societario.contabilidadeOrganizada;

				tmp = $rootScope.rendimentos - $rootScope.gastos;
				scO.baseImposto = tmp;
				scO.baseImpostoString = $filter('largeNumber')($rootScope.rendimentos) + '€ - ' + $filter('largeNumber')($rootScope.gastos) + '€';

				if ($rootScope.tipo === 'geral'){
					scO.total = tmp * IRC.geral;
					scO.totalString = $filter('largeNumber')(tmp) + '€ X ' + IRC.geral * 100 + '%';
				} else if ($rootScope.tipo === 'PME'){
					if(tmp > IRC.PME.max){
						scO.total = IRC.PME.max * IRC.PME.taxa + (tmp - IRC.PME.max) * IRC.geral;
						scO.totalString = $filter('largeNumber')(IRC.PME.max) + '€ X ' + IRC.PME.taxa * 100 + '% + ' + $filter('largeNumber')(tmp - IRC.PME.max) + '€ X ' + IRC.geral * 100 + '%' ;
					} else {
						scO.total = tmp * IRC.PME.taxa;
						scO.totalString = $filter('largeNumber')(tmp) + '€ X ' + IRC.PME.taxa * 100 + '%';
					}
				} else if ($rootScope.tipo === 'excecoes'){
					scO.total = tmp * IRC.excecoes;
					scO.totalString = $filter('largeNumber')(tmp) + '€ X ' + IRC.excecoes * 100 + '%';
				}
				scO.total = Math.round(scO.total * 100) / 100;
				if (!best || (scO && scO.total < best.total)){
					best = scO;
				}

				best.isBest = true;

				// simplify variables
				$rootScope.nSrS = nSrS;
				$rootScope.nScO = nScO;
				$rootScope.srS = srS;
				$rootScope.scO = scO;


				console.log($rootScope.results);
				$rootScope.loading = false;
				return true;
			} else {

				return false;
			}
		} else {
			if($location.path() === '/resultado'){
				$location.path('/calculo');
				$rootScope.loading = false;
			}
			return false;
		}
	};

	$http
		.get('./data.json')
		.then(function(response){
			if(response.data){
				$rootScope.all = response.data; // download the file before anything else
				$rootScope.calculateResults();
			}
		});
});

// Views controllers
app.controller('indexCtrl', function($scope) {

});

app.controller('calculoCtrl', function($scope) {

});

app.controller('resultadoCtrl', function($scope, $rootScope) {
	$rootScope.loading = true;
	if($rootScope.calculateResults){
		$rootScope.calculateResults();
	}

	$scope.export = function(){
		html2canvas(document.getElementById('exportable'), {
			onrendered: function (canvas) {
				var data = canvas.toDataURL();
				var docDefinition = {
					content: [{
						image: data,
						width: 500,
					}]
				};
				var now = new Date();

				timestamp = now.getFullYear().toString();
				timestamp += (now.getMonth() < 9 ? '0' : '') + (now.getMonth() + 1).toString(); // pad with a 0
				timestamp += (now.getDate() < 10 ? '0' : '') + now.getDate().toString();
				timestamp += '_' + (now.getHours() < 10 ? '0' : '') + now.getHours().toString();
				timestamp += (now.getMinutes() < 10 ? '0' : '') + now.getMinutes().toString();
				pdfMake.createPdf(docDefinition).download("resultado-" + timestamp + ".pdf");
			}
		});
	}
});

app.filter('largeNumber', function() {
	return function (x) {
		var parts = x.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
		return parts.join(".");
	}
});