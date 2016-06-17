angular.module('starter.controllers', [])
    .controller('menuCtrl', function ($scope, $rootScope, $ionicScrollDelegate, $ionicLoading, $http, $filter, $ionicHistory, $ionicViewService, $cordovaSQLite, $document, $cordovaNetwork, $ionicPopup, $state, $cordovaToast,$timeout,$cordovaDevice) {

        scope = $scope;
        scroll = $ionicScrollDelegate;
        http = $http;
        filter = $filter;
        state = $state;
        ionicLoading = $ionicLoading;
        cordovaSQLite = $cordovaSQLite;
            cordovaDevice = $cordovaDevice

        $ionicScrollDelegate.resize();
        $scope.openChild = false;
        $scope.openSub = false;
        $rootScope.openMenu = false;
        $scope.bgclass;
        $scope.subtitle;
        $scope.childtitle;
        $rootScope.basketBadge = 0;
        $rootScope.syncButton = false;
        $rootScope.inSyc = false;
        $rootScope.lastsyncDate;
        $scope.innerSync = false;
       /* $rootScope.headers = {headers:{'Accept':'application/json', 'Content-Type':'application/json', 'Authorization':'Bearer 2WsLcqqcjxJ6HYk5RwJkSYm9KICe1gF_HLVS1BFUnBGXwyCCSTnQLaRaCgrGnez3K6YbEu_XZuimbG3U5JnTJktOumcm5sGk_2BeChMKYtOBM-XMCyiHLGx-TXSgsW6-18g-pH2vi_uX1SrLTkIPBZ4M5qSbwaXm8iKSX_gUgHikVX7XFKeuCfLz2gXhNx2StudtagaHXiKPouWaHVkfRcHm1QV_NowbPuBsn7X4Ns3oGhl-tlnV1CsrwUAMZRxr3-itz4oVbWz3WHlShOvlB4ZwZSp3X8rMLZ5qCD5NmCDpl6lOY94KBsU3d-rpiJrcciEwmOP-SpMQ6RSZr2yIQ1_7HJ6vCfBm9rbNulNqD6KSD1YZjAFdkMz29q1exGeVpSmnH_GCXSGrThkVWCV2FivBmXrI-Ot_kJY0L7yQT86rxXp0OKpbDRNFXyR7WNBU75QVLkR70se9fHmTn0WNZxiU8fpDc-E1pj9p-W8WXtE'}}*/

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
                $scope.hideSubmenu(category);
                category.isOpen = true;
            } else {
               
                category.isOpen = true;
            }
        }
        
        
        $scope.hideSubmenu = function(menu)
        {
            var submenu = $filter('filter')(menu.sub, {'isOpen': true},true);
            if (submenu.length)
            {
                $scope.hideSubmenu(submenu[0]);
                submenu[0].isOpen = false;
            }
        }


        $rootScope.logout = function () {
		   
            $state.go('login', {}, {
                location: 'replace'
            });
            $timeout(function () {
                window.localStorage.removeItem("mUser");
                window.localStorage.removeItem("mAccount");
                $ionicHistory.clearCache();
                $scope.innerSync = false;

				$rootScope.pageTitle = "No Account selected";
				$rootScope.reOrderUrl = "";
				$rootScope.accountUrl = "";
				$rootScope.invoiceUrl = "";
				$rootScope.deliveryUrl = "";

                //$ionicViewService.clearHistory();
                $ionicHistory.clearHistory();
                $rootScope.mUser = null;
                $rootScope.syncObj.splice($rootScope.syncObj.indexOf(4), 1);
                $rootScope.syncObj.splice($rootScope.syncObj.indexOf(5), 1);
            }, 30);

            
        }

        $scope.calcPrice = function () {
            var price;
            $rootScope.totalPrice = 0;
            $rootScope.totalVat = 0;
            $rootScope.basketBadge = 0;

            angular.forEach($rootScope.priceData, function (el, index) {
                if (el.vat == "NaN") {
                    el.vat = 0;
                }

                price = el.qty * el.uprice;
                vat = el.qty * (el.uprice + ((el.vat * el.uprice) / 100));

                if (el.tbc) {
                    price = 0;
                    vat = 0;
                }
                $rootScope.totalPrice = $rootScope.totalPrice + price;
                $rootScope.totalVat = $rootScope.totalVat + (vat - price);
                $rootScope.basketBadge = $rootScope.basketBadge + el.qty;
            });

        }

        $scope.checkDate = function(){            
            var cDate = new Date(Number($rootScope.lastsyncDate)).getDate();
            var futureDate = new Date(Number($rootScope.lastsyncDate)).setDate(cDate+7);

            if (futureDate < new Date().getTime() ){
                return true;
            }else {
                return false;
            }    
            
           
            
        }

        $scope.gotoSearch = function () {
            $state.go('app.tab.search', {
                location: 'replace'
            });
        }

        
        $scope.syncError = function (error) {
            $ionicLoading.hide();
            $rootScope.syncButton = false;
            $rootScope.popup = $ionicPopup.alert({
                title: '<h4 class="positive">Data syncing failed</h4>',
                template: 'Please check your internet connection and try again'
            });

            angular.forEach($rootScope.syncObj, function (el, index) {
                el.sync = false;
            });

        }



        $rootScope.getToken = function(){
            http({
                method: 'POST',
                url: 'http://mfcapi.radiatordedicated.co.uk/token',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {grant_type:'password', username:'maxi', password:'w:rCWg]MSWZ4Cr5J'}
            }).success(function (result) { 
                $rootScope.loadOrders();
                //console.log(result);
                var expDate = new Date(result[".expires"]);
                var expDateTime = expDate.setDate(expDate.getDate()-6);    
                $rootScope.tokenExpireDate = expDateTime;

                window.localStorage.setItem("tokenExpDate", expDateTime);

                window.localStorage.setItem("mfcToken", result.access_token);
                $rootScope.headers = {headers:{'Accept':'application/json', 'Content-Type':'application/json', 'Authorization':'Bearer '+result.access_token }}

            });
        }



        $rootScope.loadOrders = function () {
            tempOrderdetails = [];
            tempCartdetails = [];
            tempCntr = 0;
            $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM orderDetail')
                .then(function (result) {
                    if (result.rows.length) {
                        $cordovaToast.showLongBottom('Order Syncing Start');
                        for (var i = 0; i < result.rows.length; i++) {
                            var Result = result.rows.item(i);
                            tempOrderdetails.push(Result);
                        }
                        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM cart').then(function (result) {
                            if (result.rows.length) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    var Result = result.rows.item(i);
                                    tempCartdetails.push(Result);
                                }
                                angular.forEach(tempCartdetails, function (el, index) {
                                    var orderRecords = $filter('filter')(tempOrderdetails, {
                                        'cartID': el.CartID
                                    }, true);
                                    el.orderDetail = [];
                                    el.orderDetail = orderRecords;
                                    console.log(el);
                                    $http.post("http://mfcapi.radiatordedicated.co.uk/api/Order", el,$rootScope.headers).then(function (result) {
                                            tempCntr++;
                                            if (result.data) {
                                                if (tempCartdetails.length == tempCntr) {
                                                    //code for place orderd done on live
                                                    $cordovaToast.showLongBottom('Order Syncing Done');
                                                }
                                                $cordovaSQLite.execute($rootScope.DB, 'DELETE FROM cart WHERE cartID=' + el.CartID).then(function (result) {}, function (err) {
                                                    console.log("Error on deleting: " + err.message);
                                                });

                                                $cordovaSQLite.execute($rootScope.DB, 'DELETE FROM orderDetail WHERE cartID=' + el.CartID).then(function (result) {}, function (err) {
                                                    console.log("Error on deleting: " + err.message);
                                                });
                                            }
                                            else
                                            {
                                                $scope.syncError(error);    
                                            }
                                        },
                                        function (error) {
                                            $scope.syncError(error);
                                        });
                                })
                            }

                        });
                    }
                })
        }




        $scope.loadContacts = function () {
        	$rootScope.syncButton = true;
            if ($scope.innerSync) {
               /* ionicLoading.show({
                    templateUrl: 'templates/syncpopup.html'
                });*/
            }
            var currentDate = new Date();
            var curTimeLog = currentDate.getTime(); 
            $rootScope.syncObj[0].sync = true;
                   
            $http.get('http://mfcapi.radiatordedicated.co.uk/api/Contact',$rootScope.headers).then(function (contacts) {
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
                        $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {}, function (err) {
                            console.log("Error on saving: " + err.message);
                        });
                    }


                    
                    $rootScope.syncObj[0].sync = 'done';
                    $scope.loadProducts();


                },
                function (error) {
                    $scope.syncError(error);
            })
               
        
            

        }



        $scope.loadProducts = function () {
        	$rootScope.syncButton = true;
            var currentDate = new Date();
            var curTimeLog = currentDate.getTime(); 
            $rootScope.syncObj[1].sync = true;
        
            $http.get('http://mfcapi.radiatordedicated.co.uk/api/Product',$rootScope.headers).then(function (products) {
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
                        $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {}, function (err) {
                            console.log("Error on saving: " + err.message);
                        });
                    }
                    $rootScope.syncObj[1].sync = 'done';
                    $scope.loadCategory();


                },
                function (error) {
                    $scope.syncError(error);
            });        
        }




        $scope.loadCategory = function () {
        	$rootScope.syncButton = true;
            var currentDate = new Date();
            var curTimeLog = currentDate.getTime(); 

            $rootScope.syncObj[2].sync = true;
            
           
            $http.get('http://mfcapi.radiatordedicated.co.uk/api/Categories',$rootScope.headers).then(function (categories) {

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
                        $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {}, function (err) {
                            console.log("Error on saving: " + err.message);
                        });
                    }
                    $scope.prepareMenu(subMenu);
                    $rootScope.syncObj[2].sync = 'done';

                    $scope.loadRelatedproducts()

                },
                function (error) {
                    $scope.syncError(error);
            });
 
        }

        $scope.loadRelatedproducts = function () {
        	$rootScope.syncButton = true;
            var currentDate = new Date();
            var curTimeLog = currentDate.getTime(); 

           // $cordovaSQLite.execute($rootScope.DB, 'DROP TABLE relatedproducts');
           // $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS relatedproducts(prodID INTEGER, relatedID INTEGER, relatedIsAccessory TEXT, relatedProdID INTEGER)');
            $rootScope.syncObj[3].sync = true;
            
            var cnt = 0;
           
            $http.get('http://mfcapi.radiatordedicated.co.uk/api/relatedproducts',$rootScope.headers).then(function (relatedproducts) {
                    $scope.relatedproducts = relatedproducts.data;

                    var i, j, temparray, chunk = 100;
                    for (i = 0, j = $scope.relatedproducts.length; i < j; i += chunk) {
                        temparray = $scope.relatedproducts.slice(i, i + chunk);
                        var query = "INSERT OR REPLACE INTO relatedproducts(relatedID, prodID, relatedIsAccessory, relatedProdID) VALUES ";
                        var data = [];
                        var rowArgs = [];
                        angular.forEach(temparray, function (el, index) {
                            rowArgs.push("(?,?,?,?)");
                            data.push(el.relatedID);
                            data.push(el.prodID);
                            data.push(el.relatedIsAccessory);
                            data.push(el.relatedProdID);
                        });
                        query += rowArgs.join(", ");
                        $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {

                        }, function (err) {
                            console.log("Error on saving: " + err.message);
                        });
                    }

                    $rootScope.syncObj[3].sync = 'done';

                    if ($scope.innerSync) {
                        $scope.loadAccounts();
                    }else{                       
                        $ionicLoading.hide();
                    }

                    var sDate = new Date().getTime();
                    window.localStorage.setItem("syncDate",sDate);
                    $rootScope.lastsyncDate = sDate;

                },
                function (error) {
                    $scope.syncError(error);
                });

        }


        $scope.loadAccounts = function (){
        	$rootScope.syncButton = true;
                var queryUrl = '';
                var currentDate = new Date();
                var curTimeLog = currentDate.getTime(); 
                var UserId = $rootScope.mUser.Id;


                if ($scope.innerSync) {
                    $rootScope.syncObj[4].sync = true;
                }else{
                	$rootScope.syncUserObj[0].sync = true;
	            }
	            	
                if ($rootScope.mUser.CustType == 7){
                   var ID = $rootScope.mUser.RelatedAccountNumber;
                   if(ID != ""){
                        queryUrl = 'http://mfcapi.radiatordedicated.co.uk/api/Accounts?AccountID='+ID;
                   }
                } else if($rootScope.mUser.CustType == 3){
                    var ID = $rootScope.mUser.CustRepTerritory;
                    if(ID != ""){
                        queryUrl = 'http://mfcapi.radiatordedicated.co.uk/api/Accounts?TerritoryID='+ID;
                    }
                }
                
                $cordovaSQLite.execute($rootScope.DB, 'SELECT insertedLog FROM syncLog where apiName="Accounts" and acId = '+UserId)
                    .then(function (result) {
                        if(result.rows.length > 0){
                            if((Math.abs(curTimeLog - result.rows.item(0).insertedLog) / 3600000) > 2  || $scope.innerSync == true){
                               $scope.callAccounts(1);
                            }else if($scope.innerSync){
                                $scope.callAccounts(1);
                            }else{
                                $scope.callAccounts(0);
                            }
                        }else{
                            $scope.callAccounts(1);
                        }
                });

                $scope.callAccounts = function(updateTb) {
                    if(updateTb == 1 && queryUrl != ""){
                        
                        $http.get(queryUrl,$rootScope.headers).then(function (accounts) {
                               $scope.accountData = accounts.data;
                                if ($scope.accountData.length == 0)
                                {
                                    $rootScope.syncUserObj[0].sync = 'done';
                                    $ionicLoading.hide();
                                    $scope.loadOrderhistory();
                                }
                            
                                var i, j, temparray, chunk = 25;
                                for (i = 0, j = $scope.accountData.length; i < j; i += chunk) {
                                    temparray = $scope.accountData.slice(i, i + chunk);
                                    var query = "INSERT OR REPLACE INTO accounts (AccountId, AccountNumber, AccountCompany, AccountTerritory, Title, FirstName, Surname, Telephone, Mobile, EmailAddress, BillingHouseName, BillingAddressLine1, BillingAddressLine2, BillingTown, BillingCounty, BillingPostcode, BillingCountry, DeliveryRefrenceName, DeliveryTitle, DeliveryFirstName, DeliverySurname, DeliveryHouseName, DeliveryAddressLine1, DeliveryAddressLine2, DeliveryTown, DeliveryCounty, DeliveryPostcode, DeliveryCountry) VALUES ";
                                    var data = [];
                                    var rowArgs = [];
                                    angular.forEach(temparray, function (el, index) {
                                       // console.log('-----acounts-------');
                                        //console.log(el)
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
                                     var  $nCnt = 0;
                                    $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {
                                         $nCnt = $nCnt + chunk;
                                        if ($nCnt >= $scope.accountData.length) {
                                           // console.log(result);
                                            $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO syncLog(ID,apiName,insertedDate,insertedLog,acType,acId) VALUES((select ID from syncLog where apiName = "Accounts" and acId = '+UserId+'),"Accounts","'+currentDate+'","'+curTimeLog+'",0,'+UserId+')');
                                            if ($scope.innerSync) {
                                                $rootScope.syncObj[4].sync = 'done';
                                                $scope.loadOrderhistory();
                                            }else{
                                                $rootScope.syncUserObj[0].sync = 'done';
                                                $ionicLoading.hide();
                                                $scope.loadOrderhistory();
                                            }

                                        }
                                      
                                    }, function (err) {
                                        console.log("Error on saving: " + err.message);
                                    });
                                }

                                
                            },
                            function (error) {
                                $scope.syncError(error);
                                $rootScope.syncUserObj[0].sync = false;
                            });
                    } else {
                        if ($scope.innerSync) {
                            $rootScope.syncObj[4].sync = 'done';
                            $scope.loadOrderhistory();
                        }else{
                            $rootScope.syncUserObj[0].sync = 'done';
                            $ionicLoading.hide();
                            $scope.loadOrderhistory();
                        }                                
                    }                
                }
            }    




        $scope.loadOrderhistory = function () {
        	$rootScope.syncButton = true;
            if ($scope.innerSync) {
                $rootScope.syncObj[5].sync = true;
            }else{            
            	$rootScope.syncUserObj[1].sync = true;
            }
            		
           // console.log('Orderhistory');
            var queryUrl = '';
            var currentDate = new Date();
            var curTimeLog = currentDate.getTime(); 
            var UserId = $rootScope.mUser.Id;
            
            if ($rootScope.mUser.CustType == 7){
                var ID = $rootScope.mUser.RelatedAccountNumber;
                if(ID != ""){
                    queryUrl = 'http://mfcapi.radiatordedicated.co.uk/api/OrderHistory?AccountID='+ID;
                }
            } else if($rootScope.mUser.CustType == 3){
                var ID = $rootScope.mUser.CustRepTerritory;
                if(ID != ""){
                    queryUrl = 'http://mfcapi.radiatordedicated.co.uk/api/OrderHistory?TerritoryID='+ID;
                }
            }

            $cordovaSQLite.execute($rootScope.DB, 'SELECT insertedLog FROM syncLog where apiName="Orderhistory" and acId = '+UserId)
                .then(function (result) {
                    if(result.rows.length > 0){
                        if((Math.abs(curTimeLog - result.rows.item(0).insertedLog) / 3600000) > 2  || $scope.innerSync == true){
                           $scope.callOrderhistory(1);
                        }else if($scope.innerSync){
                            $scope.callOrderhistory(1);
                        }else{
                            $scope.callOrderhistory(0);
                        }
                    }else{
                        $scope.callOrderhistory(1);
                    }
            });


            var cnt = 0;
            $scope.callOrderhistory = function(updateTb) {
                if(updateTb == 1 && queryUrl != ""){
					
					//$cordovaSQLite.execute($rootScope.DB, 'DELETE from syncLog where apiName = "Orderhistory" ');

                    $cordovaSQLite.execute($rootScope.DB, 'DELETE FROM order_history where userId = '+UserId);
                    //$cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS order_history (OrderHistoryID INTEGER PRIMARY KEY AUTOINCREMENT, costPrice REAL, operaCostPrice REAL, unitCost REAL, accountNumber TEXT, orderHistoryTitle TEXT, prodID INTEGER, prodTitle TEXT, prodPrice REAL, orderHistoryDate TEXT, prodHidePrice TEXT, prodStockQty INTEGER, parentTitle TEXT, quantity INTEGER, orderHistoryNumericDate INTEGER)');


                    
                    $http.get(queryUrl,$rootScope.headers).then(function (orderHistory) {
                            $scope.orderHistory = orderHistory.data;
                            if ($scope.orderHistory.length == 0)
                            {
                                $rootScope.syncUserObj[1].sync = 'done';
                                $ionicLoading.hide();
                                $state.go('app.tab.accounts', {
                                    location: false
                                });
                            }
                            var i, j, temparray, chunk = 50;
                            for (i = 0, j = $scope.orderHistory.length; i < j; i += chunk) {
                                temparray = $scope.orderHistory.slice(i, i + chunk);
                                var query = "INSERT INTO order_history (OrderHistoryID, costPrice, operaCostPrice, unitCost, accountNumber, orderHistoryTitle, prodID, prodTitle, prodPrice, orderHistoryDate, prodHidePrice, prodStockQty, parentTitle, quantity,orderHistoryNumericDate,userId) VALUES ";
                                var data = [];
                                var rowArgs = [];
                                angular.forEach(temparray, function (el, index) {
                                    rowArgs.push("(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
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

                                    var nDate = new Date(el.orderHistoryDate).getTime();
                                    data.push(nDate);
                                    data.push(UserId);
                                });
                                query += rowArgs.join(", ");
                               var  $nCnt = 0;
                                $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {
                                    $nCnt = $nCnt + chunk;
                                    if ($nCnt >= $scope.orderHistory.length) {
                                        $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO syncLog(ID,apiName,insertedDate,insertedLog,acType,acId) VALUES((select ID from syncLog where apiName = "Orderhistory" and acId = '+UserId+'),"Orderhistory","'+currentDate+'","'+curTimeLog+'",0,'+UserId+')');
                                        if ($scope.innerSync) {
                                            $rootScope.syncObj[5].sync = 'done';
                                            $rootScope.inSyc = false;
                                            //$rootScope.syncObj.splice($rootScope.syncObj.indexOf(4), 1);
                                            //$rootScope.syncObj.splice($rootScope.syncObj.indexOf(4), 1);
                                            $ionicLoading.hide();
                                            
                                        }else{
                                            $rootScope.syncUserObj[1].sync = 'done';
                                            $ionicLoading.hide();
                                            $state.go('app.tab.accounts', {
                                                location: false
                                            });    
                                            $timeout(function () {                                                        
                                                $ionicHistory.clearHistory();                                            
                                            }, 30);                                                                                    
                                        }

                                    }
                                }, function (err) {
                                    console.log("Error on saving: " + err.message);
                                });
                            }
                            var sDate = new Date().getTime();
                            window.localStorage.setItem("AccountSyncDate",sDate);

                        },
                        function (error) {
                            $scope.syncError(error);
                            $rootScope.syncUserObj[1].sync = false;
                        });
                }else{
                    if ($scope.innerSync) {
                        $rootScope.syncObj[5].sync = 'done';
                        $ionicLoading.hide();
                        $rootScope.inSyc = false;
                      
                    }else{
                        $rootScope.syncUserObj[1].sync = 'done';
                        $ionicLoading.hide();
                        $state.go('app.tab.accounts', {
                            location: false
                        });
                        $timeout(function () {                                                        
                            $ionicHistory.clearHistory();                                            
                        }, 30);
                    }

                }
            }    
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
            $rootScope.priceData = [];
            $rootScope.basketBadge = 0;
            if($rootScope.mAccount != null && $rootScope.mAccount !=  ''){
                $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM basket WHERE UserID = '+$rootScope.mAccount.AccountId)
                    .then(
                        function (result) {
                            for (var i = 0; i < result.rows.length; i++) {
                                $rootScope.basketList.push(result.rows.item(i));
                                
                                $rootScope.basketBadge = $rootScope.basketBadge + $rootScope.basketList[i].qnt;
                                $rootScope.priceData[i] = {};
                                $rootScope.priceData[i].qty = $rootScope.basketList[i].qnt;
                                $rootScope.priceData[i].uprice = $rootScope.basketList[i].PriceExVat;
                                $rootScope.priceData[i].vat = $rootScope.basketList[i].Vat;
                                $rootScope.priceData[i].tbc = $rootScope.basketList[i].isTBC;
                            }
                            $scope.calcPrice();
                            $ionicLoading.hide();
                           // $rootScope.basketBadge = $rootScope.basketList.length;
                        });
            }else{
                 $ionicLoading.hide();
                 $rootScope.basketBadge = 0;
            }
            
        });

        $scope.$on('syncStart', function (event, args) {
        var currentDate = new Date();
        var curTimeLog = currentDate.getTime(); 
        var lateMessage = "Everything is up to date. ";
       
    
            if((Math.abs(curTimeLog - window.localStorage.getItem('syncDate')) / 3600000) > 2){
                lateMessage = "";
            }

            $scope.innerSync = args.innerSync;
            if ($cordovaNetwork.isOnline()) {
                if ($scope.innerSync && $rootScope.inSyc == false) {
                    $rootScope.popup = $ionicPopup.show({
                        title: '<h4 class="positive">Full sync takes time</h4>',
                        template: lateMessage+'Do you want to continue the sync proccess ?',
                        buttons: [
                            {
                                text: 'Cancel'
                    		},
                            {
                                text: 'Continue',
                                type: 'button-positive',
                                onTap: function (e) {
                                $scope.startinnerSyncing();
                            }
                      }
                    ]
                    });
                } else {
                    $scope.startinnerSyncing();
                }
            } else {
                $rootScope.popup = $ionicPopup.alert({
                    title: '<h4 class="positive">No Internet Connection</h4>',
                    template: 'Sorry, Internet Connectivity not detected. Please reconnect and try again.'
                });
            }
        });

              

        $scope.startinnerSyncing = function () {
            if ($cordovaNetwork.getNetwork() != "wifi") {
                $rootScope.popup = $ionicPopup.show({
                    title: '<h4 class="positive">No Wifi Network</h4>',
                    template: 'You are on Mobile Data Switch to Wifi or Mobile Data may cause additional charges.',
                    cssClass: 'internetError',
                    buttons: [
                        {
                            text: 'Cancel'
                        },
                        {
                            text: 'Continue',
                            type: 'button-positive',
                            onTap: function (e) {
                                if( ($rootScope.inSyc && $scope.innerSync == true) || $scope.innerSync == false){
                                    $scope.loadContacts();   
                                }else{
                                	if($rootScope.syncObj.length <= 4){
                                    	$rootScope.syncObj.push({title:'Accounts',sync:false},{title:'Order History',sync:false});
                                	}
                                    angular.forEach($rootScope.syncObj, function (el, index) {
                                        el.sync = false;
                                    });
                                    $state.go('sync', {
                                        location: false
                                    });   
                                }                             
                               
                        }
                      }
                    ]
                });
            } else {
                if($rootScope.inSyc  || $scope.innerSync == false ){
                    $scope.loadContacts();   
                }else{
                    
                    angular.forEach($rootScope.syncObj, function (el, index) {
                        el.sync = false;
                    });                    
                    $state.go('sync', {
                        location: false
                    });   
                }       
            }
        }


        

        $scope.syncData = function () {
            $scope.$emit('syncStart', {
                innerSync: true
            });
        }
    })


.controller('syncCtrl', function ($scope, $state, $rootScope, $ionicHistory, $location) {
    root = $rootScope;
    scope = $scope;

    $scope.$on('$ionicView.enter', function() {
        if ($rootScope.mUser != null) {
        	$rootScope.syncButton = false;
            $rootScope.inSyc = true;    
            $scope.innerSync = true;     
        }

    })    



    $scope.handleClick = function () {
        if ($rootScope.mUser != null) {
            $scope.$emit('syncStart', {
                innerSync: true
            });
        }else{
            $scope.$emit('syncStart', {
                innerSync: false
            });
        }
    };

    $scope.gotoLogin = function () {
        $state.go('login', {
            location: false
        });
    }

	$scope.goBack = function () {
        $rootScope.inSyc = false;
        $scope.innerSync =  false;		
        $ionicHistory.goBack();
    }    

    $scope.gotoAccount = function () {
        $rootScope.inSyc = false;
        $scope.innerSync =  false;       
        //$location.path("/app/tab/accounts");  
        $state.go('app.tab.accounts', {
            location: false
        });
    }

})


.controller('syncUserCtrl', function ($scope, $state, $rootScope,$ionicLoading, $ionicPlatform, $cordovaNetwork, $ionicPopup) {
    root = $rootScope;
    scope = $scope;
    $ionicLoading.hide();
    angular.forEach($rootScope.syncUserObj, function (el, index) {
        el.sync = false;
    });


    $scope.handleUserClick = function () {

			if ($cordovaNetwork.isOnline()) {

					if ($cordovaNetwork.getNetwork() != "wifi") {
		                $rootScope.popup = $ionicPopup.show({
		                    title: '<h4 class="positive">No Wifi Network</h4>',
		                    template: 'You are on Mobile Data Switch to Wifi or Mobile Data may cause additional charges.',
		                    cssClass: 'internetError',
		                    buttons: [
		                        {
		                            text: 'Cancel'
		                    },
		                        {
		                            text: 'Continue',
		                            type: 'button-positive',
		                            onTap: function (e) {
		                                $scope.loadAccounts();
		                            }
		                      }
		                    ]
		                });
		            } else {
		                $scope.loadAccounts();
		            }
                
            } else {
                $rootScope.popup = $ionicPopup.alert({
                    title: '<h4 class="positive">No Internet Connection</h4>',
                    template: 'Sorry, Internet Connectivity not detected. Please reconnect and try again.'
                });
            }

    };
   
})

.controller('loginCtrl', function ($scope, $state, $rootScope, $ionicPopup, $ionicLoading, $filter, $cordovaSQLite, $cordovaKeyboard, $ionicHistory,$timeout) {


    root = $rootScope;
    scope = $scope;
    //$scope.email = 'stephen@the-radiator.com';
    /*$scope.email = 'michaeldownie19@gmail.com';
    $scope.password = 'radiator';*/
    $scope.email = '';
    $scope.password = '';
    $rootScope.syncButton = false;
    $rootScope.basketBadge = 0;

    $scope.openLink = function (weblink) {
      //  console.log(weblink);
        window.open(weblink, '_system');
        return false;
    }



    $scope.doLogin = function (form) {
		$ionicLoading.show({
            template: '<img src="img/loader.gif">'
        });        

        if (!form.$valid) {
			$ionicLoading.hide();
            return false;
        }
        var Email = form.email.$modelValue.toLowerCase();
        var Password = form.password.$modelValue;

        var currentDate = new Date();
        var curTimeLog = currentDate.getTime(); 

        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM contacts WHERE UserName = "' + Email + '"')
            .then(
                function (result) {
                    if (result.rows.length > 0) {
                            var User = result.rows.item(0);
                            $ionicHistory.clearHistory();
                            $ionicHistory.clearCache();
                            $rootScope.mUser = User;
                            window.localStorage.setItem("mUser", JSON.stringify($rootScope.mUser));
                            window.localStorage.removeItem("mAccount");
                            $rootScope.mAccount = "";
                                                 
                        //var hash = bcrypt.hashSync(Password, User.SaltUsed);
                        //if (hash == User.Password) {
							$timeout(function () {
								 $scope.validation();           
							}, 20);
						
							$scope.validation = function(){					
								var User = result.rows.item(0);
								if (bcrypt.compareSync(Password, User.Password) == true && (User.CustType == 3 || User.CustType == 7) )
								{
									$ionicLoading.hide();
									$cordovaKeyboard.close();
		
									$ionicHistory.clearHistory();
									$ionicHistory.clearCache();
									$rootScope.mUser = User;
									window.localStorage.setItem("mUser", JSON.stringify($rootScope.mUser));
									window.localStorage.removeItem("mAccount");
									$rootScope.mAccount = "";
									if($rootScope.syncObj.length <= 4){
										$rootScope.syncObj.push({title:'Accounts',sync:false},{title:'Order History',sync:false});
									}
									
									 var UserId = $rootScope.mUser.Id;
										$cordovaSQLite.execute($rootScope.DB, 'SELECT insertedLog FROM syncLog where (apiName="Accounts" OR apiName="Orderhistory") and acId = '+UserId)
											.then(function (result) {
												if(result.rows.length > 1){
													for(var pt=0;pt<result.rows.length;pt++){
														if((Math.abs(curTimeLog - result.rows.item(pt).insertedLog) / 3600000) > 2){
															$state.go('syncuserdata', {
																	location: false
																});
														}else{
															 $state.go('app.tab.accounts', {
																	location: false
															 });
														}
													}
                                                    $timeout(function () {                                                        
                                                        $ionicHistory.clearHistory();                                            
                                                    }, 30);


												}else{
		
													$state.go('syncuserdata', {
														location: false
													});
		
												}
										});
								}else if(User.CustType != 3 && User.CustType != 7){
									$ionicLoading.hide();
									$cordovaKeyboard.close();
									
									$rootScope.popup = $ionicPopup.alert({
										title: 'No Account',
										template: 'For this Email There is not Account List'
									});							
								} else {
									$ionicLoading.hide();
									$cordovaKeyboard.close();
									
									$rootScope.popup = $ionicPopup.alert({
										title: 'Wrong Password',
										template: 'Please check password'
									});
							   }
						}
					   
                    } else {
                        $ionicLoading.hide();
                        $rootScope.popup = $ionicPopup.alert({
                            title: 'Incorrect Credentials',
                            template: 'Please check email and password'
                        });
                    }
                },
                function (error) {
                    $ionicLoading.hide();
                    $rootScope.popup = $ionicPopup.alert({
                        title: 'Error',
                        template: 'Something went wrong'
                    });
                    console.log("Error on loading: " + error.message);
                });
    }
})


.controller('appCtrl', function ($scope, $state) { })



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

    $scope.$on('$ionicView.enter', function() {
     $rootScope.$emit('updateBasket');
    })    
    

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

    $scope.UpdateProductTbc = function (ID, istbc) {
        var TBC = (istbc == true) ? 1 : 0;
        $cordovaSQLite.execute($rootScope.DB, 'UPDATE basket SET isTBC = ' + TBC + ' WHERE basketID = ' + ID)
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
        $cordovaSQLite.execute($rootScope.DB, 'UPDATE basket SET qnt = ' + Qty + ' WHERE basketID = ' + proId)
            .then(function (result) {}, function (error) {
                console.log("Error on saving: " + error.message);
            })
    }

    $scope.updatePrice = function (proId, price) {
        $scope.calcPrice();
        var Uprice = price || 0;
        $cordovaSQLite.execute($rootScope.DB, 'UPDATE basket SET PriceExVat = "' + price + '" WHERE basketID = ' + proId)
            .then(function (result) {}, function (error) {
                console.log("Error on saving: " + error.message);
            })
    }

})

.controller('checkoutCtrl', function ($scope, $rootScope, $cordovaSQLite, $ionicLoading, $ionicPopup, $state, $ionicHistory) {
    ionicHistory = $ionicHistory;
    scope = $scope;
    root = $rootScope;
    $scope.placeOrder = function () {
        var date = new Date()
        var stringDate = filter('date')(date, "yyyy-MM-ddTHH:mm:ss Z");

        var DeliveryTitle = $rootScope.mAccount.DeliveryTitle || '';
        var FirstName = $rootScope.mAccount.FirstName || '';
        var Surname = $rootScope.mAccount.Surname || '';
        var DeliveryHouseName = $rootScope.mAccount.DeliveryHouseName || $rootScope.mAccount.BillingHouseName;
        var DeliveryAddressLine1 = $rootScope.mAccount.DeliveryAddressLine1 || $rootScope.mAccount.BillingAddressLine1;
        var DeliveryAddressLine2 = $rootScope.mAccount.DeliveryAddressLine2 || $rootScope.mAccount.BillingAddressLine2;
        var DeliveryTown = $rootScope.mAccount.DeliveryTown || $rootScope.mAccount.BillingTown;
        var DeliveryCountry = $rootScope.mAccount.DeliveryCountry || $rootScope.mAccount.BillingCountry;
        var DeliveryPostcode = $rootScope.mAccount.DeliveryPostcode || $rootScope.mAccount.BillingPostcode;
        var Telephone = $rootScope.mAccount.Telephone || '';
        var Mobile = $rootScope.mAccount.Mobile || '';

        var nCount = 0;
        var nInsertedCount = 0;
        var dt = new Date().getTime();
        dt = $rootScope.mAccount.AccountId+dt;
        $cordovaSQLite.execute($rootScope.DB, 'INSERT INTO cart(custID, accountNumber, orderDate, orderTotal, orderDeliveryTotal, orderShipSameAsBilling, orderShipCompany, orderShipTitle, orderShipFirstname, orderShipSurname, orderShipHouseNameNo, orderShipAddress1, orderShipAddress2, orderShipCity, orderShipCounty, orderShipPostcode, orderShipTelephone, orderShipMobile, orderShipFax, orderDelInstr1, orderGiftWrap,orderGiftWrapMessage, appCartID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [$rootScope.mUser.Id, $rootScope.mAccount.AccountNumber, stringDate, $rootScope.totalPrice, $rootScope.totalPrice, 0, $rootScope.mAccount.AccountCompany, DeliveryTitle, FirstName, Surname, DeliveryHouseName, DeliveryAddressLine1, DeliveryAddressLine2, DeliveryTown, DeliveryCountry, DeliveryPostcode, Telephone, Mobile, '', '', 0, '',dt])
            .then(function (result) {
                    cartID = result.insertId;
                    var tempBasket = $rootScope.basketList;
                    var tempPrice = $rootScope.priceData;

                    angular.forEach(tempBasket, function (el, index) {
                        nCount++;
                        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdID = ' + el.ProdID).then(function (result) {
                            $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO orderDetail(custID, accountNumber, cartID, prodID, prodTitle, prodDesc, prodPrice, prodCode, VATRate, quantity, shipped, rowTotal, rowTotalWithVAT) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [$rootScope.mUser.Id, $rootScope.mAccount.AccountNumber, cartID, el.ProdID, result.rows.item(0).ProdTitle, result.rows.item(0).prodDesc, tempPrice[index].tbc ? 0 : el.ProdUnitPrice, result.rows.item(0).prodCode, tempPrice[index].tbc ? 0 : tempPrice[index].vat, tempPrice[index].qty, 0, tempPrice[index].tbc ? 0 : tempPrice[index].uprice * tempPrice[index].qty, tempPrice[index].tbc ? 0 : tempPrice[index].qty * (tempPrice[index].uprice + (tempPrice[index].uprice * tempPrice[index].vat / 100))])
                                .then(function (result) {
                                    nInsertedCount++;
                                    if (nCount == nInsertedCount) {
                                        if (!$rootScope.isOffline) {
                                            $rootScope.loadOrders();
                                        }
                                    }
                                }, function (error) {
                                    console.log("Error on saving: " + error.message);
                                })

                        })
                    })

                    $cordovaSQLite.execute($rootScope.DB, 'DELETE FROM basket where UserID = '+$rootScope.mAccount.AccountId);

                    //$cordovaSQLite.execute($rootScope.DB, 'DROP TABLE basket');

                    //$cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS basket ( basketID INTEGER PRIMARY KEY AUTOINCREMENT, ProdID INTEGER, ProdTitle TEXT, ProdUnitPrice REAL, qnt INTEGER,stokQnt INTEGER, PriceExVat REAL, PriceIncVat REAL, Vat REAL, isTBC INTEGER DEFAULT 0)');

                    //$cordovaSQLite.execute($rootScope.DB, 'CREATE UNIQUE INDEX IF NOT EXISTS ProdIDIndex ON basket (ProdID)');

                    $rootScope.basketList = [];
                    $rootScope.priceData = [];
                    $rootScope.basketBadge = 0;
                    $state.go('app.tab.basket', {
                        location: false
                    });
                },
                function (error) {
                    $ionicLoading.hide();
                    $rootScope.popup = $ionicPopup.alert({
                        title: 'Error',
                        template: 'Something went wrong'
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

.controller('searchproCtrl', function ($scope, $rootScope, $cordovaSQLite, $ionicPopup, $ionicLoading, $cordovaKeyboard, $ionicScrollDelegate) {
    scope = $scope;
    root = $rootScope;
    $scope.productSearch = '';
    $scope.searchproductList;
    $scope.searchWordList = '';
    $scope.pageNum = 0;
    $scope.limitData = 25;
    $scope.searchproductList = [];
    $scope.noMoreItemsAvailable = false;


	$scope.$on('$ionicView.enter', function() {
	    document.getElementById("productSearch").focus();
	})    




    $cordovaSQLite.execute($rootScope.DB, 'SELECT word FROM searchText order by ID DESC LIMIT 5').then(function (result) {
            
            $scope.searchWordList = [];
            if (result.rows.length > 0) {
                for (var i = 0; i < result.rows.length; i++) {
                    $scope.searchWordList.push(result.rows.item(i));
                }

            } else {
                $scope.searchWordList = [];
            }
        },
        function (error) {
            $ionicLoading.hide();
            $rootScope.popup = $ionicPopup.alert({
                title: 'Error',
                template: 'Something went wrong'
            });
            console.log("Error on loading: " + error.message);
        });    


    $scope.clearSearch = function(){
        $scope.productSearch = "";
    }







	$scope.searchProduct = function (searchtext) {
        if (searchtext != "") {
            $cordovaKeyboard.close();
            $scope.searchproductList = [];
            $scope.searchproductLength = 0;
            $scope.searchtext = searchtext;
            $scope.pageNum = 0;
            
			$cordovaSQLite.execute($rootScope.DB, 'INSERT INTO searchText (word) VALUES("'+searchtext+'")');
            $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdParentID = 0 AND ProdTitle like "%' + searchtext + '%" ').then(function(result){
            $scope.searchproductLength = result.rows.length;
            })
        } else {
            $scope.searchproductList = [];
           
            $scope.searchproductLength = 0;
            $scope.searchtext = '';
            $scope.pageNum = 0;

        }

    }

    $scope.loadMoreProduct = function(searchtext) {
    	var searchtext = $scope.searchtext;
    	console.log($scope.pageNum);
        var pageOffset = 0;
        if($scope.pageNum > 0){
           pageOffset =  $scope.pageNum * $scope.limitData;    
        }

     
        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdParentID = 0 AND ProdTitle like "%' + searchtext + '%"  LIMIT '+$scope.limitData+' OFFSET '+pageOffset)
            .then(
                function (result) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if (result.rows.length > 0) {
                        for (var i = 0; i < result.rows.length; i++) {
                            $scope.searchproductList.push(result.rows.item(i));                            
                        }
                       $scope.pageNum = $scope.pageNum + 1;
                    }
                    if($scope.pageNum == 0 || $scope.pageNum == 1){
                    	$ionicScrollDelegate.resize();
                    }
                },
                function (error) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $rootScope.popup = $ionicPopup.alert({
                        title: 'Error',
                        template: 'Something went wrong'
                    });
                    console.log("Error on loading: " + error.message);
                });

    }



})

.controller('myaccountCtrl', function ($scope, $rootScope, $state, $timeout, $ionicHistory, $ionicViewService, $cordovaSQLite,$timeout) {
    scope = $scope;

    $scope.$on('$ionicView.enter', function() {
        if($rootScope.mAccount != "" && $rootScope.mAccount != null){
            
            $rootScope.pageTitle = '('+$rootScope.mAccount.AccountNumber+') '+$rootScope.mAccount.AccountCompany;
            
                $cordovaSQLite.execute($rootScope.DB, 'SELECT count(*) FROM order_history WHERE accountNumber = "' + $rootScope.mAccount.AccountNumber + '" ').then(function(result){
                    $rootScope.reOrderUrl = "";
                    if(result.rows.item(0)['count(*)'] > 0){
                        $rootScope.reOrderUrl = "#/app/tab/orderlist";
                    }
                });
            

            $rootScope.accountUrl = "#/app/tab/detail";
            $rootScope.invoiceUrl = "#/app/tab/invoice";
            $rootScope.deliveryUrl = "#/app/tab/delivery";
        }
        else
        {
             
            $rootScope.accountUrl = "";
            $rootScope.invoiceUrl = "";
            $rootScope.deliveryUrl = "";
            $rootScope.reOrderUrl = "";
        }
    })    
    

})

.controller('accountdetailCtrl', function ($scope, $rootScope, $state) {
    state = $state;
    scope = $scope;
    $scope.accountPage = $state.current.url.replace("/", "");
})

.controller('accountsCtrl', function ($rootScope, $scope, $ionicLoading, $ionicPopup, $http, $state, $filter, $timeout, $cordovaSQLite, $ionicPlatform, $cordovaKeyboard, $ionicScrollDelegate, $ionicHistory) {
    scope = $scope;
    root = $rootScope;
    state = $state;
    $scope.count;
    $scope.data = {}
    $scope.data.accountSearch = '';
    $scope.displaySearch = true;
    $scope.pageName = $state.current.name;
    $scope.alpha = "-1";
    $scope.pageNum = 0;
    $scope.pageSeachNum = 0;
    $scope.limitData = 25;
    $scope.accountList = []
    $scope.noMoreItemsAvailable = false;
    $scope.accountListLength = 0;
    $ionicLoading.hide();
    $scope.dReady = 0;
    ionicHistory = $ionicHistory;
    

	$ionicPlatform.ready(function () {   
		$scope.dReady = 1;
	})   
    

    $scope.clearSearch = function(){
        $scope.data.accountSearch = "";
    }

   
    //console.log($ionicHistory.backView());

     $scope.loadMore = function() {
            if($scope.data.accountSearch != ''){
                $scope.accountFilter($scope.data.accountSearch);
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }else{
                var pageOffset = 0;
                if($scope.pageNum > 0){
                   pageOffset =  $scope.pageNum * $scope.limitData;    
                }
                querystr = 'SELECT * FROM accounts';
               // queryctn = 'SELECT count(*) FROM accounts';
                if ($rootScope.mUser.CustType == 7){
                        var ID = $rootScope.mUser.RelatedAccountNumber;
                        querystr = 'SELECT * FROM accounts where AccountNumber="'+ID+'" ';
                        //queryctn = 'SELECT count(*) FROM accounts where AccountNumber="'+ID+'" ';
                } else if($rootScope.mUser.CustType == 3){
                        var ID = $rootScope.mUser.CustRepTerritory;
                        querystr = 'SELECT * FROM accounts where AccountTerritory="'+ID+'" ';
                        //queryctn = 'SELECT count(*) FROM accounts where AccountTerritory="'+ID+'"';
                }
               /* if ($scope.pageNum == 0)
                {
                    $cordovaSQLite.execute($rootScope.DB, queryctn).then(function(result){
                        $scope.accountListLength = result.rows.item(0)['count(*)'];
                    })
                }*/
                $cordovaSQLite.execute($rootScope.DB, querystr+' ORDER BY AccountNumber LIMIT '+$scope.limitData+' OFFSET '+pageOffset)
                    .then(
                        function (result) {
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                            $ionicLoading.hide();
                            if (result.rows.length > 0) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    $scope.accountList.push(result.rows.item(i));
                                }
                                
                                if (result.rows.length < $scope.limitData) {
                                     $scope.noMoreItemsAvailable = true;
                                }
                                $scope.pageNum = $scope.pageNum + 1;
                            }else{
                                $scope.noMoreItemsAvailable = true;
                            }
                            
                        },
                        function (error) {
                            $ionicLoading.hide();
                            $scope.noMoreItemsAvailable = false;
                            $rootScope.popup = $ionicPopup.alert({
                                title: 'Error',
                                template: 'Something went wrong'
                            });
                            console.log("Error on loading: " + error.message);
                    });
            }
    
    }

    $scope.accountFilter = function (searchtext) {
        if(searchtext == ''){
            return false;
        }
        //console.log('accountFilter');
        var pageOffset = 0;
        if($scope.pageSeachNum > 0){
           pageOffset =  $scope.pageSeachNum * $scope.limitData;    
        }
         

        $sWhere = $scope.AccountRoleManagement(searchtext);
        if ($sWhere) {
            $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM accounts ' + $sWhere+' LIMIT '+$scope.limitData+' OFFSET '+pageOffset)
                .then(
                    function (result) {
                        $ionicLoading.hide();
                        if (result.rows.length > 0) {

                            for (var i = 0; i < result.rows.length; i++) {
                                $scope.accountList.push(result.rows.item(i));
                            }
                            $scope.pageSeachNum = $scope.pageSeachNum + 1;
                        }
                    },
                    function (error) {
                        $ionicLoading.hide();
                        $rootScope.popup = $ionicPopup.alert({
                            title: 'Error',
                            template: 'Something went wrong'
                        });
                        console.log("Error on loading: " + error.message);
                    });
        } else {
            $ionicLoading.hide();
            $rootScope.popup = $ionicPopup.alert({
                title: 'Error',
                template: 'No Account Specify for you'
            });
        }
    }

    $scope.AccountRoleManagement = function (searchtext) {
        $sWhere = '';
        //AccountCompany like "%' + searchtext + '%" OR AccountNumber like "%' + searchtext + '%"
        if ($rootScope.mUser.CustType == 1 || $rootScope.mUser.CustType == 2) {
            if (searchtext.length > 0) {
                $sWhere += ' WHERE AccountCompany like "%' + searchtext + '%" OR AccountNumber like "%' + searchtext + '%"';
            }
            return $sWhere;
        } else if ($rootScope.mUser.CustType == 3) {
            if ($rootScope.mUser.CustRepTerritory == '') {
                $sWhere = false;
            } else {
                if (searchtext.length > 0) {
                    $sWhere += ' WHERE (AccountCompany like "%' + searchtext + '%" OR AccountNumber like "%' + searchtext + '%") AND AccountTerritory = "' + $rootScope.mUser.CustRepTerritory + '" AND AccountTerritory <> "" ';
                } else {
                    $sWhere += ' WHERE AccountTerritory = "' + $rootScope.mUser.CustRepTerritory + '" AND AccountTerritory <> "" ';
                }
            }
            return $sWhere;
        } else if ($rootScope.mUser.CustType == 7) {
            if ($rootScope.mUser.RelatedAccountNumber == "") {
                $sWhere = false;
            } else {
                if (searchtext.length > 0) {
                    $sWhere += ' WHERE (AccountCompany like "%' + searchtext + '%" OR AccountNumber like "%' + searchtext + '%") AND AccountNumber = "' + $rootScope.mUser.RelatedAccountNumber + '"';
                } else {
                    $sWhere += ' WHERE AccountNumber = "' + $rootScope.mUser.RelatedAccountNumber + '"';
                }
            }
            return $sWhere;
        }
    }

    $ionicPlatform.ready(function () {

        if ($rootScope.mUser.CustType == 7) {
            $scope.accountFilter('');
            $scope.displaySearch = false;
        }
    })

    $scope.search = function (searchtext) {      
        if (searchtext != '') {
            $scope.pageSeachNum = 0;
            $scope.accountList = [];
            $cordovaKeyboard.close();
            $ionicLoading.show({
                template: '<img src="img/loader.gif">'
            });

            $scope.accountFilter(searchtext);
            $ionicScrollDelegate.resize();
        } else {
            $scope.accountList = [];
            $scope.pageNum = 0;
            
            $ionicScrollDelegate.resize();
            $scope.loadMore();
            //console.log("No");
        }
    }


    $scope.selectAccount = function (account) {
        
       var oldAccount = angular.copy($rootScope.mAccount);
        $rootScope.mAccount = account;
         window.localStorage.setItem("mAccount", JSON.stringify($rootScope.mAccount));


		if($rootScope.mAccount != null && oldAccount.AccountId != undefined && account.AccountId != oldAccount.AccountId ){
			$ionicHistory.clearCache();
		}

        if($rootScope.basketBadge > 0 && account.AccountId != oldAccount.AccountId && $rootScope.mAccount != null){
              var confirmPopup = $ionicPopup.confirm({
                 title: 'Switch Basket',
                 template: 'Carry with same basket',
                 scope: $scope,
                  buttons: [
                    {  
                        text: 'No',
                        onTap: function(e) {
                             $rootScope.$emit('updateBasket');
                        }
                     },
                    {
                        text: '<b>Yes</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            $scope.SwitchFrom(account.AccountId,oldAccount.AccountId);
                        }
                    }
                  ]
              });

              confirmPopup.then(function(res) {
                $state.go('app.tab.myaccount', {
                    location: false
                });
              });            
        }else{
                $rootScope.$emit('updateBasket');
                $timeout(function () {
                        $state.go('app.tab.myaccount', {
                            location: false
                        });
                }, 20);

        }

    }


    $scope.SwitchFrom = function(nID,oID) {

        $cordovaSQLite.execute($rootScope.DB, 'DELETE FROM basket where UserID ='+nID).then(function (result) {});   

        $cordovaSQLite.execute($rootScope.DB, 'INSERT INTO basket (ProdID, ProdTitle, ProdUnitPrice, qnt,stokQnt, PriceExVat, PriceIncVat, Vat, UserID) SELECT ProdID, ProdTitle, ProdUnitPrice, qnt,stokQnt, PriceExVat, PriceIncVat, Vat, '+nID+' from basket where UserID ='+oID)
            .then(
                function (result) {
                    $rootScope.$emit('updateBasket');

        },
            function (error) {
                $rootScope.popup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Something went wrong'
                });
                console.log("Error on loading: " + error);
            });
    }


    $scope.checkAlpha = function (char, index) {

        if (char.charAt(0) != $scope.alpha) {
            $scope.alpha = char.charAt(0)[0];
            return $scope.alpha;
        } else {
            return false;
        }
    }
})

.controller('orderlistCtrl', function ($scope, $rootScope, $filter, $ionicLoading, $cordovaSQLite, $ionicPopup, $cordovaKeyboard) {

    scope = $scope;
    $scope.bydate = true;
    $scope.byproduct = false;
    $scope.data = {}
    $rootScope.orderhList = []
    $scope.searchtext = '';
    $scope.searchorderList;
    $rootScope.searchorderList = []
    $scope.orderQty = [];
    $scope.dorderQty = [];
    $scope.data.monthfilter = '72';
    var cnt = -1;
    var isloadData = true;
    $scope.pageNum = 0;
    $scope.pageNumD = 0;
    $scope.limitData = 25;
    $scope.searchorderLength = 0;
    $scope.orderhListLength = 0;
    $scope.scroll = true;
    $scope.lastDate = '';
    
   

    /* if ($rootScope.mAccount)
     {
         $rootScope.orderhList = $filter('filter')( $rootScope.orderhistoryData, {accountNumber: $rootScope.mAccount.AccountNumber}, true) || [];
     }*/
    $ionicLoading.show({
        template: '<img src="img/loader.gif">'
    });

    $scope.clearSearch = function(){
        $scope.data.searchData = "";
    }


    $scope.searchOrder = function (searchtext) {
        if (searchtext != "") {
            $cordovaKeyboard.close();
            /*$scope.searchorderList = $filter('filter')($rootScope.orderhList, {
                prodTitle: searchtext
            }) || [];*/
            $rootScope.searchorderList = [];
             $scope.searchorderLength = 0;
            $scope.searchtext = searchtext;
            $scope.pageNum = 0;

            $cordovaSQLite.execute($rootScope.DB, 'SELECT strftime("%Y-%m-%d", orderHistoryDate) histDate FROM order_history WHERE (prodTitle LIKE "'+$scope.searchtext+'%" OR prodTitle LIKE  "%'+$scope.searchtext+'%") and accountNumber = "' + $rootScope.mAccount.AccountNumber + '" group by histDate').then(function(result){
            $scope.searchorderLength = result.rows.length;
            cnt = -1;
            $scope.lastDate = "";
            $scope.oldDate = "";

            })
        } else {
            $rootScope.searchorderList = [];
            cnt = -1;
            $scope.lastDate = "";
            $scope.oldDate = "";
            $scope.searchorderLength = 0;
            $scope.searchtext = '';
            $scope.pageNum = 0;

        }

    }

    $scope.loadMoreOrder = function(searchtext) {
        var pageOffset = 0;
        if($scope.pageNum > 0){
           pageOffset =  $scope.pageNum * $scope.limitData;    
        }

        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM order_history WHERE (prodTitle LIKE "'+$scope.searchtext+'%" OR prodTitle LIKE  "%'+$scope.searchtext+'%") and accountNumber = "' + $rootScope.mAccount.AccountNumber + '" ORDER BY orderHistoryNumericDate DESC LIMIT '+$scope.limitData+' OFFSET '+pageOffset)
            .then(
                function (result) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if (result.rows.length > 0) {
                       // console.log(result);
                        
                        for (var i = 0; i < result.rows.length; i++) {

                            if ($scope.checkDate(result.rows.item(i).orderHistoryDate))
                            {   
                                $rootScope.searchorderList.push({'date':result.rows.item(i).orderHistoryDate,'order':[result.rows.item(i)]});    
                                cnt++;
                            } else {
                                $rootScope.searchorderList[cnt].order.push(result.rows.item(i));
                            }
                            
                        }
                       $scope.pageNum = $scope.pageNum + 1;
                    } else {
                        isloadData = false;
                    }
                },
                function (error) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $rootScope.popup = $ionicPopup.alert({
                        title: 'Error',
                        template: 'Something went wrong'
                    });
                    console.log("Error on loading: " + error.message);
                });

    }



    $scope.filterbyMonth = function (month) {
         $rootScope.orderhList = [];
         $scope.pageNumD = 0;
         $scope.orderhListLength = 0;
         $scope.data.monthfilter = month;
         $scope.loadMoreOrderDate();

    }

    $scope.loadMoreOrderDate = function() {
        $scope.limitData = 25;
        var pageOffset = 0;

            if($scope.pageNumD > 0){
               pageOffset =  $scope.pageNumD * $scope.limitData;    
            }


            var len = $scope.data.monthfilter.toString();
            len = len.length;
            var dateQuery = "";



            var cDate = new Date();
            var cmonth = cDate.getMonth();
            var pastmonth = cmonth - $scope.data.monthfilter;
            var pDate = cDate.setMonth(pastmonth);


            if(len > 3){
                var fRdate = new Date($scope.data.monthfilter+"-01-01T00:00:00");
                fRdate = fRdate.getTime();
                var tOdate = new Date($scope.data.monthfilter+"-12-31T00:00:00");
                tOdate = tOdate.getTime();
                dateQuery = 'orderHistoryNumericDate>="' + fRdate + '" AND orderHistoryNumericDate<="' + tOdate + '" ';
            }else{
                dateQuery = 'orderHistoryNumericDate>="' + pDate + '" ';
            }

            if($scope.pageNumD == 0){
                    $cordovaSQLite.execute($rootScope.DB, 'SELECT strftime("%Y-%m-%d", orderHistoryDate) histDate FROM order_history WHERE accountNumber = "' + $rootScope.mAccount.AccountNumber + '" AND '+dateQuery+' group by histDate').then(function(result){
                        $scope.orderhListLength = result.rows.length;
                    })
             }

            $cordovaSQLite.execute($rootScope.DB, 'SELECT strftime("%Y-%m-%d", orderHistoryDate) histDate FROM order_history WHERE accountNumber = "' + $rootScope.mAccount.AccountNumber + '" AND '+dateQuery+' group by histDate order by orderHistoryNumericDate DESC LIMIT '+$scope.limitData+' OFFSET '+pageOffset)
                .then(
                    function (result) {
                      
                        $ionicLoading.hide();
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        if (result.rows.length > 0) {
                            for (var i = 0; i < result.rows.length; i++) {
                                $rootScope.orderhList.push(result.rows.item(i));
                            }
                            $scope.pageNumD = $scope.pageNumD + 1;
                        } else {
                           
                            isloadData = false;
                        }
                    });

    }
 


    $scope.checkDate = function (date) {
        var Date = date;
        if ($scope.lastDate == '') {
            $scope.oldDate = "";
        }else        {
            $scope.oldDate = $scope.lastDate;
        }

        $scope.lastDate = Date;
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

    $scope.makeYear = function (year) {
        var d = new Date();
        return d.getFullYear() - year;
    }

    $rootScope.ordertoBasket = function (Id, ptitle, title, price, qty, StockQty) {
        var Title = (ptitle) ? ptitle + ' - ' + title : title;
        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdID = "' + Id + '"')
            .then(
                function (result) {
                    $ionicLoading.hide();
                    if (result.rows.length > 0) {
                        var PriceExVat = result.rows.item(0).PriceExVat;
                        var PriceIncVat = result.rows.item(0).PriceIncVat;

                        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM basket WHERE ProdID = "' + Id + '" AND UserID = '+$rootScope.mAccount.AccountId).then(function (result) {
                                $ionicLoading.hide();
                                if (result.rows.length > 0) {
                                    qty = qty + result.rows.item(0).qnt;
                                }
                                vat = (100 * (PriceIncVat - PriceExVat)) / PriceExVat;
                                $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO basket (basketID, ProdID, ProdTitle, ProdUnitPrice, qnt,stokQnt, PriceExVat, PriceIncVat, Vat, UserID) VALUES ((select basketID from basket where UserID = "'+$rootScope.mAccount.AccountId+'" AND ProdID='+Id+'),'+Id+', "'+Title+'", "'+price+'", "'+qty+'", "'+stokQnt+'", "'+PriceExVat+'", "'+PriceIncVat+'", "'+vat.toFixed(2)+'", "'+$rootScope.mAccount.AccountId+'")')                                                    
                                //$cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO basket (ProdID, ProdTitle, ProdUnitPrice, qnt, stokQnt, PriceExVat, PriceIncVat, Vat) VALUES (?,?,?,?,?,?,?,?)', [Id, Title, price, qty, stokQnt, PriceExVat, PriceIncVat, vat.toFixed(2)])
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
                                    template: 'Something went wrong'
                                });
                                console.log("Error on loading: " + error.message);
                            });
                    } else {
                        $ionicLoading.hide();
                        $rootScope.popup = $ionicPopup.alert({
                            title: 'Error',
                            template: 'No Product Found'
                        });
                    }
                });
    }


})

.controller('dateorderCtrl', function ($scope, $state, $rootScope, $filter, $ionicLoading, $cordovaSQLite, $ionicPopup) {
    scope = $scope;
    $scope.dateorderList = [];
    $scope.CurrentDate = $state.params.Date;
    $scope.BeautifyDate = moment($scope.CurrentDate).format('DD MMM YYYY')
    $scope.orderQty = [];
    $scope.showContent = [];
    $scope.canChangePrice = true;

    $scope.canChangePrice = ($scope.mUser.CustType == 1 || $scope.mUser.CustType == 2 || $scope.mUser.CustType == 3) ? false : true;

    /*$scope.dateorderList = $filter('filter')($rootScope.orderhList, {
        orderHistoryDate: $scope.CurrentDate
    }) || [];*/


    var frToday = new Date($scope.CurrentDate);
    var frTime = frToday.getTime();

    var frTom = frToday.setDate(frToday.getDate()+1);

    //$cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM order_history WHERE orderHistoryNumericDate>="'+frTime+'" AND orderHistoryNumericDate<"'+frTom+'" AND accountNumber = "' + $rootScope.mAccount.AccountNumber + '" order by orderHistoryNumericDate DESC')
    $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM order_history as h1 LEFT JOIN products as p1 ON h1.prodID = p1.ProdID WHERE h1.orderHistoryNumericDate>="'+frTime+'" AND h1.orderHistoryNumericDate<"'+frTom+'" AND h1.accountNumber = "' + $rootScope.mAccount.AccountNumber + '" order by h1.orderHistoryNumericDate DESC')
    .then(
        function (result) {
            if (result.rows.length > 0) {
                for (var i = 0; i < result.rows.length; i++) {
                    $scope.dateorderList.push(result.rows.item(i));
                }
            }
    });




    $scope.NotAvailableProduct = [];

    var cntr = 0
    var dbcntr = 0;

    $scope.allordertoBasket = function () {
        cntr = 0;
        dbcntr = 0;

        angular.forEach($scope.dateorderList, function (el, index) {

            if ($scope.orderQty[index] <= 0) {        
                return false;
            }

            $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM products WHERE ProdID = "' + el.prodID + '"')
                .then(
                    function (result) {
                        $ionicLoading.hide();
                        if (result.rows.length > 0) {
                            var StockQty = result.rows.item(0).ProdStockQty;
                            var PriceExVat = result.rows.item(0).PriceExVat;
                            var PriceIncVat = result.rows.item(0).PriceIncVat;
                            cntr++;
                            $scope.dateOrdertoBasket(el.prodID, el.parentTitle, el.prodTitle, el.unitCost, $scope.orderQty[index], StockQty, PriceExVat, PriceIncVat);
                        } else {
                            var Title = (el.parentTitle) ? el.parentTitle + ' - ' + el.prodTitle : el.prodTitle;
                            $scope.NotAvailableProduct.push(Title);
                        }
                    });
        });
    }

    $scope.dateOrdertoBasket = function (Id, ptitle, title, price, qty, StockQty, PriceExVat, PriceIncVat) {

        var Title = (ptitle) ? ptitle + ' - ' + title : title;
        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM basket WHERE ProdID = "' + Id + '" AND UserID = '+$rootScope.mAccount.AccountId).then(function (result) {
            $ionicLoading.hide();
            if (result.rows.length > 0) {
                qty = qty + result.rows.item(0).qnt;
                /*if (qty > StockQty) {
                    $rootScope.popup = $ionicPopup.alert({
                        title: 'Invalid quantity',
                        template: 'You have selected more quantity than the stock'
                    });
                    return false;
                }*/
            }
            vat = (100 * (PriceIncVat - PriceExVat)) / PriceExVat;
           // console.log(vat.toFixed(2));
            
            $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO basket (basketID, ProdID, ProdTitle, ProdUnitPrice, qnt,stokQnt, PriceExVat, PriceIncVat, Vat, UserID) VALUES ((select basketID from basket where UserID = "'+$rootScope.mAccount.AccountId+'" AND ProdID='+Id+'),'+Id+', "'+Title+'", "'+price+'", "'+qty+'", "'+StockQty+'", "'+PriceExVat+'", "'+PriceIncVat+'", "'+vat.toFixed(2)+'", "'+$rootScope.mAccount.AccountId+'")')
                .then(function (result) {
                    dbcntr++
                    if (dbcntr == cntr) {
                        $rootScope.$emit('updateBasket');
                        if (!$scope.NotAvailableProduct.length) {
                            $rootScope.popup = $ionicPopup.alert({
                                title: 'Added into basket',
                                template: 'Product has been added to basket'
                            });
                        } else {
                            $rootScope.popup = $ionicPopup.alert({
                                title: 'Error while adding',
                                template: $scope.NotAvailableProduct.toString() + ' products does not exist in data please find manually add to basket'
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
    $scope.sortby = 'ProdTitle';
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
                    template: 'Something went wrong'
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
                                    for (i = 0; i < result.rows.length; i++) {
                                        $scope.ConfigurableProduct.push(result.rows.item(i));
                                    }
                                }
                            },
                            function (error) {
                                $ionicLoading.hide();
                                $rootScope.popup = $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Something went wrong'
                                });
                                console.log("Error on loading: " + error.message);
                            });
                    if ($scope.product.ProdParentID > 0) {
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
                                        template: 'Something went wrong'
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
                    template: 'Something went wrong'
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
                                        template: 'Something went wrong'
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
                    template: 'Something went wrong'
                });
                console.log("Error on loading: " + error.message);
            });

    $scope.goBack = function () {
        $ionicHistory.goBack();
    }

    $scope.addtoBasket = function (productForm,Id, title, price, qty, StockQty, PriceExVat, PriceIncVat) {
        
        if(productForm.$invalid)
        {
            return true;
        }
        
        var Title = ($scope.ParentProduct.ProdTitle) ? $scope.ParentProduct.ProdTitle + ' - ' + title : title;
        if($rootScope.mAccount == null || $rootScope.mAccount == ''){
            $rootScope.popup = $ionicPopup.alert({
                title: 'Account not selected',
                template: 'Please select account'
            });
            return false;
        }

        if (!qty) {
           // console.log("qty :");
          //  console.log(qty);
            $rootScope.popup = $ionicPopup.alert({
                title: 'Add quantity ',
                cssClass: 'popup-error',
                template: 'Please add quantity 1 or more to add product into basket'
            });
            return false;
        }


        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM basket WHERE ProdID = "' + Id + '" AND UserID = '+$rootScope.mAccount.AccountId)
            .then(
                function (result) {
                    $ionicLoading.hide();             
                    vat = (100 * (PriceIncVat - PriceExVat)) / PriceExVat;
                    $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO basket (basketID, ProdID, ProdTitle, ProdUnitPrice, qnt,stokQnt, PriceExVat, PriceIncVat, Vat, UserID) VALUES ((select basketID from basket where UserID = "'+$rootScope.mAccount.AccountId+'" AND ProdID='+Id+'),'+Id+', "'+Title+'", "'+price+'", "'+qty+'", "'+StockQty+'", "'+PriceExVat+'", "'+PriceIncVat+'", "'+vat.toFixed(2)+'", "'+$rootScope.mAccount.AccountId+'")')                    
                    //$cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO basket (ProdID, ProdTitle, ProdUnitPrice, qnt,stokQnt, PriceExVat, PriceIncVat, Vat, UserID) VALUES (?,?,?,?,?,?,?,?,?)', [Id, Title, price, qty, StockQty, PriceExVat, PriceIncVat, vat.toFixed(2), $rootScope.mAccount.AccountId])
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
                        template: 'Something went wrong'
                    });
                    console.log("Error on loading: " + error.message);
                });
    }

    $scope.swichProduct = function (Id) {
        if (typeof Id == 'undefined') {
            return false;
        }
        $state.go('app.tab.product', {
            'Id': Id
        })
    }
});