angular.module('starter.controllers', [])




.controller('menuCtrl', function ($scope, $rootScope, $ionicScrollDelegate, $ionicLoading, $http, $filter, $ionicHistory, $cordovaSQLite, $document, $cordovaNetwork, $ionicPopup,$state, $cordovaToast) {

    scope = $scope;
    scroll = $ionicScrollDelegate;
    http = $http;
    filter = $filter;
    state = $state;
    ionicLoading = $ionicLoading;
    cordovaSQLite = $cordovaSQLite;

    $ionicScrollDelegate.resize();
    $scope.openChild = false;
    $scope.openSub = false;
    $rootScope.openMenu = false;
    $scope.bgclass;
    $scope.subtitle;
    $scope.childtitle;
    $rootScope.basketBadge = 0;
    $rootScope.syncButton = false;
    $rootScope.lastsyncDate;

    $rootScope.menuColor = ['farm', 'horse', 'dog', 'hygin'];

    $scope.showMenu = function () {
        $rootScope.openMenu = true;
    }

    $scope.hideMenu = function () {
        $rootScope.openMenu = false;
    }

    $scope.showCat = function (category) {
        $rootScope.openMenu = false;
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
    }

    $scope.checkMenu = function (category, mainCat) {
        if (mainCat && category.isOpen == false) {
            $scope.menuList[0].isOpen = false;
            $scope.menuList[1].isOpen = false;
            $scope.menuList[2].isOpen = false;
            $scope.menuList[3].isOpen = false;
            category.isOpen = true;
        } else {
            category.isOpen = true;
        }
    }



    $scope.calcPrice = function () {
        var price;
        $rootScope.totalPrice = 0;
        $rootScope.totalVat = 0;
       
        angular.forEach($rootScope.priceData, function (el, index) {
            price = el.qty * el.uprice;
			vat = el.qty * (el.uprice +((el.vat * el.uprice)/100));
            
            if (el.tbc)
                {
                    price = 0;
                    vat = 0;
                }
			$rootScope.totalPrice = $rootScope.totalPrice + price;
			//(priceData[$index].qty * (priceData[$index].uprice + ((priceData[$index].vat * priceData[$index].uprice)/100)))
            $rootScope.totalVat = $rootScope.totalVat + (vat - price);
        });
        
    }
    
    
    $scope.gotoSearch = function(){
        $state.go('app.tab.search', {
            location: 'replace'
        });
    }

    
     $scope.syncError= function(error)
     {
          $ionicLoading.hide();
          $rootScope.syncButton = false;
          $rootScope.popup = $ionicPopup.alert({
            title: '<h4 class="positive">Data syncing failed</h4>',
            template: 'data synicing failed, please check you internet connection and try again'
         });
          angular.forEach($rootScope.syncObj,function(el,index){
                el.sync = false;
            });
         
     }
    
	  $rootScope.loadOrders = function () {
        $cordovaToast.showLongBottom('Order Syncing Start');
		tempOrderdetails = [];
		tempCartdetails = [];
		tempCntr = 0;
		$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM orderDetail')
			.then(function (result) {
				if (result.rows.length)
				{
					for(var i = 0; i < result.rows.length; i ++)
					{
						var Result = result.rows.item(i);
						tempOrderdetails.push(Result);
					}
					$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM cart').then(function (result) {
					if (result.rows.length)
					{
						for(var i = 0; i < result.rows.length; i ++)
						{
							var Result = result.rows.item(i);
							tempCartdetails.push(Result);
						}
						angular.forEach(tempCartdetails,function(el,index){
							var orderRecords = $filter('filter')(tempOrderdetails, {'cartID': el.CartID}, true);
							el.orderDetail = [];
							el.orderDetail = orderRecords;
							$http.post("http://mfcapi.radiatordedicated.co.uk/api/Order",el).then(function(result){
									tempCntr++;
									if(result.data)
									{
										if (tempCartdetails.length == tempCntr)
										{
											//code for place orderd done on live
											$cordovaToast.showLongBottom('Order Syncing Done');
										}
										$cordovaSQLite.execute($rootScope.DB, 'DELETE FROM cart WHERE cartID='+el.CartID).then(function (result) {
										}, function (err) {
											console.log("Error on deleting: " + err.message);
										});
										
										$cordovaSQLite.execute($rootScope.DB, 'DELETE FROM orderDetail WHERE cartID='+el.CartID).then(function (result) {
										}, function (err) {
											console.log("Error on deleting: " + err.message);
										});
									}
								},
							function (error) {
							  $scope.syncError(error);
							});
						})
					}else
					{
						//$rootScope.syncObj[0].sync = 'done';
						//$scope.loadContacts();
					}
					
					});
				}
				
				else
				{
					//$rootScope.syncObj[0].sync = 'done';
					//$scope.loadContacts();
				}
			})
	}
	
	 
	 
	 
    $scope.loadContacts = function () {
        
        $rootScope.syncObj[0].sync = true;
        $http.get('http://mfcapi.radiatordedicated.co.uk/api/Contact').then(function (contacts) {
                $scope.contactList = contacts.data;
				var i, j, temparray, chunk = 100;
                for (i = 0, j = $scope.contactList.length; i < j; i += chunk) {
                    temparray = $scope.contactList.slice(i, i + chunk);
                    var query = "INSERT OR REPLACE INTO contacts (Id, Name, UserName, Password, CustType, CustRepTerritory, SaltUsed, RelatedAccountNumber) VALUES ";
                    var data = [];
                    var rowArgs = [];
                    angular.forEach(temparray, function (el, index) {
                        rowArgs.push("(?,?,?,?,?,?,?,?)");
                        data.push(el.Id);
                        data.push(el.Name);
                        data.push(el.UserName);
                        data.push(el.Password);
                        data.push(el.CustType);
                        data.push(el.CustRepTerritory);
                        data.push(el.SaltUsed);
                        data.push(el.RelatedAccountNumber);
                    });
                    query += rowArgs.join(", ");
                    $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {
                    }, function (err) {
                        console.log("Error on saving: " + err.message);
                    });
                }
                $rootScope.syncObj[0].sync = 'done';
                $scope.loadAccounts();


            },
            function (error) {
              $scope.syncError(error);
            })

    }


    $scope.loadAccounts = function () {
        $rootScope.syncObj[1].sync = true;
        $http.get('http://mfcapi.radiatordedicated.co.uk/api/Accounts').then(function (accounts) {
                $scope.accountList = accounts.data;

                var i, j, temparray, chunk = 25;
                for (i = 0, j = $scope.accountList.length; i < j; i += chunk) {
                    temparray = $scope.accountList.slice(i, i + chunk);
                    var query = "INSERT OR REPLACE INTO accounts (AccountId, AccountNumber, AccountCompany, AccountTerritory, Title, FirstName, Surname, Telephone, Mobile, EmailAddress, BillingHouseName, BillingAddressLine1, BillingAddressLine2, BillingTown, BillingCounty, BillingPostcode, BillingCountry, DeliveryRefrenceName, DeliveryTitle, DeliveryFirstName, DeliverySurname, DeliveryHouseName, DeliveryAddressLine1, DeliveryAddressLine2, DeliveryTown, DeliveryCounty, DeliveryPostcode, DeliveryCountry) VALUES ";
                    var data = [];
                    var rowArgs = [];
                    angular.forEach(temparray, function (el, index) {
                        rowArgs.push("(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
                        data.push(el.AccountId);
                        data.push(el.AccountNumber);
                        data.push(el.AccountCompany);
                        data.push(el.AccountTerritory);
                        data.push(el.Title);
                        data.push(el.FirstName);
                        data.push(el.Surname);
                        data.push(el.Telephone);
                        data.push(el.Mobile);
                        data.push(el.EmailAddress);
                        data.push(el.BillingHouseName);
                        data.push(el.BillingAddressLine1);
                        data.push(el.BillingAddressLine2);
                        data.push(el.BillingTown);
                        data.push(el.BillingCounty);
                        data.push(el.BillingPostcode);
                        data.push(el.BillingCountry);
                        data.push(el.DeliveryRefrenceName);
                        data.push(el.DeliveryTitle);
                        data.push(el.DeliveryFirstName);
                        data.push(el.DeliverySurname);
                        data.push(el.DeliveryHouseName);
                        data.push(el.DeliveryAddressLine1);
                        data.push(el.DeliveryAddressLine2);
                        data.push(el.DeliveryTown);
                        data.push(el.DeliveryCounty);
                        data.push(el.DeliveryPostcode);
                        data.push(el.DeliveryCountry);
                    });
                    query += rowArgs.join(", ");
                    $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {
                        
                    }, function (err) {
                        console.log("Error on saving: " + err.message);
                    });
                }
                $rootScope.syncObj[1].sync = 'done';
                $scope.loadProducts();

            },
            function (error) {
              $scope.syncError(error);
            });
    }



    $scope.loadProducts = function () {
        $rootScope.syncObj[2].sync = true;
        $http.get('http://mfcapi.radiatordedicated.co.uk/api/Product').then(function (products) {
                $scope.productList = products.data;

                var i, j, temparray, chunk = 50;
                for (i = 0, j = $scope.productList.length; i < j; i += chunk) {
                    temparray = $scope.productList.slice(i, i + chunk);
                    var query = "INSERT OR REPLACE INTO products (ProdID, ProdCode, ProdParentID, ProdParentCode, ProdTitle, ProdDesc , ProdStockQty, prodHidePrice, PriceExVat, PriceIncVat, OnSale, SalePriceExVat, SalePriceIncVat, CostPrice, ProdUnitPrice, ProductCategory, Image , relatedProductIDs) VALUES ";
                    var data = [];
                    var rowArgs = [];
                    angular.forEach(temparray, function (el, index) {
                        rowArgs.push("(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
                        data.push(el.ProdID);
                        data.push(el.ProdCode);
                        data.push(el.ProdParentID);
                        data.push(el.ProdParentCode);
                        data.push(el.ProdTitle);
                        data.push(el.ProdDesc);
                        data.push(el.ProdStockQty);
                        data.push(el.prodHidePrice);
                        data.push(el.PriceExVat);
                        data.push(el.PriceIncVat);
                        data.push(el.OnSale);
                        data.push(el.SalePriceExVat);
                        data.push(el.SalePriceIncVat);
                        data.push(el.CostPrice);
                        data.push(el.ProdUnitPrice);
                        data.push(el.ProductCategory);
                        data.push(el.Image);
                        data.push(el.relatedProductIDs);
                    });

                    query += rowArgs.join(", ");
                    $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {
                    }, function (err) {
                        console.log("Error on saving: " + err.message);
                    });
                }
                $rootScope.syncObj[2].sync = 'done';
                $scope.loadCategory();


            },
            function (error) {
                $scope.syncError(error);
            });
    }




    $scope.loadCategory = function () {

        $rootScope.syncObj[3].sync = true;

        $http.get('http://mfcapi.radiatordedicated.co.uk/api/Categories').then(function (categories) {
               
                var subMenu = categories.data;
                $rootScope.categoryList = angular.copy(subMenu);

                var i, j, temparray, chunk = 100;
                for (i = 0, j = subMenu.length; i < j; i += chunk) {
                    temparray = subMenu.slice(i, i + chunk);
                    var query = "INSERT OR REPLACE INTO categories (catID, catParentID, catTitle, CatOrder) VALUES ";
                    var data = [];
                    var rowArgs = [];
                    angular.forEach(temparray, function (el, index) {
                        rowArgs.push("(?,?,?,?)");
                        data.push(el.catID);
                        data.push(el.catParentID);
                        data.push(el.catTitle);
                        data.push(el.CatOrder);
                    });
                    query += rowArgs.join(", ");
                    $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {
                    }, function (err) {
                        console.log("Error on saving: " + err.message);
                    });
                }
                $scope.prepareMenu(subMenu);
                $rootScope.syncObj[3].sync = 'done';

                $scope.loadRelatedproducts()

            },
            function (error) {
               $scope.syncError(error);
            });


    }
	
	$scope.loadRelatedproducts = function () {

		$cordovaSQLite.execute($rootScope.DB, 'DROP TABLE relatedproducts');
		
		$cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS relatedproducts(prodID INTEGER, relatedID INTEGER, relatedIsAccessory TEXT, relatedProdID INTEGER)');
		
        $rootScope.syncObj[4].sync = true;
        var cnt = 0;
        $http.get('http://mfcapi.radiatordedicated.co.uk/api/relatedproducts').then(function (relatedproducts) {
                $scope.relatedproducts = relatedproducts.data;

                var i, j, temparray, chunk = 100;
                for (i = 0, j = $scope.relatedproducts.length; i < j; i += chunk) {
                    temparray = $scope.relatedproducts.slice(i, i + chunk);
                    var query = "INSERT OR REPLACE INTO relatedproducts(prodID, relatedID, relatedIsAccessory, relatedProdID) VALUES ";
                    var data = [];
                    var rowArgs = [];
                    angular.forEach(temparray, function (el, index) {
                        rowArgs.push("(?,?,?,?)");
                        data.push(el.prodID);
                        data.push(el.relatedID);
                        data.push(el.relatedIsAccessory);
                        data.push(el.relatedProdID);
                    });
                    query += rowArgs.join(", ");
                    $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {
						
                    }, function (err) {
                        console.log("Error on saving: " + err.message);
                    });
                }
				$scope.loadOrderhistory();
				$rootScope.syncObj[4].sync = 'done';
				$ionicLoading.hide();

            },
            function (error) { 
                $scope.syncError(error);
            });
    }
	
	
    $scope.loadOrderhistory = function () {
        $rootScope.syncObj[5].sync = true;
        var cnt = 0;
        $http.get('http://mfcapi.radiatordedicated.co.uk/api/OrderHistory').then(function (orderHistory) {
                $scope.orderHistory = orderHistory.data;
                
                var i, j, temparray, chunk = 50;
                for (i = 0, j = $scope.orderHistory.length; i < j; i += chunk) {
                    temparray = $scope.orderHistory.slice(i, i + chunk);
                    var query = "INSERT OR REPLACE INTO order_history (OrderHistoryID, costPrice, operaCostPrice, unitCost, accountNumber, orderHistoryTitle, prodID, prodTitle, prodPrice, orderHistoryDate, prodHidePrice, prodStockQty, parentTitle, quantity) VALUES ";
                    var data = [];
                    var rowArgs = [];
                    angular.forEach(temparray, function (el, index) {
                        rowArgs.push("(?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
                        data.push(el.OrderHistoryID);
                        data.push(el.costPrice);
                        data.push(el.operaCostPrice);
                        data.push(el.unitCost);
                        data.push(el.accountNumber);
                        data.push(el.orderHistoryTitle);
                        data.push(el.prodID);
                        data.push(el.prodTitle);
                        data.push(el.prodPrice);
                        data.push(el.orderHistoryDate);
                        data.push(el.prodHidePrice);
                        data.push(el.prodStockQty);
                        data.push(el.parentTitle);
                        data.push(el.quantity);
                    });
                    query += rowArgs.join(", ");
                    $nCnt = 0;
                    $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {
						$nCnt = $nCnt + chunk;
						if($nCnt > $scope.orderHistory.length)
						{
							$rootScope.syncObj[5].sync = 'done';
							$ionicLoading.hide();
                            $rootScope.lastsyncDate = new Date().getTime();
                            window.localStorage.setItem("syncDate", $rootScope.lastsyncDate);
						}
                    }, function (err) {
                        console.log("Error on saving: " + err.message);
                    });
                }

            },
            function (error) { 
                $scope.syncError(error);
            });
    }

    $rootScope.prepareMenu = function (menuList) {
        for (var i = menuList.length - 1; i >= 0; i--) {
            var menuitem = menuList[i];
            var parentId = menuitem.catParentID;
            if (parentId == 0) {
                menuitem.color = $rootScope.menuColor[i];
            }
            if (typeof parentId != 'undefined' && parentId != 0) {
                var temp = $filter('filter')(menuList, {
                    'catID': parentId
                }, true);
                if (temp.length) {
                    if (!temp[0].sub) {
                        temp[0].sub = [];
                        temp[0].isOpen = false;
                    }
                    temp[0].sub.push(menuitem);
                } else {
                    console.log(parentId + ": category not available")
                }
                menuList.splice(i, 1);
            }
        }
        $scope.menuList = menuList;
    }
    $rootScope.$on('updateBasket', function (event) {
        $rootScope.basketList = [];
        $rootScope.priceData = []
        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM basket')
            .then(
                function (result) {
                    for (var i = 0; i < result.rows.length; i++) {
                        $rootScope.basketList.push(result.rows.item(i));
                        $rootScope.priceData[i] = {};
                        $rootScope.priceData[i].qty = $rootScope.basketList[i].qnt;
                        $rootScope.priceData[i].uprice = $rootScope.basketList[i].PriceExVat;
                        $rootScope.priceData[i].vat = $rootScope.basketList[i].Vat;
                        $rootScope.priceData[i].tbc = $rootScope.basketList[i].isTBC;
                    }
                    $scope.calcPrice();
                    $ionicLoading.hide();
                    $rootScope.basketBadge = $rootScope.basketList.length;
                });
    });
    $scope.$on('syncStart', function (event, args) {
        $scope.innerSync = args.innerSync;
        if ($scope.innerSync)
        {
            ionicLoading.show({
                templateUrl: 'templates/syncpopup.html'
            });
        }        
        if ($cordovaNetwork.isOnline()) {

            if ($cordovaNetwork.getNetwork() != "wifi") {
                $rootScope.popup = $ionicPopup.show({
                    title: '<h4 class="positive">No Wifi Network</h4>',
                    template: 'You are on Mobile Data Switch to Wifi or Mobile Data may casue additional charges.',
                    cssClass: 'internetError',
                    buttons: [
                        {
                            text: 'Cancel'
                    },
                        {
                            text: 'Continue',
                            type: 'button-positive',
                            onTap: function (e) {
                                //$scope.loadOrders();
                                $scope.loadContacts();
                            }
                      }
                    ]
                });
            } else {
                //$scope.loadOrders();
                $scope.loadContacts();
            }
        } else {
            $rootScope.popup = $ionicPopup.alert({
                title: '<h4 class="positive">No Internet Connection</h4>',
                template: 'Sorry, no Internet Connectivity detected. Please reconnect and try again.'
            });
        }
    });

    $scope.syncData = function () {
        $scope.$emit('syncStart', {
            innerSync: true
        });
    }
})

.controller('syncCtrl', function ($scope, $state, $rootScope) {
    root = $rootScope;
    scope = $scope;

    $scope.handleClick = function () {
        $scope.$emit('syncStart', {
            innerSync: false
        });
    };

    $scope.gotoLogin = function () {
        $state.go('login', {
            location: false
        });
    }

})


.controller('loginCtrl', function ($scope, $state, $rootScope, $ionicPopup, $ionicLoading, $filter, $cordovaSQLite,$cordovaKeyboard,$ionicHistory) {


    root = $rootScope;
    scope = $scope;
    //$scope.email = 'stephen@the-radiator.com';
    /*$scope.email = 'michaeldownie19@gmail.com';
    $scope.password = 'radiator';*/
    $scope.email = '';
    $scope.password = '';
    $rootScope.syncButton = false;
    
    $scope.openLink = function (weblink) {
        console.log(weblink);
        window.open(weblink, '_system');
        return false;
    }

    $scope.doLogin = function (form) {
        
        if (!form.$valid) {
            return false;
        }

        $ionicLoading.show({
            template: '<img src="img/loader.gif">'
        });

        var Email = form.email.$modelValue.toLowerCase();
        var Password = form.password.$modelValue;


        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM contacts WHERE UserName = "' + Email + '"')
            .then(
                function (result) {
                    if (result.rows.length > 0) {
                        var User = result.rows.item(0);
                        var hash = bcrypt.hashSync(Password, User.SaltUsed);
                        if (hash == User.Password) {
                            
                            $ionicHistory.clearHistory();
                            $ionicHistory.clearCache();
                            $rootScope.mUser = User;
                            window.localStorage.setItem("mUser", JSON.stringify($rootScope.mUser));
                            $ionicLoading.hide();
                            window.localStorage.removeItem("mAccount");
                            $rootScope.mAccount = "";
                            $cordovaKeyboard.close();
                            $state.go('accounts', {
                                location: false
                            });

                        } else {
                            $ionicLoading.hide();
                            
				            /*$ionicHistory.clearHistory();
                            $ionicHistory.clearCache();
				            $rootScope.mUser = User;
                            window.localStorage.setItem("mUser", JSON.stringify($rootScope.mUser));
                            $ionicLoading.hide();
                            $cordovaKeyboard.close();
                            $state.go('accounts', {
                                location: false
                            });*/
							
                            $rootScope.popup = $ionicPopup.alert({
                                title: 'Wrong Password',
                                template: 'Please enter correct password'
                            });
                        }
                    } else {
                        $ionicLoading.hide();
                        $rootScope.popup = $ionicPopup.alert({
                            title: 'Error',
                            template: 'This email not in our record'
                        });
                    }
                },
                function (error) {
                    $ionicLoading.hide();
                    $rootScope.popup = $ionicPopup.alert({
                        title: 'Error',
                        template: 'Somthing went wrong'
                    });
                    console.log("Error on loading: " + error.message);
                });
    }
})


.controller('appCtrl', function ($scope, $state) {

})

.controller('tabCtrl', function ($scope, $rootScope) {
    scope = $scope;
    root = $rootScope;

})

.controller('basketCtrl', function ($scope, $rootScope, $ionicLoading, $cordovaSQLite, $filter, $ionicPopup, $state) {
    scope = $scope;
    root = $rootScope;
	$scope.canChangePrice = true;
	$scope.canChangePrice = $scope.mUser.CustType == 1 || $scope.mUser.CustType == 2 || $scope.mUser.CustType == 3 ? false : true;
	
    $ionicLoading.show({
        template: '<img src="img/loader.gif">'
    });
    $rootScope.$emit('updateBasket');

    $scope.deleteProduct = function (Id) {

        $rootScope.popup = $ionicPopup.show({
            title: 'Remove Item',
            template: 'Do you want to remove this item ?',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: 'Remove',
                    type: 'button-positive',
                    onTap: function (e) {
                        $cordovaSQLite.execute($rootScope.DB, 'DELETE FROM basket WHERE basketID = ' + Id)
                            .then(
                                function (result) {
                                    var rProduct = $filter('filter')($rootScope.basketList, {
                                        'basketID': Id
                                    }, true);
                                    var productIndex = $rootScope.basketList.indexOf(rProduct[0]);
                                    $rootScope.basketList.splice(productIndex, 1);
                                    $rootScope.$emit('updateBasket');
                                });
                    }
                  }
                ]
        });
    }
	
	$scope.UpdateProductTbc = function(ID,istbc){
		var TBC = (istbc == true)? 1 : 0 ;
		$cordovaSQLite.execute($rootScope.DB, 'UPDATE basket SET isTBC = '+TBC+' WHERE basketID = ' + ID)
            .then(
                function (result) {
                    $scope.calcPrice();
                });
	}

    $scope.checkout = function () {
        $state.go('app.tab.checkout');

    }


    $scope.updateQty = function (proId, qty) {
        $scope.calcPrice();
		var Qty = qty || 0;
		$cordovaSQLite.execute($rootScope.DB, 'UPDATE basket SET qnt = '+Qty+' WHERE basketID = '+proId)
		.then(function (result) {
		}, function (error) {
			console.log("Error on saving: " + error.message);
		})
    }

    $scope.updatePrice = function (proId, price) {
        $scope.calcPrice();
		var Uprice = price || 0 ;
		$cordovaSQLite.execute($rootScope.DB, 'UPDATE basket SET PriceExVat = "'+price+'" WHERE basketID = '+proId)
		.then(function (result) {
		}, function (error) {
			console.log("Error on saving: " + error.message);
		})
    }

})

.controller('checkoutCtrl', function ($scope, $rootScope, $cordovaSQLite, $ionicLoading, $ionicPopup,$state,$ionicHistory) {
    ionicHistory = $ionicHistory;
    scope = $scope;
    root = $rootScope;
	$scope.placeOrder = function()
	{
		var date = new Date()
		var stringDate = filter('date')(date, "yyyy-MM-ddTHH:mm:ss Z");
		
		var DeliveryTitle = $rootScope.mAccount.DeliveryTitle || '' ;
		var FirstName = $rootScope.mAccount.FirstName || '' ;
		var Surname = $rootScope.mAccount.Surname || '' ;
		var DeliveryHouseName = $rootScope.mAccount.DeliveryHouseName || $rootScope.mAccount.BillingHouseName ;
		var DeliveryAddressLine1 = $rootScope.mAccount.DeliveryAddressLine1 || $rootScope.mAccount.BillingAddressLine1 ;
		var DeliveryAddressLine2 = $rootScope.mAccount.DeliveryAddressLine2 || $rootScope.mAccount.BillingAddressLine2 ;
		var DeliveryTown = $rootScope.mAccount.DeliveryTown || $rootScope.mAccount.BillingTown ;
		var DeliveryCountry = $rootScope.mAccount.DeliveryCountry || $rootScope.mAccount.BillingCountry ;
		var DeliveryPostcode = $rootScope.mAccount.DeliveryPostcode || $rootScope.mAccount.BillingPostcode ;
		var Telephone = $rootScope.mAccount.Telephone || '' ;
		var Mobile = $rootScope.mAccount.Mobile || '' ;
		
		var nCount = 0;
		var nInsertedCount = 0;
		
		$cordovaSQLite.execute($rootScope.DB, 'INSERT INTO cart(custID, accountNumber, orderDate, orderTotal, orderDeliveryTotal, orderShipSameAsBilling, orderShipCompany, orderShipTitle, orderShipFirstname, orderShipSurname, orderShipHouseNameNo, orderShipAddress1, orderShipAddress2, orderShipCity, orderShipCounty, orderShipPostcode, orderShipTelephone, orderShipMobile, orderShipFax, orderDelInstr1, orderGiftWrap,orderGiftWrapMessage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [$rootScope.mUser.Id, $rootScope.mAccount.AccountNumber,stringDate, $rootScope.totalPrice, $rootScope.totalPrice, 0, $rootScope.mAccount.AccountCompany, DeliveryTitle, FirstName, Surname, DeliveryHouseName, DeliveryAddressLine1, DeliveryAddressLine2, DeliveryTown, DeliveryCountry, DeliveryPostcode, Telephone, Mobile, '', '', 0, ''])
				.then(function (result) {
					cartID = result.insertId;
					var tempBasket = $rootScope.basketList;
					var tempPrice  = $rootScope.priceData;
					
					angular.forEach(tempBasket, function (el, index) {
						nCount++;
						$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdID = '+el.ProdID).then(function (result) {
							$cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO orderDetail(custID, accountNumber, cartID, prodID, prodTitle, prodDesc, prodPrice, prodCode, VATRate, quantity, shipped, rowTotal, rowTotalWithVAT) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [$rootScope.mUser.Id, $rootScope.mAccount.AccountNumber, cartID, el.ProdID, result.rows.item(0).ProdTitle, result.rows.item(0).prodDesc, tempPrice[index].tbc ? 0 : el.ProdUnitPrice, result.rows.item(0).prodCode, tempPrice[index].tbc ? 0 : tempPrice[index].vat, tempPrice[index].qty, 0, tempPrice[index].tbc ? 0 : tempPrice[index].uprice * tempPrice[index].qty, tempPrice[index].tbc ? 0 : tempPrice[index].qty * (tempPrice[index].uprice + (tempPrice[index].uprice * tempPrice[index].vat/100)) ])
								.then(function (result) {
									nInsertedCount++;
									if(nCount == nInsertedCount)
									{
										if(!$rootScope.isOffline)
										{
											$rootScope.loadOrders();
										}
									}										
								}, function (error) {
									console.log("Error on saving: " + error.message);
								})
								
						})
					})
					
					$cordovaSQLite.execute($rootScope.DB, 'DROP TABLE basket');
					
					$cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS basket ( basketID INTEGER PRIMARY KEY AUTOINCREMENT, ProdID INTEGER, ProdTitle TEXT, ProdUnitPrice REAL, qnt INTEGER, PriceExVat REAL, PriceIncVat REAL, Vat REAL, isTBC INTEGER DEFAULT 0)');
					
					$cordovaSQLite.execute($rootScope.DB, 'CREATE UNIQUE INDEX IF NOT EXISTS ProdIDIndex ON basket (ProdID)');
					
					$rootScope.basketList = [];
					$rootScope.priceData = [];
					$rootScope.basketBadge = 0;
                    $state.go('app.tab.basket', {location: false});
		},
		function (error) {
			$ionicLoading.hide();
			$rootScope.popup = $ionicPopup.alert({
				title: 'Error',
				template: 'Somthing went wrong'
			});
			console.log("Error on loading: " + error.message);
		});
		
		
        
        $rootScope.popup = $ionicPopup.alert({
				title: 'Order placed',
				template: 'Your order has been placed successfully',
                buttons: [
                        {
                            text: 'Ok',
                            type: 'button-positive',
                            onTap: function (e) {
                             $state.go('app.tab.accounts', {
                                    location: false
                              });
                            }
                      }
                    ]
        });
	}
})

.controller('searchproCtrl', function ($scope, $rootScope, $cordovaSQLite, $ionicPopup, $ionicLoading,$cordovaKeyboard) {
    scope = $scope;
    root = $rootScope;
    $scope.productSearch = '';
    $scope.searchproductList;

    $scope.searchProduct = function (searchtext) {
        if (searchtext != '') {
            
        $cordovaKeyboard.close()

            $ionicLoading.show({
                template: '<img src="img/loader.gif">'
            });

            $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdParentID = 0 AND ProdTitle like "%' + searchtext + '%"').then(function (result) {
                    $ionicLoading.hide();
                    $scope.searchproductList = [];
                    if (result.rows.length > 0) {
                        for (var i = 0; i < result.rows.length; i++) {
                            $scope.searchproductList.push(result.rows.item(i));
                        }

                    } else {
                        $scope.searchproductList = [];
                    }
                },
                function (error) {
                    $ionicLoading.hide();
                    $rootScope.popup = $ionicPopup.alert({
                        title: 'Error',
                        template: 'Somthing went wrong'
                    });
                    console.log("Error on loading: " + error.message);
                });


        } else {
            console.log("No");
        }
    }
})

.controller('myaccountCtrl', function ($scope, $rootScope, $state) {

})

.controller('accountdetailCtrl', function ($scope, $rootScope, $state) {
    state = $state;
    scope = $scope;
    $scope.accountPage = $state.current.url.replace("/", "");
})

.controller('accountsCtrl', function ($scope, $rootScope, $ionicLoading,$ionicPopup, $http, $state, $filter, $timeout, $cordovaSQLite,$ionicPlatform,$cordovaKeyboard) {
    scope = $scope;
    root = $rootScope;
    state = $state;
    $scope.count
    $scope.accountSearch = '';
    $scope.accountList;
	$scope.displaySearch = true;
    $scope.pageName = $state.current.name;
    $scope.alpha = "-1"
    
    
	$scope.accountFilter = function(searchtext){
           
			$sWhere = $scope.AccountRoleManagement(searchtext);
			if($sWhere)
			{
				$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM accounts '+$sWhere)
					.then(
						function (result) {
                             $scope.accountList = [];
							$ionicLoading.hide();
							if (result.rows.length > 0) {

								for (var i = 0; i < result.rows.length; i++) {
									$scope.accountList.push(result.rows.item(i));
								}

							} else {
								$scope.accountList = [];
							}
						},
						function (error) {
							$ionicLoading.hide();
							$rootScope.popup = $ionicPopup.alert({
								title: 'Error',
								template: 'Somthing went wrong'
							});
							console.log("Error on loading: " + error.message);
						});
			}
			else
			{
				$ionicLoading.hide();
				$rootScope.popup = $ionicPopup.alert({
					title: 'Error',
					template: 'No Account Specify for you'
				});
			}
	}
	
	$scope.AccountRoleManagement = function(searchtext){
		$sWhere = '';
		//AccountCompany like "%' + searchtext + '%" OR AccountNumber like "%' + searchtext + '%"
		if($rootScope.mUser.CustType == 1 || $rootScope.mUser.CustType == 2)
		{
			if(searchtext.length>0)
			{
				$sWhere += ' WHERE AccountCompany like "%' + searchtext + '%" OR AccountNumber like "%' + searchtext + '%"';
			}
			return $sWhere;
		}
		else if($rootScope.mUser.CustType == 3)
		{
			if($rootScope.mUser.CustRepTerritory == '')
			{
				$sWhere = false;
			}
			else
			{
				if(searchtext.length>0)
				{
					$sWhere += ' WHERE (AccountCompany like "%' + searchtext + '%" OR AccountNumber like "%' + searchtext + '%") AND AccountTerritory = "'+$rootScope.mUser.CustRepTerritory+'" AND AccountTerritory <> "" '; 
				}
				else
				{
					$sWhere += ' WHERE AccountTerritory = "'+$rootScope.mUser.CustRepTerritory+'" AND AccountTerritory <> "" ';
				}
			}
			return $sWhere;
		}
		else if($rootScope.mUser.CustType == 7)
		{
			if($rootScope.mUser.RelatedAccountNumber == "")
			{
				$sWhere = false;
			}
			else
			{
				if(searchtext.length>0)
				{
					$sWhere += ' WHERE (AccountCompany like "%' + searchtext + '%" OR AccountNumber like "%' + searchtext + '%") AND AccountNumber = "'+$rootScope.mUser.RelatedAccountNumber+'"';
				}
				else
				{
					$sWhere += ' WHERE AccountNumber = "'+$rootScope.mUser.RelatedAccountNumber+'"';
				}
			}
			return $sWhere;
		}
	}
	
	$ionicPlatform.ready(function () {
			
		if($rootScope.mUser.CustType == 7){
			$scope.accountFilter('');
			$scope.displaySearch = false;
		}
	})
	
    $scope.search = function (searchtext) {
        if (searchtext != '') {
              $cordovaKeyboard.close();
            $ionicLoading.show({
                template: '<img src="img/loader.gif">'
            });
			
			$scope.accountFilter(searchtext);

        } else {
            console.log("No");
        }
    }
	
    $scope.loadMore = function () {
        /*if (typeof $scope.accountList == 'undefined') {
            $scope.accountList = [];
        }
        var cnt = $scope.accountList.length;
        console.log($scope.accountList);
        console.log(cnt);
        $rootScope.accountdb.query('my_index/acnt_id',{limit: 25,skip:cnt}).then(function (res) {
            $scope.accountList = $scope.accountList.concat(res.rows);
            $ionicLoading.hide();
            $scope.$apply();
             $scope.$broadcast('scroll.infiniteScrollComplete');
        }).catch(function (err) {
          console.log(err);
             $scope.$broadcast('scroll.infiniteScrollComplete');
        });*/
    };
    $scope.selectAccount = function (account) {
        $rootScope.mAccount = account;
        window.localStorage.setItem("mAccount", JSON.stringify($rootScope.mAccount));
        $timeout(function () {
            $state.go('app.tab.myaccount', {
                location: false
            });

        }, 500);
    }
    $scope.checkAlpha = function (char,index) {

        if (char.charAt(0) != $scope.alpha) {
            $scope.alpha = char.charAt(0)[0];
            return $scope.alpha;
        } else {
            return false;
        }
    }
})

.controller('orderlistCtrl', function ($scope, $rootScope, $filter, $ionicLoading, $cordovaSQLite, $ionicPopup,$cordovaKeyboard) {
    scope = $scope;
    $scope.bydate = true;
    $scope.byproduct = false;
    $scope.data = {}
    $rootScope.orderhList = []
    $scope.searchtext = '';
    $scope.searchorderList = [];
    $scope.orderQty = [];
    $scope.dorderQty = [];
    var cnt = 0;
    var isloadData = true;
    /* if ($rootScope.mAccount)
     {
         $rootScope.orderhList = $filter('filter')( $rootScope.orderhistoryData, {accountNumber: $rootScope.mAccount.AccountNumber}, true) || [];
     }*/
    $ionicLoading.show({
        template: '<img src="img/loader.gif">'
    });
    
    
     /* $scope.loadMore = function(){
      if(!isloadData)
        {
            $scope.$broadcast('scroll.infiniteScrollComplete');
            return false;
        }*/
        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM order_history WHERE accountNumber = "' + $rootScope.mAccount.AccountNumber + '"')
        .then(
            function (result) {
                $ionicLoading.hide();
                 $scope.$broadcast('scroll.infiniteScrollComplete');
                if (result.rows.length > 0) {
                    cnt = cnt+30;
                    for (var i = 0; i < result.rows.length; i++) {
                        $rootScope.orderhList.push(result.rows.item(i));
                    }
                } else {
                    //$rootScope.orderhList = [];
                    isloadData =false;
                }
            },
            function (error) {
                $ionicLoading.hide();
                 $scope.$broadcast('scroll.infiniteScrollComplete');
                $rootScope.popup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Somthing went wrong'
                });
                console.log("Error on loading: " + error.message);
            });    
    /*}*/
    
    
    
    
    
    
    //$rootScope.orderhList = Orders;
    $scope.checkDate = function (date, index) {
        var Date = date;
        if (index == 0) {
            $scope.oldDate = ""
        };
        if ($scope.oldDate == Date) {
            return false;
        } else {
            $scope.oldDate = Date;
            return true;
        }
    }

    $scope.makeDate = function (date) {
        return moment(date).format('DD MMM YYYY')
    }
    
    $rootScope.ordertoBasket = function (Id, ptitle,title, price, qty) {
        var Title = (ptitle)?ptitle+' - '+title :title;
        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdID = "' + Id + '"')
		.then(
                function (result) {
                    $ionicLoading.hide();
                    if (result.rows.length > 0) {
						var PriceExVat = result.rows.item(0).PriceExVat;
						var PriceIncVat = result.rows.item(0).PriceIncVat;
                        
                        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM basket WHERE ProdID = "' + Id + '"').then(function (result) {
                            $ionicLoading.hide();
                            if (result.rows.length > 0) {
                                qty = qty + result.rows.item(0).qnt;
							}
                            vat = (100 * (PriceIncVat - PriceExVat))/PriceExVat;
                            $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO basket (ProdID, ProdTitle, ProdUnitPrice, qnt, PriceExVat, PriceIncVat, Vat) VALUES (?,?,?,?,?,?,?)', [Id, Title, price, qty, PriceExVat, PriceIncVat, vat.toFixed(2)])
                                .then(function (result) {
                                    $rootScope.popup = $ionicPopup.alert({
                                        title: 'Added into basket',
                                        template: 'Product has been added to basket'
                                    });
                                    $rootScope.$emit('updateBasket');

                                }, function (error) {
                                    console.log("Error on saving: " + error.message);
                                })
                        },
                        function (error) {
                            $ionicLoading.hide();
                            $rootScope.popup = $ionicPopup.alert({
                                title: 'Error',
                                template: 'Somthing went wrong'
                            });
                            console.log("Error on loading: " + error.message);
                    });
                    }
					else
					{
						 $ionicLoading.hide();
                            $rootScope.popup = $ionicPopup.alert({
                                title: 'Error',
                                template: 'No Product Found'
                            });
					}
                });
    }
    
    
    $scope.searchOrder = function (searchtext) {
        if (searchtext != "") { 
             $cordovaKeyboard.close();
            $scope.searchorderList = $filter('filter')($rootScope.orderhList, {
                prodTitle: searchtext
            }) || [];
        } else {
            $scope.searchorderList = [];
        }
    }
})

.controller('dateorderCtrl', function ($scope,$state, $rootScope, $filter, $ionicLoading, $cordovaSQLite, $ionicPopup) {
    scope = $scope;
    $scope.dateorderList = [];
    $scope.CurrentDate = $state.params.Date;    
    $scope.BeautifyDate = moment($scope.CurrentDate).format('DD MMM YYYY')
    $scope.orderQty = [];
    $scope.showContent = [];
	$scope.canChangePrice = true;
	
	$scope.canChangePrice = $scope.mUser.CustType == 1 || $scope.mUser.CustType == 2 || $scope.mUser.CustType == 3 ? false : true;
	
    $scope.dateorderList = $filter('filter')($rootScope.orderhList, {orderHistoryDate: $scope.CurrentDate}) || [];
	
	$scope.NotAvailableProduct = [];
	
	var cntr = 0
	var dbcntr  = 0;
	
    $scope.allordertoBasket = function(){
		cntr = 0;
		dbcntr  = 0;
		
    	angular.forEach($scope.dateorderList, function(el, index) {
             if ($scope.orderQty[index] <= 0)
             {
                 return false;
             }
            
			$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdID = "' + el.prodID + '"')
			.then(
                function (result) {
                    $ionicLoading.hide();
                    if (result.rows.length > 0) {
						var PriceExVat = result.rows.item(0).PriceExVat;
						var PriceIncVat = result.rows.item(0).PriceIncVat;
						cntr ++;
						$scope.dateOrdertoBasket(el.prodID,el.parentTitle,el.prodTitle,el.unitCost,$scope.orderQty[index],PriceExVat,PriceIncVat);
					}
					else
					{
						var Title = (el.parentTitle) ? el.parentTitle+' - '+el.prodTitle : el.prodTitle;
						$scope.NotAvailableProduct.push(Title);
					}
			});
		});
    }
	
	 $scope.dateOrdertoBasket = function (Id, ptitle,title, price, qty,PriceExVat,PriceIncVat) {
		
		var Title = (ptitle)?ptitle+' - '+title :title;
        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM basket WHERE ProdID = "' + Id + '"').then(function (result) {
                            $ionicLoading.hide();
                            if (result.rows.length > 0) {
                                qty = qty + result.rows.item(0).qnt;
                            }
                            vat = (100 * (PriceIncVat - PriceExVat))/PriceExVat;
                            console.log(vat.toFixed(2));
                            $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO basket (ProdID, ProdTitle, ProdUnitPrice, qnt, PriceExVat, PriceIncVat, Vat) VALUES (?,?,?,?,?,?,?)', [Id, Title, price, qty, PriceExVat, PriceIncVat, vat.toFixed(2)])
                                .then(function (result) {
									dbcntr++
									if (dbcntr == cntr)
									{
										$rootScope.$emit('updateBasket');
                                        if (!$scope.NotAvailableProduct.length)
                                            {
                                                $rootScope.popup = $ionicPopup.alert({
                                                    title: 'Added into basket',
                                                    template: 'Product has been added to basket'
                                                });      
                                            }
                                        else
                                            {
                                                 $rootScope.popup = $ionicPopup.alert({
                                                    title: 'Error while adding',
                                                    template: $scope.NotAvailableProduct.toString() +' products does not exist in data please find manuly add to basket'
                                                }); 
                                            }
									}
									
                                }, function (error) {
                                    console.log("Error on saving: " + error.message);
                                })
                        });
		
    } 
})

.controller('productlistCtrl', function ($scope, $rootScope, $state, $filter, $ionicHistory, $ionicLoading, $cordovaSQLite, $ionicPopup) {

    scope = $scope;
    root = $rootScope;
    state = $state;

    $scope.categoryProduct = [];

    $ionicLoading.show({
        template: '<img src="img/loader.gif">'
    });

    if (typeof $rootScope.categoryList != 'undefined') {
        var currentCat = $filter('filter')($rootScope.categoryList, {
            catID: Number($state.params.Id)
        }, true)[0];

        $rootScope.productTitle = currentCat.catTitle;
    }


    $scope.$on('eventName', function (event, args) {
        var currentCat = $filter('filter')($rootScope.categoryList, {
            catID: Number($state.params.Id)
        }, true)[0];
        $rootScope.productTitle = currentCat.catTitle;
    });

    $scope.categoryId = Number($state.params.Id);

    $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdParentID = 0 AND ProductCategory = "' + $scope.categoryId + '"')
        .then(
            function (result) {
                $ionicLoading.hide();
                if (result.rows.length > 0) {

                    for (var i = 0; i < result.rows.length; i++) {
                        $scope.categoryProduct.push(result.rows.item(i));
                    }
                } else {
                    $scope.categoryProduct = [];
                }
            },
            function (error) {
                $ionicLoading.hide();
                $rootScope.popup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Somthing went wrong'
                });
                console.log("Error on loading: " + error.message);
            });
})

.controller('productCtrl', function ($scope, $rootScope, $state, $filter, $ionicHistory, $ionicPopup, $cordovaSQLite, $ionicLoading) {
    scope = $scope;
    root = $rootScope;
    state = $state;
	$scope.relatedProduct = [];
	$scope.ConfigurableProduct = [];
	$scope.ParentProduct = [];
	$scope.CurrentConfigurable = [];
    $scope.data = {
        Qty: 1
    };
    $scope.productId = Number($state.params.Id);
	
	$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdID = "' + $scope.productId + '"')
        .then(
            function (result) {
                $ionicLoading.hide();
                if (result.rows.length > 0) {
                    $scope.product = result.rows.item(0);
					$scope.CurrentConfigurable = $scope.product;
					$nProductId = $scope.product.ProdParentID > 0 ? $scope.product.ProdParentID : $scope.productId;
					$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdParentID = "' + $nProductId + '"')
						.then(
							function (result) {
								$ionicLoading.hide();
								if (result.rows.length > 0) {
									for(i=0;i<result.rows.length;i++)
									{
										$scope.ConfigurableProduct.push(result.rows.item(i));
									}
								}
							},
							function (error) {
								$ionicLoading.hide();
								$rootScope.popup = $ionicPopup.alert({
									title: 'Error',
									template: 'Somthing went wrong'
								});
								console.log("Error on loading: " + error.message);
					});
					if($scope.product.ProdParentID > 0)
					{
						$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdID = "' + $scope.product.ProdParentID + '"')
						.then(
							function (resultproducts) {
								$ionicLoading.hide();
								if (resultproducts.rows.length > 0) {
									$scope.ParentProduct = resultproducts.rows.item(0);
								} else {
									$scope.product = null;
								}
							},
							function (error) {
								$ionicLoading.hide();
								$rootScope.popup = $ionicPopup.alert({
									title: 'Error',
									template: 'Somthing went wrong'
								});
								console.log("Error on loading: " + error.message);
						});
					} 
                } else {
                    $scope.product = null;
                }
            },
            function (error) {
                $ionicLoading.hide();
                $rootScope.popup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Somthing went wrong'
                });
                console.log("Error on loading: " + error.message);
            });
	
	$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM relatedproducts WHERE relatedProdID = "' + $scope.productId + '"')
        .then(
            function (result) {
                $ionicLoading.hide();
                if (result.rows.length > 0) {
                   for (var i = 0; i < result.rows.length; i++) {
					    $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdID = "' + result.rows.item(i).prodID + '"')
						.then(
							function (resultChile) {
								$ionicLoading.hide();
								if (resultChile.rows.length > 0) {
									$scope.relatedProduct.push(resultChile.rows.item(0));
								}
							},
							function (error) {
								$ionicLoading.hide();
								$rootScope.popup = $ionicPopup.alert({
									title: 'Error',
									template: 'Somthing went wrong'
								});
								console.log("Error on loading: " + error.message);
							});
                    }
                }
            },
            function (error) {
                $ionicLoading.hide();
                $rootScope.popup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Somthing went wrong'
                });
                console.log("Error on loading: " + error.message);
	});
			
    $scope.goBack = function () {
        $ionicHistory.goBack();
    }

    $scope.addtoBasket = function (Id, title, price, qty, PriceExVat, PriceIncVat) {
        var Title = ($scope.ParentProduct.ProdTitle) ? $scope.ParentProduct.ProdTitle + ' - ' + title  : title;
        
        
        if (!qty) {
            console.log("qty :");
            console.log(qty);
            $rootScope.popup = $ionicPopup.alert({
                title: 'Add quantity ',
                cssClass:'popup-error',
                template: 'Please add quantity 1 or more to add product into basket'
            });
            return false;
        }
        
        
        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM basket WHERE ProdID = "' + Id + '"')
            .then(
                function (result) {
                    $ionicLoading.hide();
                    if (result.rows.length > 0) {
                        qty = qty + result.rows.item(0).qnt;
					}
					vat = (100 * (PriceIncVat - PriceExVat))/PriceExVat;
					$cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO basket (ProdID, ProdTitle, ProdUnitPrice, qnt, PriceExVat, PriceIncVat, Vat) VALUES (?,?,?,?,?,?,?)', [Id, Title, price, qty, PriceExVat, PriceIncVat, vat.toFixed(2)])
                        .then(function (result) {
                            $rootScope.popup = $ionicPopup.alert({
                                title: 'Added into basket',
                                template: 'Product has been added to basket'
                            });
                            $rootScope.$emit('updateBasket');

                        }, function (error) {
                            console.log("Error on saving: " + error.message);
                        })
                },
                function (error) {
                    $ionicLoading.hide();
                    $rootScope.popup = $ionicPopup.alert({
                        title: 'Error',
                        template: 'Somthing went wrong'
                    });
                    console.log("Error on loading: " + error.message);
                });
    }
	
	$scope.swichProduct = function(Id)
	{
		if (typeof Id == 'undefined')
		{
			return false;
		}
		$state.go('app.tab.product', { 'Id': Id})
	}
});