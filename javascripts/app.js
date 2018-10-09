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
app.controller('footerCtrl', function($scope, $rootScope, $http, $route, $location) {
	$rootScope.all = null;

	$rootScope.ano = $route.current.params.ano || '2018';
	$rootScope.CAE = $route.current.params.CAE;
	$rootScope.rendimentos = parseInt($route.current.params.rendimentos);
	$rootScope.gastos = parseInt($route.current.params.gastos);
	$rootScope.tipo = ($route.current.params.tipo === 'geral' || $route.current.params.tipo === 'PME' || $route.current.params.tipo === 'excecoes') ? $route.current.params.tipo : 'geral';

	$rootScope.results = {};

	$rootScope.calculateResults = function(){
		if ($rootScope.ano &&
			$rootScope.CAE &&
			$rootScope.rendimentos &&
			$rootScope.gastos &&
			$rootScope.tipo){ //check if the file has already been retrieved
			if ($rootScope.all) {

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

