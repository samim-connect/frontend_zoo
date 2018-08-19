var mvapp = angular.module('mvapp', ['ngRoute'])
var hostname = 'http://127.0.0.1:8000'

mvapp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
	
	$locationProvider.html5Mode(true);

	$routeProvider
	.when('/', {
		templateUrl: 'templates/home.html',
		controller: "homecontroller"
	})
	.when('/login/', {
		templateUrl: 'templates/login.html',
		controller: 'user_login_controller'
	})
	.when('/vendor-login/', {
		templateUrl: 'templates/vendor_login.html',
	})
	.when('/categories/', {
		templateUrl: 'templates/categories.html',
		controller: 'all_category_controller'
	})
	.when('/category/:id', {
		templateUrl: 'templates/sub_categories.html',
		controller: 'sub_categories_controller'
	})
	.when('/product/:id', {
		templateUrl: 'templates/product_page.html',
		controller: 'product_detail_controller'
	})
	.when('/user-registration/', {
		templateUrl: 'templates/registration.html',
		controller: 'user-registration'
	})
	.when('/partner-registration/', {
		templateUrl: 'templates/partner_registration.html',
		controller: 'partner-registration'
	})
	.when('/account/', {
		templateUrl: 'templates/account.html',
		controller: 'account'
	})
	.when('/dashboard/', {
		templateUrl: 'templates/dashboard.html',
		controller: 'vendor-dashboard'
	})
	.when('/logout/', {
		templateUrl: "templates/blank.html",
		controller: 'logout'
	})
	.when('/cart/', {
		templateUrl: "templates/cart.html",
		controller: 'cart'
	})
	.when('/vendor-product-list/', {
		templateUrl: "templates/vendor_product_list.html",
		controller: 'vendor_product_list'
	})
	.when('/add-product/', {
		templateUrl: "templates/add_product.html",
		controller: 'add_product'
	})
	.otherwise({
		redirectTo: '/'
	});
}]);

mvapp.controller("homecontroller", function($scope, $http, $window, $location){
	var cat_url = hostname + '/categories/'
	var carosal_url = hostname + '/carosal/'
	var product_url = hostname + '/product/'

	var lat = $window.localStorage.getItem('lat');
	var lng = $window.localStorage.getItem('lng');
	var city = $window.localStorage.getItem('city')

	if (lat != null && lng != null && city != null) {
		product_url += '?lat=' + lat + '&lng=' + lng + '&city=' + city
	}

	$scope.showLoader = true;
	$http({
		url: cat_url,
		method: "GET",
		params : {}
	}).then(function(response){
		$scope.showLoader = false;
		$scope.categories = response.data;
		console.log($scope.categories);
	}).catch(function(response){
		console.log('Something went wrong.!')
	});

	$scope.showSubCategories = function(ev, id) {
		ev.preventDefault();
		var markup_id = 'show_sub_cat_' + id;
		$scope['show_sub_cat_' + id] = true;
	}

	$http({
		url: carosal_url,
		method: "GET",
		params: {}
	}).then(function(response){
		console.log('Hello');
		$scope.carosal_slider = response.data;
	}).catch(function(response){
		console.log('Error');
	});

	$http({
		url: product_url,
		method: "GET",
		params: {}
	}).then(function(response){
		$scope.featured_products = response.data;
		$scope.show_featured_products = true;

	}).catch(function(response){
		console.log(response);
	});
});

mvapp.controller("all_category_controller", function($scope, $http){

	var url = hostname + '/categories/'
	$http({
		url: url,
		method: "GET",
		params: {}
	}).then(function(response){
		$scope.category_list = response.data
	}).catch(function(response){
		console.log('Error');
	});
});
mvapp.controller("sub_categories_controller", function($scope, $http, $routeParams){
	var url = hostname + '/sub-categories/?id='+ $routeParams.id;
	console.log(url);
	$http({
		url: url,
		method: "GET",
		params: {}
	}).then(function(response){
		console.log(response);
		$scope.category_heading = response.data[0]['product_category']
		$scope.product_list = response.data[0]['products']

	});

});

mvapp.controller('product_detail_controller', function($scope, $http, $routeParams, $location, $window){
	var url = hostname + '/product/?id=' + $routeParams.id;

	$http({
		url: url,
		method: "GET",
		params: {}
	}).then(function(response){
		$scope.product = response.data;
		var headers;
		var token = $window.localStorage.getItem('token');
        $scope.show_booking = true;
        $scope.cart_success = false;
		$scope.update_cart = function(id){
			if (token != null){
				headers = {'Authorization': token};
				update_cart_url = hostname + '/cart/?item_id=' + id + '&action=update';
				$http({
					url: update_cart_url,
					method: "POST",
					params: {},
					headers: headers
				}).then(function(response){
					$scope.show_booking = false;
					$scope.cart_success = true;
				}).catch(function(response){
					console.log(response);
					$location.url('/login');
				});
			}
			else{
				$location.url('/login')
			}
		}
		$scope.delete_cart = function(id){
			if (token != null){
				headers = {'Authorization': token};
				delete_cart_url = hostname + '/cart/?item_id=' + id + '&action=delete';
				headers = {'Authorization': token};
				$http({
					url: delete_cart_url,
					method: "POST",
					params: {},
					headers: headers
				}).then(function(response){
					$scope.show_booking = true;
					$scope.cart_success = false;
				});
			}
			else{
				$location.url('/login')
			}
		} 
	});
});

mvapp.controller('user-registration', function($scope, $http){
	var url = hostname + '/user-profile/'
	$scope.errors = false;
	$scope.confim_submit = false;
	$scope.submit_usercreation_form = function(){
		var postData = {
			"username": $scope.user.username,
			"email": $scope.user.email,
			"password1": $scope.user.password1,
			"password2": $scope.user.password2,
			"user_type": "Customer"
		}
		$http({
			url: url,
			method: 'POST',
			data: postData,

		}).then(function(response){
			$scope.hide_login_form = true;
			$scope.confim_submit = true;
		}).catch(
			function(response){
			var errors = response.data['detail'];
			var error_list = [];
			errors = JSON.parse(errors);
			for (var key in errors){
				error_list = error_list.concat(errors[key]);
			}
			$scope.error_list = error_list;
			$scope.errors = true;
		});
	}
});

mvapp.controller('user_login_controller', function($scope, $http, $window, $location, $route){
	var url = hostname + '/login/';

	$scope.submit_login_form = function(){
		var postData = {
			"email": $scope.login.email,
			"password": $scope.login.password,
		}
		$http({
			url: url,
			method: 'POST',
			data: postData,

		}).then(function(response){
			var Token = response.data['Authorization']
			$window.localStorage.setItem('token', Token);
			$location.url('/');
			$window.location.reload()
		}).catch(
			function(response){
			var errors = response.data['detail'];
			$scope.errors_message = errors;
			$scope.errors = true;
		});
	}
});

mvapp.controller('header_controller', function($scope, $http, $window, $location){
	var token = $window.localStorage.getItem('token');
	$scope.show_login = true;
	if (token !=null){
		headers = {'Authorization': token}
		$http({
			url: hostname + '/user-profile/',
			method: "GET",
			params: {},
			headers: headers
		}).then(function(response){
			var data = response.data;
			var user = data
			$scope.show_login = false;
			$scope.show_dashboard = false;
			$scope.show_account = false;

			var user = data;
			if (user.user_type == 'Customer') {
				$scope.show_account = true;
				$scope.show_dashboard = false;
			}
			else {
				$scope.show_account = false;
				$scope.show_dashboard = true;
			}
		});
	}
});

mvapp.controller('account', function($scope, $http, $window, $location){

	$scope.display_info = false;
	var headers;
	var token = $window.localStorage.getItem('token');
	
	if (token != null){
		headers = {'Authorization': token};

		$http({
			url: hostname + '/user-profile/',
			method: 'GET',
			headers: headers

		}).then(function(response){
			console.log(response.data);
			$scope.display_info = true;
			var user = response.data;
			if (user.user_type == 'Customer'){
				$scope.display_info = true;
				$scope.user = response.data;
			}
			else{
				$location.url('/dashboard/');
			}
		}).catch(function(){
			$window.localStorage.removeItem('token');
			$location.url('/login/');
			$window.location.reload();
		});
	}
	else{
		$location.url('/login/');
	}
});

mvapp.controller('logout', function($scope, $http, $window, $location){
	var token = $window.localStorage.removeItem('token');
	$location.url('/');
	$window.location.reload();

});

mvapp.controller('vendor_product_list', function($scope, $http, $window, $location){
	var token = $window.localStorage.getItem('token');
	if (token != null){
		headers = {'Authorization': token}
		$http({
			url: hostname + '/vendor-products/',
			method: "GET",
			params: {},
			headers: headers
		}).then(function(response){
			var data = response.data;
			$scope.product_list = data;
		}).catch(function(response){
			$location.url('/');
		});
	}
	else {
		$location.url('/');	
	}

	$scope.remove_product = function(item){
		var index = $scope.product_list.indexOf(item);
		var id = item.id;
			if (token != null){
				headers = {'Authorization': token};
				delete_product_url = hostname + '/vendor-products/?item_id=' + id + '&action=delete';
				headers = {'Authorization': token};
				$http({
					url: delete_product_url,
					method: "GET",
					params: {},
					headers: headers,
				}).then(function(response){
					console.log($scope.product_list);
					$scope.product_list.splice(index, 1);
				});
			}
			else{
				$location.url('/login')
			}
		}

});


mvapp.controller('vendor-dashboard', function($scope, $http, $location, $window){
	var token = $window.localStorage.getItem('token');
	if (token !=null){
		headers = {'Authorization': token}
		$http({
			url: hostname + '/user-profile/',
			method: "GET",
			params: {},
			headers: headers
		}).then(function(response){
			var data = response.data;
			if (data.user_type == 'Customer') {
				$location.url('/');
			}
			else {
				$scope.user = data;
			}
		});
	}
});

mvapp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

mvapp.controller('add_product', function($scope, $http, $location, $window){
	var token = $window.localStorage.getItem('token');
	$scope.product_created = false;
	$scope.image_message = false;
	if (token !=null){
		headers = {'Authorization': token}
		$http({
			url: hostname + '/user-profile/',
			method: "GET",
			params: {},
			headers: headers
		}).then(function(response){
			var data = response.data;
			if (data.user_type == 'Customer') {
				$location.url('/');
			}
			else {
				$http({
					url: hostname + '/sub-categories/',
					method: "GET",
					params : {}
				}).then(function(response){
					$scope.showLoader = false;
					$scope.sub_categories = response.data
				}).catch(function(response){
					
				});

				$scope.user = data;
				$scope.add_product = function(){
					var product  = $scope.product;
					// product['category'] = product.category.id;
					product['category'] = product.category.id;
					$http({
						url: hostname + '/vendor-products/',
						method: "POST",
						params: {},
						headers: headers,
						data: product

					}).then(function(response){
						$scope.product_created = true;
						$scope.image_message = true;
						var item_id = response.data['item_id']
				        var file = $scope.myFile;
				        console.log('file is ' );
				        console.dir(file);
				        var fd = new FormData();
				        fd.append('image', file);
				        console.log(fd.keys());
						$http.post(
							hostname + '/product-image-upload/?item_id=' + item_id, fd, {
								transformRequest: angular.identity,
								headers: {
									'Content-Type': undefined,
									'Authorization': token,
									// 'enctype': 'multipart/form-data'
								}
							}
						).then(function(response){
							$location.url('/vendor-product-list/');
						}).catch(function(response){
							console.log(response);	
						});
					}).catch(function(response){
						console.log(response);
						var error_list = [];
						var errors = response.data['detail'];
						errors = JSON.parse(errors);
						for (var key in errors){
							error_list = error_list.concat(errors[key]);
						}
						$scope.errors = error_list;
						$scope.show_errors = true;
					});
				}
			}
		});
	}
});

mvapp.controller('cart', function($scope, $http, $window, $location){
	var token = $window.localStorage.getItem('token');

	if (token != null){
		headers = {'Authorization': token};
		var cart_url = hostname + '/cart/';

		$http({
			url: cart_url,
			method: "GET",
			params: {},
			headers: headers
		}).then(function(response){
			var cart_items = response.data;
			$scope.items = cart_items;

		}).catch(function(response){
			console.log(response);
		});
	}
	else{
		$location.url('/login');
	}

	$scope.remove_item = function(item){
		var index = $scope.items.indexOf(item);
		var id = item.id;
			if (token != null){
				headers = {'Authorization': token};
				delete_cart_url = hostname + '/?item_id=' + id + '&action=delete';
				headers = {'Authorization': token};
				$http({
					url: delete_cart_url,
					method: "POST",
					params: {},
					headers: headers
				}).then(function(response){
					$scope.items.splice(index, 1);
				});
			}
			else{
				$location.url('/login')
			}
		}

});

mvapp.controller('partner-registration', function($scope, $http, $window){
	// $scope.apply();
	var url = hostname + '/user-profile/'
	$scope.errors = false;
	$scope.confim_submit = false;
	$scope.submit_usercreation_form = function(){
		try{
			var location = {
				'lat': angular.element($('#lat')).text(),
				'long': angular.element($('#long')).text(),
				'city': angular.element($('#city')).text(),
				'state': angular.element($('#state')).text(),
				'country': angular.element($('#country')).text(),
				"username": $scope.user.username,
			}
			var postData = {
				"username": $scope.user.username,
				"email": $scope.user.email,
				"password1": $scope.user.password1,
				"password2": $scope.user.password2,
				"user_type": "Seller",
				"location": location,
				"phone_number": $scope.user.phone_number,
				"location": location
			}
		}
		catch(err) {
			$scope.error_list = ['Please fill up all the fields!']
		}

		$http({
			url: url,
			method: 'POST',
			data: postData,

		}).then(function(response){
			$scope.hide_login_form = true;
			$scope.confim_submit = true;
			$scope.message = response.erros;
			$scope.hide_login_form = true;
			$scope.confim_submit = true;
			$http({
				'url': hostname + '/location/',
				'method': 'POST',
				'data': location
			}).then(function(response){
				console.log('Location updated');
			});
		}).catch(
			function(response){
			var errors = response.data['detail'];
			var error_list = [];
			errors = JSON.parse(errors);
			for (var key in errors){
				error_list = error_list.concat(errors[key]);
			}
			$scope.error_list = error_list;
			$scope.errors = true;
		});
	}
});