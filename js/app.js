// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js


var bcrypt = dcodeIO.bcrypt;
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("B4c0/\/", salt);

App = angular.module('starter', ['ionic', 'starter.controllers','ngCordova'])

App.run(function ($ionicPlatform,$rootScope,$cordovaDevice,$cordovaSQLite,$cordovaNetwork,$cordovaSplashscreen,$timeout,$ionicLoading) {
    
     //$rootScope.syncObj = [{title:'Contacts',sync:false},{title:'Accounts',sync:false},{title:'Products',sync:false},{title:'Categories',sync:false},{title:'RelatedProduct',sync:false},{title:'Orderhistory',sync:false}]; 
	$rootScope.syncObj = [{title:'Contacts',sync:false},{title:'Products',sync:false},{title:'Categories',sync:false},{title:'Related Product',sync:false}]; 
	$rootScope.syncUserObj = [{title:'Accounts',sync:false},{title:'Order History',sync:false}]; 

    if (window.localStorage.getItem("mUser") != "undefined" && window.localStorage.getItem("mUser") != null) {
        $rootScope.mUser = JSON.parse(window.localStorage.getItem("mUser"));
        if($rootScope.syncObj.length <= 4){
            $rootScope.syncObj.push({title:'Accounts',sync:false},{title:'Order History',sync:false});
        }
    }

    if (window.localStorage.getItem("mAccount") == "undefined" || window.localStorage.getItem("mAccount") == null) {
        $rootScope.pageTitle = "No Account selected";
        $rootScope.reOrderUrl = "";
        $rootScope.accountUrl = "";
        $rootScope.invoiceUrl = "";
        $rootScope.deliveryUrl = "";
    }
    else
    {
        $rootScope.accountUrl = "#/app/tab/detail";
        $rootScope.invoiceUrl = "#/app/tab/invoice";
        $rootScope.deliveryUrl = "#/app/tab/delivery";
        $rootScope.mAccount = JSON.parse(window.localStorage.getItem("mAccount"));
    }
    
    if (window.localStorage.getItem("syncDate") != "undefined") {
        $rootScope.lastsyncDate = window.localStorage.getItem("syncDate");
    }
    

    $rootScope.contactData = [];
    $rootScope.accountData = [];
   
    
    $rootScope.todayDate = new Date().getTime();
    $rootScope.tokenExpireDate = "";
    $rootScope.headers = "";

    if(window.localStorage.getItem("email") == undefined && window.localStorage.getItem("remember") == undefined ){
        window.localStorage.setItem ("email",'');
        window.localStorage.setItem("remember", false);
    }

    if (window.localStorage.getItem("tokenExpDate") != "undefined" && !isNaN(window.localStorage.getItem("tokenExpDate"))) {
        $rootScope.tokenExpireDate = window.localStorage.getItem("tokenExpDate");
    }

    if (window.localStorage.getItem("mfcToken") != "undefined") {
        $rootScope.headers = {headers:{'Accept':'application/json', 'Content-Type':'application/json', 'Authorization':'Bearer '+window.localStorage.getItem("mfcToken") }}
    }


    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){

		if($rootScope.tokenExpireDate != ""  && $rootScope.todayDate > Number($rootScope.tokenExpireDate)){
		    $rootScope.getToken();
		}else if($rootScope.tokenExpireDate == "" || $rootScope.tokenExpireDate == null){
		    $rootScope.getToken();
		}else if($rootScope.headers == ''){
		    $rootScope.getToken();
		}else{
			$rootScope.loadOrders();
		}
		$rootScope.isOffline = $cordovaNetwork.isOffline();
    })

    
	$rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
		  $rootScope.isOffline = $cordovaNetwork.isOffline();
    })
    

    
    $ionicPlatform.ready(function () {        
        if (!window.isTablet)
        {
            window.plugins.orientationLock.lock("portrait")
        }
        
		  $rootScope.DB = $cordovaSQLite.openDB({name: 'mfc.db', location: 'default'});
        
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS contacts (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, UserName TEXT, Password TEXT, CustType TEXT, CustRepTerritory TEXT, SaltUsed TEXT, RelatedAccountNumber TEXT)');        
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE INDEX contacts_idx1 ON contacts(UserName)');

		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS products (ProdID INTEGER PRIMARY KEY AUTOINCREMENT, ProdCode TEXT, ProdParentID INTEGER, ProdParentCode TEXT, ProdTitle TEXT, ProdDesc TEXT, ProdStockQty INTEGER, prodHidePrice TEXT, PriceExVat REAL, PriceIncVat REAL, OnSale TEXT, SalePriceExVat REAL, SalePriceIncVat REAL, CostPrice REAL, ProdUnitPrice REAL, ProductCategory INTEGER, Image TEXT, relatedProductIDs TEXT)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE INDEX products_idx1 ON products(ProductCategory,ProdTitle)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS categories (catID INTEGER PRIMARY KEY AUTOINCREMENT, catParentID INTEGER, catTitle TEXT, CatOrder INTEGER)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS accounts (AccountId INTEGER PRIMARY KEY AUTOINCREMENT, AccountNumber TEXT, AccountCompany TEXT, AccountTerritory TEXT, Title TEXT, FirstName TEXT, Surname TEXT, Telephone TEXT, Mobile TEXT, EmailAddress TEXT, BillingHouseName TEXT, BillingAddressLine1 TEXT, BillingAddressLine2 TEXT, BillingTown TEXT, BillingCounty TEXT, BillingPostcode TEXT, BillingCountry TEXT, DeliveryRefrenceName TEXT, DeliveryTitle TEXT, DeliveryFirstName TEXT, DeliverySurname TEXT, DeliveryHouseName TEXT, DeliveryAddressLine1 TEXT, DeliveryAddressLine2 TEXT, DeliveryTown TEXT, DeliveryCounty TEXT, DeliveryPostcode TEXT, DeliveryCountry TEXT)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE INDEX accounts_idx1 ON accounts(AccountCompany,AccountNumber)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS order_history (OrderHistoryID INTEGER PRIMARY KEY AUTOINCREMENT, costPrice REAL, operaCostPrice REAL, unitCost REAL, accountNumber TEXT, orderHistoryTitle TEXT, prodID INTEGER, prodTitle TEXT, prodPrice REAL, orderHistoryDate TEXT, prodHidePrice TEXT, prodStockQty INTEGER, parentTitle TEXT, quantity INTEGER, orderHistoryNumericDate INTEGER, userId INTEGER)');
        
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE INDEX order_history_idx1 ON order_history(prodID,AccountNumber)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS basket ( basketID INTEGER PRIMARY KEY AUTOINCREMENT, ProdID INTEGER, ProdTitle TEXT, ProdUnitPrice REAL, qnt INTEGER,stokQnt INTEGER, PriceExVat REAL, PriceIncVat REAL, Vat REAL, isTBC INTEGER DEFAULT 0, UserID INTEGER)');

		 //$cordovaSQLite.execute($rootScope.DB, 'CREATE UNIQUE INDEX IF NOT EXISTS ProdIDIndex ON basket (ProdID)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS cart(CartID INTEGER PRIMARY KEY AUTOINCREMENT, custID INTEGER, accountNumber TEXT, orderDate TEXT, orderTotal REAL, orderDeliveryTotal REAL, orderShipSameAsBilling INTEGER DEFAULT 0, orderShipCompany TEXT, orderShipTitle TEXT, orderShipFirstname TEXT, orderShipSurname TEXT, orderShipHouseNameNo TEXT, orderShipAddress1 TEXT, orderShipAddress2 TEXT, orderShipCity TEXT, orderShipCounty TEXT, orderShipPostcode TEXT, orderShipTelephone TEXT,orderShipMobile TEXT, orderShipFax TEXT, orderDelInstr1 TEXT, orderGiftWrap INTEGER DEFAULT 0,orderGiftWrapMessage TEXT, appCartID INTEGER)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS orderDetail(orderDetailID INTEGER PRIMARY KEY, custID INTEGER, accountNumber TEXT, cartID INTEGER, prodID INTEGER, prodTitle TEXT, prodDesc TEXT, prodPrice REAL, prodCode TEXT, VATRate REAL, quantity INTEGER, shipped TEXT, rowTotal REAL, rowTotalWithVAT REAL)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS relatedproducts(relatedID INTEGER PRIMARY KEY, prodID INTEGER, relatedIsAccessory TEXT, relatedProdID INTEGER)');

         $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS syncLog(ID INTEGER PRIMARY KEY AUTOINCREMENT, apiName TEXT, insertedDate TEXT, insertedLog TEXT, acType INTEGER, acId INTEGER)');

         $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS searchText(ID INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT not null)');

		   if (typeof menuList == "undefined") 
		   	var menuList = [];
			$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM categories')
			  .then(
				function(result) {
					if (result.rows.length > 0) {
					  
					   for (var i = 0 ; i < result.rows.length;i++)
					   {
						   menuList.push(result.rows.item(i));
					   }
		                $rootScope.categoryList =  angular.copy(menuList);
						$rootScope.prepareMenu(menuList);
					}
					else
					{
						menuList  = [];
					}
				},
				function(error) {
					$ionicLoading.hide();
					$rootScope.popup = $ionicPopup.alert({
						title: 'Error',
							template: 'Somthing went wrong'
						});
					console.log("Error on loading: " + error.message);
				});
		   
        $rootScope.$emit('updateBasket');

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
            if(toState.url == '/basket' && fromState.url != '/basket' ){
                $ionicLoading.show();
                $rootScope.$emit('updateBasket');
            }
        })
        if ($cordovaNetwork.isOnline() && $rootScope.tokenExpireDate == null) {
            $rootScope.getToken();
        }


		$rootScope.UUID = $cordovaDevice.getUUID();
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        //console.log("hide splash");
      $cordovaSplashscreen.hide();  
    });
    
   
    
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.backButton.previousTitleText(false).text('');
    $ionicConfigProvider.views.transition('ios');
    $ionicConfigProvider.tabs.position("bottom");
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.scrolling.jsScrolling(true);

    
    var mainPage = "/app/tab/accounts";
    if (window.localStorage.getItem("syncDate") == null || window.localStorage.getItem("syncDate") == "undefined") {
        mainPage = "/sync";
    } else if (window.localStorage.getItem("mUser") == null || window.localStorage.getItem("mUser") == "undefined"){
         mainPage = "/login";
    } else if (window.localStorage.getItem("AccountSyncDate") == null || window.localStorage.getItem("AccountSyncDate") == "undefined"){
    	mainPage = "/syncuserdata";
    }
    
    
    $urlRouterProvider.otherwise(mainPage);
    
    $stateProvider
        .state('sync', {
            url: '/sync',
            templateUrl: 'templates/sync.html',
            controller: 'syncCtrl'
        })
       .state('syncuserdata', {
            url: '/syncuserdata',
            templateUrl: 'templates/syncuserdata.html',
            controller: 'syncUserCtrl'
        })    
    .state('login', {
            url: '/login',
            cache: false, 
            templateUrl: 'templates/login.html',
            controller: 'loginCtrl'
        })
    
    .state('accounts', {
            url: '/accounts',
            templateUrl: 'templates/accounts.html',
            controller: 'accountsCtrl'
        })

    .state('app', {
        url: '/app',
        abstract: true,
        cache: false,
        templateUrl: 'templates/home.html',
        controller:'appCtrl'
    })

    .state('app.tab', {
        url: '/tab',
        abstract: true,
        views: {
            'appContent': {
                templateUrl: 'templates/tabs.html',
                controller: 'tabCtrl'
            }
        }
    })



    // Each tab has its own nav history stack:

    .state('app.tab.basket', {
        url: '/basket',
        views: {
            'tab-basket': {
                templateUrl: 'templates/basket.html',
                controller:'basketCtrl'
            }
        }
    })
    
    .state('app.tab.checkout', {
        url: '/checkout',
        views: {
            'tab-basket': {
                templateUrl: 'templates/checkout.html',
                controller:'checkoutCtrl'
            }
        }
    })

    .state('app.tab.search', {
        url: '/search',
        views: {
            'tab-search': {
                templateUrl: 'templates/searchproduct.html',
                controller:'searchproCtrl'
            }
        }
    })

   .state('app.tab.version', {
        url: '/version',
        views: {
            'tab-version': {
                templateUrl: 'templates/version.html'
            }
        }
    })
     .state('app.tab.productlist', {
        url: '/productlist/:Id',
        views: {
            'tab-search': {
                templateUrl: 'templates/productlist.html',
                controller: 'productlistCtrl'
            }
        }
    })

    .state('app.tab.product', {
        url: '/product/:Id',
        views: {
            'tab-search': {
                templateUrl: 'templates/product.html',
                controller: 'productCtrl'
            }
        }
    })
    

    .state('app.tab.myaccount', {
        url: '/myaccount',
        views: {
            'tab-myaccount': {
                templateUrl: 'templates/myaccount.html',
                controller: 'myaccountCtrl'
            }
        }
    })
    
    
    .state('app.tab.detail', {
        url: '/detail',
        views: {
            'tab-myaccount': {
                templateUrl: 'templates/accountdetail.html',
                controller: 'accountdetailCtrl'
            }
        }
    })
    
   
    
    .state('app.tab.invoice', {
        url: '/invoice',
        views: {
            'tab-myaccount': {
                templateUrl: 'templates/accountdetail.html',
                controller: 'accountdetailCtrl'
            }
        }
    })
    
    .state('app.tab.delivery', {
        url: '/delivery',
        views: {
            'tab-myaccount': {
                templateUrl: 'templates/accountdetail.html',
                controller: 'accountdetailCtrl'
            }
        }
    })
    

    .state('app.tab.orderlist', {
        url: '/orderlist',
        views: {
            'tab-myaccount': {
                templateUrl: 'templates/orderlist.html',
                controller: 'orderlistCtrl'
            }
        }
    })
    
     .state('app.tab.dateorder', {
        url: '/orderlist/:Date',
        views: {
            'tab-myaccount': {
                templateUrl: 'templates/dateorder.html',
                controller: 'dateorderCtrl'
            }
        }
    })

   

    .state('app.tab.accounts', {
        url: '/accounts',
        views: {
            'tab-accounts': {
                templateUrl: 'templates/accounts.html',
                controller: 'accountsCtrl'
            }
        }
    });
    
});


App.filter('range', function() {
  return function(input, min, max) {
    min = parseInt(min);
    max = parseInt(max);
    for (var i=min; i<=max; i++)
      input.push(i);
    return input;
  };
});


App.filter('filterbymonth', function() {
  return function(items,lastmonth) {
     
	  if (lastmonth == 'all')
	  {
		  return items;
	  }else
	  {
        var filtered = [];
		var cDate = new Date();
		var cmonth = cDate.getMonth();
		var pastmonth = cmonth - lastmonth;
		var pDate = cDate.setMonth(pastmonth);
	
		angular.forEach(items, function(item) {
            console.log(item);
			var jsdate = new Date(item.orderHistoryDate).getTime();
		  if(jsdate > pDate) {
			filtered.push(item);
		  }
		});
		return filtered;
	  }
  };
});


App.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      $timeout(function() {
        element[0].focus(); 
      }, 150);
    }
  };
});