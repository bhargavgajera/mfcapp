angular.module('starter.controllers', [])
    .controller('menuCtrl', function ($scope, $rootScope, $ionicScrollDelegate, $ionicLoading, $http, $filter, $ionicHistory, $ionicViewService, $cordovaSQLite, $document, $cordovaNetwork, $ionicPopup, $state, $cordovaToast,$timeout) {

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
        $scope.innerSync = false;
        $rootScope.headers = {headers:{
            'Accept':'application/json', 'Content-Type':'application/json', 'Authorization':'Bearer 2WsLcqqcjxJ6HYk5RwJkSYm9KICe1gF_HLVS1BFUnBGXwyCCSTnQLaRaCgrGnez3K6YbEu_XZuimbG3U5JnTJktOumcm5sGk_2BeChMKYtOBM-XMCyiHLGx-TXSgsW6-18g-pH2vi_uX1SrLTkIPBZ4M5qSbwaXm8iKSX_gUgHikVX7XFKeuCfLz2gXhNx2StudtagaHXiKPouWaHVkfRcHm1QV_NowbPuBsn7X4Ns3oGhl-tlnV1CsrwUAMZRxr3-itz4oVbWz3WHlShOvlB4ZwZSp3X8rMLZ5qCD5NmCDpl6lOY94KBsU3d-rpiJrcciEwmOP-SpMQ6RSZr2yIQ1_7HJ6vCfBm9rbNulNqD6KSD1YZjAFdkMz29q1exGeVpSmnH_GCXSGrThkVWCV2FivBmXrI-Ot_kJY0L7yQT86rxXp0OKpbDRNFXyR7WNBU75QVLkR70se9fHmTn0WNZxiU8fpDc-E1pj9p-W8WXtE'}}

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


        $rootScope.logout = function () {
            $state.go('login', {}, {
                location: 'replace'
            });
            $timeout(function () {
                window.localStorage.removeItem("mUser");
                window.localStorage.removeItem("mAccount");
                $ionicHistory.clearCache();
                $ionicViewService.clearHistory();
            }, 30);
        }

        $scope.calcPrice = function () {
            var price;
            $rootScope.totalPrice = 0;
            $rootScope.totalVat = 0;

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
            });

        }

        $scope.checkDate = function(){
          //  console.log($rootScope)
            
            var cDate = new Date(Number($rootScope.lastsyncDate)).getDate();
            var futureDate = new Date(Number($rootScope.lastsyncDate)).setDate(cDate+7);

            // console.log(futureDate)
           // console.log(Number($rootScope.lastsyncDate))
            if (futureDate < new Date().getTime() )
            {
                return true;
            }else
            {
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
                template: 'data synicing failed, please check you internet connection and try again'
            });

            angular.forEach($rootScope.syncObj, function (el, index) {
                el.sync = false;
            });

        }



        $scope.getToken = function(){
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

                console.log(result);
                window.localStorage.setItem("mfcToken", result.access_token);


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
                                        },
                                        function (error) {
                                            $scope.syncError(error);
                                        });
                                })
                            } else {
                                //$rootScope.syncObj[0].sync = 'done';
                                //$scope.loadContacts();
                            }

                        });
                    } else {
                        //$rootScope.syncObj[0].sync = 'done';
                        //$scope.loadContacts();
                    }
                })
        }




        $scope.loadContacts = function () {
            console.log($scope.innerSync);
            if ($scope.innerSync) {
                
                $rootScope.syncObj.push({title:'Accounts',sync:false},{title:'Orderhistory',sync:false});

                ionicLoading.show({
                    templateUrl: 'templates/syncpopup.html'
                });
            }
            var currentDate = new Date();
            var curTimeLog = currentDate.getTime(); 
            $rootScope.syncObj[0].sync = true;
            
            $cordovaSQLite.execute($rootScope.DB, 'SELECT insertedLog FROM syncLog where apiName="Contacts"')
                .then(function (result) {
                    if(result.rows.length > 0){
                        if((Math.abs(curTimeLog - result.rows.item(0).insertedLog) / 3600000) > 10){
                           $scope.callContacts(1);
                        }else{
                            $scope.callContacts(0);
                        }

                    }else{
                        $scope.callContacts(1);
                    }
            })

           $scope.callContacts = function(updateTb)
           {
                if(updateTb == 1){
                        
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
                            $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO syncLog(ID,apiName,insertedDate,insertedLog,acType,acId) VALUES((select ID from syncLog where apiName = "Contacts"),"Contacts","'+currentDate+'","'+curTimeLog+'",0,0)');
                            $rootScope.syncObj[0].sync = 'done';
                            $scope.loadProducts();


                        },
                        function (error) {
                            $scope.syncError(error);
                    })
                }else{
                            $rootScope.syncObj[0].sync = 'done';
                            $scope.loadProducts();
                }
           }   
            

        }


        



        $scope.loadProducts = function () {
            var currentDate = new Date();
            var curTimeLog = currentDate.getTime(); 
            $rootScope.syncObj[1].sync = true;

            
            $cordovaSQLite.execute($rootScope.DB, 'SELECT insertedLog FROM syncLog where apiName="Products"')
                .then(function (result) {
                    if(result.rows.length > 0){
                        if((Math.abs(curTimeLog - result.rows.item(0).insertedLog) / 3600000) > 10){
                            $scope.callProducts(1);   
                        }else{
                             $scope.callProducts(0);
                        }
                    }else{
                        $scope.callProducts(1);
                    }
            })
            $scope.callProducts = function(updateTb)
            {
                if(updateTb == 1){
                    
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
                            $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO syncLog(ID,apiName,insertedDate,insertedLog,acType,acId) VALUES((select ID from syncLog where apiName = "Products"),"Products","'+currentDate+'","'+curTimeLog+'",0,0)');
                            $rootScope.syncObj[1].sync = 'done';
                            $scope.loadCategory();


                        },
                        function (error) {
                            $scope.syncError(error);
                        });
                }else{
                    $rootScope.syncObj[1].sync = 'done';
                    $scope.loadCategory();
                } 
          }         
        }




        $scope.loadCategory = function () {
            var currentDate = new Date();
            var curTimeLog = currentDate.getTime(); 

            $rootScope.syncObj[2].sync = true;
            
            $cordovaSQLite.execute($rootScope.DB, 'SELECT insertedLog FROM syncLog where apiName="Category"')
                .then(function (result) {
                    if(result.rows.length > 0){
                        if((Math.abs(curTimeLog - result.rows.item(0).insertedLog) / 3600000) > 10){
                          $scope.callCategory(1);     
                        }else{
                            $scope.callCategory(0);
                        }
                    }else{
                        $scope.callCategory(1);
                    }
            })
            $scope.callCategory = function(updateTb)
            {
                    if(updateTb == 1){
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
                                $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO syncLog(ID,apiName,insertedDate,insertedLog,acType,acId) VALUES((select ID from syncLog where apiName = "Category"),"Category","'+currentDate+'","'+curTimeLog+'",0,0)');
                                $scope.prepareMenu(subMenu);
                                $rootScope.syncObj[2].sync = 'done';

                                $scope.loadRelatedproducts()

                            },
                            function (error) {
                                $scope.syncError(error);
                            });
                    }else{
                            
                                
                            $rootScope.syncObj[2].sync = 'done';
                            $scope.loadRelatedproducts();
                            
                    }
            }            

        }

        $scope.loadRelatedproducts = function () {
            var currentDate = new Date();
            var curTimeLog = currentDate.getTime(); 

            $cordovaSQLite.execute($rootScope.DB, 'DROP TABLE relatedproducts');

                $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS relatedproducts(prodID INTEGER, relatedID INTEGER, relatedIsAccessory TEXT, relatedProdID INTEGER)');

            $rootScope.syncObj[3].sync = true;
            
            $cordovaSQLite.execute($rootScope.DB, 'SELECT insertedLog FROM syncLog where apiName="Relatedproducts"')
                .then(function (result) {
                    if(result.rows.length > 0){
                        if((Math.abs(curTimeLog - result.rows.item(0).insertedLog) / 3600000) > 10){
                           $scope.callRelatedProducts(1);
                        }else{
                            $scope.callRelatedProducts(0);
                        }
                    }else{
                        $scope.callRelatedProducts(1);
                    }
            })


                var cnt = 0;
            $scope.callRelatedProducts = function(updateTb)
            {
                   if(updateTb == 1){
                        $http.get('http://mfcapi.radiatordedicated.co.uk/api/relatedproducts',$rootScope.headers).then(function (relatedproducts) {
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
                                $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO syncLog(ID,apiName,insertedDate,insertedLog,acType,acId) VALUES((select ID from syncLog where apiName = "Relatedproducts"),"Relatedproducts","'+currentDate+'","'+curTimeLog+'",0,0)');
                                //$scope.loadOrderhistory();
                                if ($scope.innerSync) {
                                    $rootScope.syncObj[3].sync = 'done';
                                    $scope.loadAccounts();
                                }else{
                                    $rootScope.syncObj[3].sync = 'done';
                                    $ionicLoading.hide();
                                }
                                var sDate = new Date().getTime();
                                window.localStorage.setItem("syncDate",sDate);

                            },
                            function (error) {
                                $scope.syncError(error);
                            });
                 }else{
                    if ($scope.innerSync) {
                        $rootScope.syncObj[3].sync = 'done';
                        $scope.loadAccounts();
                    }else{
                        $rootScope.syncObj[3].sync = 'done';
                        $ionicLoading.hide();
                    }    
                 }
             }
        }




        $scope.loadAccounts = function (){
                if ($scope.innerSync) {
                    $rootScope.syncObj[4].sync = true;
                }
                
                var queryUrl = '';
                var currentDate = new Date();
                var curTimeLog = currentDate.getTime(); 
                var UserId = $rootScope.mUser.Id;
                $rootScope.syncUserObj[0].sync = true;
                if ($rootScope.mUser.CustType == 7){
                    var ID = $rootScope.mUser.RelatedAccountNumber;
                    queryUrl = 'http://mfcapi.radiatordedicated.co.uk/api/Accounts?AccountID='+ID;
                } else if($rootScope.mUser.CustType == 3){
                        var ID = $rootScope.mUser.CustRepTerritory;
                        queryUrl = 'http://mfcapi.radiatordedicated.co.uk/api/Accounts?TerritoryID='+ID;
                }
                
                $cordovaSQLite.execute($rootScope.DB, 'SELECT insertedLog FROM syncLog where apiName="Accounts" and acId = '+UserId)
                    .then(function (result) {
                        if(result.rows.length > 0){
                            if((Math.abs(curTimeLog - result.rows.item(0).insertedLog) / 3600000) > 10){
                               $scope.callAccounts(1);
                            }else{
                                $scope.callAccounts(0);
                            }
                        }else{
                            $scope.callAccounts(1);
                        }
                });

                $scope.callAccounts = function(updateTb){
                    if(updateTb == 1){
                        
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
                                        console.log('-----acounts-------');
                                        console.log(el)
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
                                            console.log(result);
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
                            });
                    }
                    else
                    {
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
            if ($scope.innerSync) {
                $rootScope.syncObj[5].sync = true;
            }            
            $rootScope.syncUserObj[1].sync = true;

            console.log('Orderhistory');
            var currentDate = new Date();
            var curTimeLog = currentDate.getTime(); 
            var UserId = $rootScope.mUser.Id;
            
            if ($rootScope.mUser.CustType == 7){
                var ID = $rootScope.mUser.RelatedAccountNumber;
                queryUrl = 'http://mfcapi.radiatordedicated.co.uk/api/OrderHistory?AccountID='+ID;
            } else if($rootScope.mUser.CustType == 3){
                var ID = $rootScope.mUser.CustRepTerritory;
                queryUrl = 'http://mfcapi.radiatordedicated.co.uk/api/OrderHistory?TerritoryID='+ID;
            }

            $cordovaSQLite.execute($rootScope.DB, 'SELECT insertedLog FROM syncLog where apiName="Orderhistory" and acId = '+UserId)
                .then(function (result) {
                    if(result.rows.length > 0){
                        if((Math.abs(curTimeLog - result.rows.item(0).insertedLog) / 3600000) > 10){
                           $scope.callOrderhistory(1);
                        }else{
                            $scope.callOrderhistory(0);
                        }
                    }else{
                        $scope.callOrderhistory(1);
                    }
            });


            var cnt = 0;
            $scope.callOrderhistory = function(updateTb){
                if(updateTb == 1){
                    $cordovaSQLite.execute($rootScope.DB, 'DROP TABLE order_history');
                    $cordovaSQLite.execute($rootScope.DB, 'CREATE TABLE IF NOT EXISTS order_history (OrderHistoryID INTEGER PRIMARY KEY AUTOINCREMENT, costPrice REAL, operaCostPrice REAL, unitCost REAL, accountNumber TEXT, orderHistoryTitle TEXT, prodID INTEGER, prodTitle TEXT, prodPrice REAL, orderHistoryDate TEXT, prodHidePrice TEXT, prodStockQty INTEGER, parentTitle TEXT, quantity INTEGER, orderHistoryNumericDate INTEGER)');


                    
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
                                var query = "INSERT INTO order_history (OrderHistoryID, costPrice, operaCostPrice, unitCost, accountNumber, orderHistoryTitle, prodID, prodTitle, prodPrice, orderHistoryDate, prodHidePrice, prodStockQty, parentTitle, quantity,orderHistoryNumericDate) VALUES ";
                                var data = [];
                                var rowArgs = [];
                                angular.forEach(temparray, function (el, index) {
                                    rowArgs.push("(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
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
                                });
                                query += rowArgs.join(", ");
                               var  $nCnt = 0;
                                $cordovaSQLite.execute($rootScope.DB, query, data).then(function (result) {
                                    $nCnt = $nCnt + chunk;
                                    if ($nCnt >= $scope.orderHistory.length) {
                                        $cordovaSQLite.execute($rootScope.DB, 'INSERT OR REPLACE INTO syncLog(ID,apiName,insertedDate,insertedLog,acType,acId) VALUES((select ID from syncLog where apiName = "Orderhistory" and acId = '+UserId+'),"Orderhistory","'+currentDate+'","'+curTimeLog+'",0,'+UserId+')');
                                        if ($scope.innerSync) {
                                            $rootScope.syncObj[5].sync = 'done';
                                            $ionicLoading.hide();
                                        }else{
                                            $rootScope.syncUserObj[1].sync = 'done';
                                            $ionicLoading.hide();
                                            $state.go('app.tab.accounts', {
                                                location: false
                                            });                                            
                                        }

                                    }
                                }, function (err) {
                                    console.log("Error on saving: " + err.message);
                                });
                            }

                        },
                        function (error) {
                            $scope.syncError(error);
                        });
                }else{
                    if ($scope.innerSync) {
                        $rootScope.syncObj[5].sync = 'done';
                        $ionicLoading.hide();
                        $rootScope.syncObj.splice($rootScope.syncObj.indexOf(4), 1);
                        $rootScope.syncObj.splice($rootScope.syncObj.indexOf(5), 1);
                    }else{
                        $rootScope.syncUserObj[1].sync = 'done';
                        $ionicLoading.hide();
                        $state.go('app.tab.accounts', {
                            location: false
                        });
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
            if($rootScope.mAccount != null && $rootScope.mAccount !=  ''){
                $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM basket WHERE UserID = '+$rootScope.mAccount.AccountId)
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
            }else{
                     $ionicLoading.hide();
                     $rootScope.basketBadge = 0;
            }
            
        });
        $scope.$on('syncStart', function (event, args) {
            $scope.innerSync = args.innerSync;
            if ($cordovaNetwork.isOnline()) {
                if ($scope.innerSync) {
                    $rootScope.popup = $ionicPopup.show({
                        title: '<h4 class="positive">Full sync takes time</h4>',
                        template: 'Full sync takes time do you want to continue the sync proccess ?',
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
                    template: 'Sorry, no Internet Connectivity detected. Please reconnect and try again.'
                });
            }
        });

              

        $scope.startinnerSyncing = function () {
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
                                $scope.loadContacts();
                            }
                      }
                    ]
                });
            } else {
                $scope.loadContacts();
            }
        }


        

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


.controller('syncUserCtrl', function ($scope, $state, $rootScope, $ionicPopup, $ionicLoading, $filter, $cordovaSQLite, $cordovaKeyboard, $ionicHistory) {
    root = $rootScope;
    scope = $scope;
    $ionicLoading.hide();
    angular.forEach($rootScope.syncUserObj, function (el, index) {
        el.sync = false;
    });
    $scope.loadAccounts();
   
})
.controller('loginCtrl', function ($scope, $state, $rootScope, $ionicPopup, $ionicLoading, $filter, $cordovaSQLite, $cordovaKeyboard, $ionicHistory) {


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
                           

                                var UserId = $rootScope.mUser.Id;
                                $cordovaSQLite.execute($rootScope.DB, 'SELECT insertedLog FROM syncLog where (apiName="Accounts" OR apiName="Orderhistory") and acId = '+UserId)
                                    .then(function (result) {
                                        if(result.rows.length > 0){
                                            for(var pt=0;pt<result.rows.length;pt++){
                                                if((Math.abs(curTimeLog - result.rows.item(pt).insertedLog) / 3600000) > 10){
                                                    $state.go('syncuserdata', {
                                                            location: false
                                                        });
                                                }else
                                                {
                                                     $state.go('app.tab.accounts', {
                                                            location: false
                                                     });
                                                }
                                            }
                                        }else{

                                            $state.go('syncuserdata', {
                                                location: false
                                            });

                                        }
                                });
                        
                        //var hash = bcrypt.hashSync(Password, User.SaltUsed);
                        //if (hash == User.Password) {
                        
                        /*var User = result.rows.item(0);
                        if (bcrypt.compareSync(Password, User.Password))
                        {
                            $ionicLoading.hide();
                            $cordovaKeyboard.close();

                            $ionicHistory.clearHistory();
                            $ionicHistory.clearCache();
                            $rootScope.mUser = User;
                            window.localStorage.setItem("mUser", JSON.stringify($rootScope.mUser));
                            window.localStorage.removeItem("mAccount");
                            $rootScope.mAccount = "";
                            
                             var UserId = $rootScope.mUser.Id;
                                $cordovaSQLite.execute($rootScope.DB, 'SELECT insertedLog FROM syncLog where (apiName="Accounts" OR apiName="Orderhistory") and acId = '+UserId)
                                    .then(function (result) {
                                        if(result.rows.length > 0){
                                            for(var pt=0;pt<result.rows.length;pt++){
                                                if((Math.abs(curTimeLog - result.rows.item(pt).insertedLog) / 3600000) > 10){
                                                    $state.go('syncuserdata', {
                                                            location: false
                                                        });
                                                }else
                                                {
                                                     $state.go('app.tab.accounts', {
                                                            location: false
                                                     });
                                                }
                                            }
                                        }else{

                                            $state.go('syncuserdata', {
                                                location: false
                                            });

                                        }
                                });

                        } else {
                            $ionicLoading.hide();
                            $cordovaKeyboard.close();
                            
                            $rootScope.popup = $ionicPopup.alert({
                                title: 'Wrong Password',
                                template: 'Incorrect details please check password'
                            });
                       }*/
                    } else {
                        $ionicLoading.hide();
                        $rootScope.popup = $ionicPopup.alert({
                            title: 'Error',
                            template: 'Incorrect details please check email and password'
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

        $cordovaSQLite.execute($rootScope.DB, 'INSERT INTO cart(custID, accountNumber, orderDate, orderTotal, orderDeliveryTotal, orderShipSameAsBilling, orderShipCompany, orderShipTitle, orderShipFirstname, orderShipSurname, orderShipHouseNameNo, orderShipAddress1, orderShipAddress2, orderShipCity, orderShipCounty, orderShipPostcode, orderShipTelephone, orderShipMobile, orderShipFax, orderDelInstr1, orderGiftWrap,orderGiftWrapMessage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [$rootScope.mUser.Id, $rootScope.mAccount.AccountNumber, stringDate, $rootScope.totalPrice, $rootScope.totalPrice, 0, $rootScope.mAccount.AccountCompany, DeliveryTitle, FirstName, Surname, DeliveryHouseName, DeliveryAddressLine1, DeliveryAddressLine2, DeliveryTown, DeliveryCountry, DeliveryPostcode, Telephone, Mobile, '', '', 0, ''])
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

.controller('searchproCtrl', function ($scope, $rootScope, $cordovaSQLite, $ionicPopup, $ionicLoading, $cordovaKeyboard) {
    scope = $scope;
    root = $rootScope;
    $scope.productSearch = '';
    $scope.searchproductList;
    $scope.searchWordList = '';
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
                template: 'Somthing went wrong'
            });
            console.log("Error on loading: " + error.message);
        });    

    $scope.searchProduct = function (searchtext) {
        if (searchtext != '') {
            $scope.productSearch = searchtext;

            $cordovaKeyboard.close()

            $ionicLoading.show({
                template: '<img src="img/loader.gif">'
            });

            $cordovaSQLite.execute($rootScope.DB, 'INSERT INTO searchText (word) VALUES("'+searchtext+'")');

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

.controller('myaccountCtrl', function ($scope, $rootScope, $state, $timeout, $ionicHistory, $ionicViewService) {

})

.controller('accountdetailCtrl', function ($scope, $rootScope, $state) {
    state = $state;
    scope = $scope;
    $scope.accountPage = $state.current.url.replace("/", "");
})

.controller('accountsCtrl', function ($rootScope, $scope, $ionicLoading, $ionicPopup, $http, $state, $filter, $timeout, $cordovaSQLite, $ionicPlatform, $cordovaKeyboard, $ionicScrollDelegate) {
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
   
    if(typeof($rootScope.DB) == 'undefined'){
         $timeout(function() {
             $scope.loadMore();
          }, 2000);
    }
   
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
                                $scope.pageNum = $scope.pageNum + 1;
                            }else{
                                $scope.noMoreItemsAvailable = false;
                            }
                        },
                        function (error) {
                            $ionicLoading.hide();
                            $scope.noMoreItemsAvailable = false;
                            $rootScope.popup = $ionicPopup.alert({
                                title: 'Error',
                                template: 'Somthing went wrong'
                            });
                            console.log("Error on loading: " + error.message);
                    });
            }
    
    }

    $scope.accountFilter = function (searchtext) {
        
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
                            template: 'Somthing went wrong'
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

        if($rootScope.basketBadge > 0 && account.AccountId != oldAccount.AccountId ){
              var confirmPopup = $ionicPopup.confirm({
                 title: 'Switch Basket',
                 template: 'Are you want to switch basket from '+oldAccount.AccountCompany,
                 scope: $scope,
                  buttons: [
                    {  
                        text: 'Ignore',
                        onTap: function(e) {
                             $rootScope.$emit('updateBasket');
                        }
                     },
                    {
                        text: '<b>Continue</b>',
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

                }, 500);

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
                    template: 'Somthing went wrong'
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
        //console.log('SELECT * FROM order_history WHERE (prodTitle LIKE "'+$scope.searchtext+'%" OR prodTitle LIKE  "%'+$scope.searchtext+'%") and accountNumber = "' + $rootScope.mAccount.AccountNumber + '" ORDER BY orderHistoryNumericDate DESC LIMIT '+$scope.limitData+' OFFSET '+pageOffset);

        $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM order_history WHERE (prodTitle LIKE "'+$scope.searchtext+'%" OR prodTitle LIKE  "%'+$scope.searchtext+'%") and accountNumber = "' + $rootScope.mAccount.AccountNumber + '" ORDER BY orderHistoryNumericDate DESC LIMIT '+$scope.limitData+' OFFSET '+pageOffset)
            .then(
                function (result) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if (result.rows.length > 0) {
                        console.log(result);
                        
                        for (var i = 0; i < result.rows.length; i++) {
                            //var arVal = [{'date':result.rows.item(i).orderHistoryDate,'value':result.rows.item(i)}];

                            if ($scope.checkDate(result.rows.item(i).orderHistoryDate))
                            {   
                                $rootScope.searchorderList.push({'date':result.rows.item(i).orderHistoryDate,'order':[result.rows.item(i)]});    
                                cnt++;
                            }
                            else
                            {
                                $rootScope.searchorderList[cnt].order.push(result.rows.item(i));
                            }
                            
                        }
                       $scope.pageNum = $scope.pageNum + 1;
                    } else {
                        //$rootScope.orderhList = [];
                        isloadData = false;
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
                var fRdate = new Date("01/01/"+$scope.data.monthfilter);
                fRdate = fRdate.getTime();
                var tOdate = new Date("12/31/"+$scope.data.monthfilter);
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
             //console.log('SELECT strftime("%Y-%m-%d", orderHistoryDate) histDate FROM order_history WHERE accountNumber = "' + $rootScope.mAccount.AccountNumber + '" AND '+dateQuery+' group by histDate order by orderHistoryNumericDate DESC LIMIT '+$scope.limitData+' OFFSET '+pageOffset);   

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
                                    template: 'Somthing went wrong'
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

    $cordovaSQLite.execute($rootScope.DB, 'SELECT * FROM order_history WHERE orderHistoryNumericDate>="'+frTime+'" AND orderHistoryNumericDate<"'+frTom+'" AND accountNumber = "' + $rootScope.mAccount.AccountNumber + '" order by orderHistoryNumericDate DESC')
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

            //if ($scope.orderQty[index] <= 0) {
            if ($scope.dateorderList[index].prodStockQty <= 0) {
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
                if (qty > StockQty) {
                    $rootScope.popup = $ionicPopup.alert({
                        title: 'Invalid quantity',
                        template: 'You have selected more quantity than the stock'
                    });
                    return false;
                }
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
                                template: $scope.NotAvailableProduct.toString() + ' products does not exist in data please find manuly add to basket'
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
                                    for (i = 0; i < result.rows.length; i++) {
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

    $scope.addtoBasket = function (Id, title, price, qty, StockQty, PriceExVat, PriceIncVat) {
        var Title = ($scope.ParentProduct.ProdTitle) ? $scope.ParentProduct.ProdTitle + ' - ' + title : title;


        if (!qty) {
            console.log("qty :");
            console.log(qty);
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
                    if (result.rows.length > 0) {
                        qty = qty + result.rows.item(0).qnt;
                        if (qty > StockQty) {
                            $rootScope.popup = $ionicPopup.alert({
                                title: 'Invalid quantity',
                                template: 'You have selected more quantity than the stock'
                            });
                            return false;
                        }
                    }
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
                        template: 'Somthing went wrong'
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