// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js


var bcrypt = dcodeIO.bcrypt;
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("B4c0/\/", salt);

App = angular.module('starter', ['ionic', 'starter.controllers','ngCordova'])



//var remoteDB = new PouchDB("http://serverip:5984/todos");

App.run(function ($ionicPlatform,$rootScope,$cordovaDevice,$cordovaSQLite) {
	
	
	
	
	
    console.log($cordovaSQLite); 
    
    $rootScope.syncObj = [{title:'Contacts',sync:false},{title:'Accounts',sync:false},{title:'Products',sync:false},{title:'Categories',sync:false},{title:'Orderhistory',sync:false}]; 
    
    
    if (window.localStorage.getItem("mUser") != "undefined") {
        $rootScope.mUser = JSON.parse(window.localStorage.getItem("mUser"));
    }
    if (window.localStorage.getItem("mAccount") != "undefined") {
        $rootScope.mAccount = JSON.parse(window.localStorage.getItem("mAccount"));
    }

    $rootScope.contactData = [];
    $rootScope.accountData = [];
    
    
    $ionicPlatform.ready(function () {
			console.log("this is ready");
        
        
		 $rootScope.DB = $cordovaSQLite.openDB("mfc.db");
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS contacts (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, UserName TEXT, Password TEXT, CustType TEXT, CustRepTerritory TEXT, SaltUsed TEXT, RelatedAccountNumber TEXT)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE INDEX contacts_idx1 ON contacts(UserName)');

		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS products (ProdID INTEGER PRIMARY KEY AUTOINCREMENT, ProdCode TEXT, ProdParentID TEXT, ProdParentCode TEXT, ProdTitle TEXT, ProdDesc TEXT, ProdStockQty TEXT, prodHidePrice TEXT, PriceExVat TEXT, PriceIncVat TEXT, OnSale TEXT, SalePriceExVat TEXT, SalePriceIncVat TEXT, CostPrice TEXT, ProdUnitPrice TEXT, ProductCategory INTEGER, Image TEXT, relatedProductIDs TEXT)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE INDEX products_idx1 ON products(ProductCategory,ProdTitle)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS categories (catID INTEGER PRIMARY KEY AUTOINCREMENT, catParentID INTEGER, catTitle TEXT, CatOrder INTEGER)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS accounts (AccountId INTEGER PRIMARY KEY AUTOINCREMENT, AccountNumber TEXT, AccountCompany TEXT, AccountTerritory TEXT, Title TEXT, FirstName TEXT, Surname TEXT, Telephone TEXT, Mobile TEXT, EmailAddress TEXT, BillingHouseName TEXT, BillingAddressLine1 TEXT, BillingAddressLine2 TEXT, BillingTown TEXT, BillingCounty TEXT, BillingPostcode TEXT, BillingCountry TEXT, DeliveryRefrenceName TEXT, DeliveryTitle TEXT, DeliveryFirstName TEXT, DeliverySurname TEXT, DeliveryHouseName TEXT, DeliveryAddressLine1 TEXT, DeliveryAddressLine2 TEXT, DeliveryTown TEXT, DeliveryCounty TEXT, DeliveryPostcode TEXT, DeliveryCountry TEXT)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE INDEX accounts_idx1 ON accounts(AccountCompany,AccountNumber)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS order_history (OrderHistoryID INTEGER PRIMARY KEY AUTOINCREMENT, costPrice TEXT, operaCostPrice TEXT, unitCost TEXT, accountNumber TEXT, orderHistoryTitle TEXT, prodID INTEGER, prodTitle TEXT, prodPrice TEXT, orderHistoryDate TEXT, prodHidePrice TEXT, prodStockQty TEXT, parentTitle TEXT)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE INDEX order_history_idx1 ON order_history(prodID,AccountNumber)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS basket (basketID INTEGER PRIMARY KEY AUTOINCREMENT, ProdID INTEGER, ProdTitle TEXT, ProdUnitPrice TEXT, qnt INTEGER )');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE UNIQUE INDEX IF NOT EXISTS ProdIDIndex ON basket (ProdID)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS cart(CartID INTEGER PRIMARY KEY AUTOINCREMENT, custID INTEGER, accountNumber TEXT, orderDate TEXT, orderTotal TEXT, orderDeliveryTotal TEXT, orderShipSameAsBilling INTEGER DEFAULT 0, orderShipCompany TEXT, orderShipTitle TEXT, orderShipFirstname TEXT, orderShipSurname TEXT, orderShipHouseNameNo TEXT, orderShipAddress1 TEXT, orderShipAddress2 TEXT, orderShipCity TEXT, orderShipCounty TEXT, orderShipPostcode TEXT, orderShipTelephone TEXT,orderShipMobile TEXT, orderShipFax TEXT, orderDelInstr1 TEXT, orderGiftWrap INTEGER DEFAULT 0,orderGiftWrapMessage TEXT)');
		 
		 $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS orderDetail(orderDetailID INTEGER PRIMARY KEY, custID INTEGER, accountNumber TEXT, cartID INTEGER, prodID INTEGER, prodTitle TEXT, prodDesc TEXT, prodPrice TEXT, prodCode TEXT, VATRate TEXT, quantity TEXT, shipped TEXT, rowTotal TEXT, rowTotalWithVAT TEXT)');

		 console.log("this is menuCtrl");
		   if (typeof menuList == "undefined") 
		   var menuList = [];
			$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM categories')
			  .then(
				function(result) {
					console.log(result);
					console.log(result.rows.length);
					if (result.rows.length > 0) {
					  
					   for (var i = 0 ; i < result.rows.length;i++)
					   {
						   menuList.push(result.rows.item(i));
					   }
						console.log(menuList);
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
        
    });
    
   
    
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.backButton.previousTitleText(false).text('');
    $ionicConfigProvider.views.transition('ios');
    $ionicConfigProvider.tabs.position("bottom");
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.scrolling.jsScrolling(true);

    
    var mainPage = "/app/tab/accounts";
    if (window.localStorage.getItem("mUser") == null || window.localStorage.getItem("mUser") == "undefined") {
        mainPage = "/sync";
    }
    
    $urlRouterProvider.otherwise(mainPage);
    
    $stateProvider
        .state('sync', {
            url: '/sync',
            templateUrl: 'templates/sync.html',
            controller: 'syncCtrl'
        })
    
    .state('login', {
            url: '/login',
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
        url: '/myaccount/orderlist',
         cache: false,
        views: {
            'tab-myaccount': {
                templateUrl: 'templates/orderlist.html',
                controller: 'orderlistCtrl'
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




