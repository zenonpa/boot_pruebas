var myApp = angular.module('myApp', []);

//  Force AngularJS to call our JSON Web Service with a 'GET' rather than an 'OPTION' 
//  Taken from: http://better-inter.net/enabling-cors-in-angular-js/
myApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

myApp.filter('sumByKey', function () {
    return function (data, key) {
        if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
            return 0;
        }
        var sum = 0;
        for (var i = data.length - 1; i >= 0; i--) {
            sum += parseInt(data[i][key]);
        }
        return sum;
    };
})

myApp.filter('customSum', function () {
    return function (listOfProducts, key) {
        //  Count how many items are in this order
        var total = 0;
        angular.forEach(listOfProducts, function (product) {
//            alert(product + "." + key);
            total += eval("product." + key);
        });
        return total;
    }
});

myApp.filter('countItemsInOrder', function () {
    return function (listOfProducts) {
        //  Count how many items are in this order
        var total = 0;
        angular.forEach(listOfProducts, function (product) {
            total += product.Quantity;
        });
        return total;
    }
});

myApp.filter('orderTotal', function () {
    return function (listOfProducts) {
        //  Calculate the total value of a particular Order
        var total = 0;
        angular.forEach(listOfProducts, function (product) {
            total += product.Quantity * product.UnitPrice;
        });
        return total;
    }
});

myApp.controller('MasterDetailCtrl',
    function ($scope, $http) {

        //  We'll load our list of Customers from our JSON Web Service into this variable
        $scope.listOfCustomers = null;

        //  When the user selects a "Customer" from our MasterView list, we'll set the following variable.
        $scope.selectedCustomer = null;

        $http.get('http://inorthwind.azurewebsites.net/Service1.svc/getAllCustomers')

            .success(function (data) {
                $scope.listOfCustomers = data.GetAllCustomersResult;

                if ($scope.listOfCustomers.length > 0) {

                    //  If we managed to load more than one Customer record, then select the first record by default.
                    //  This line of code also prevents AngularJS from adding a "blank" <option> record in our drop down list
                    //  (to cater for the blank value it'd find in the "selectedCustomer" variable)
                    $scope.selectedCustomer = $scope.listOfCustomers[0].CustomerID;

                    //  Load the list of Orders, and their Products, that this Customer has ever made.
                    $scope.loadOrders();
                }
            })
            .error(function (data, status, headers, config) {
                $scope.errorMessage = "Couldn't load the list of customers, error # " + status;
            });
    
        $scope.selectCustomer = function (val) {
            //  If the user clicks on a <div>, we can get the ng-click to call this function, to set a new selected Customer.
            $scope.selectedCustomer = val.CustomerID;
            $scope.loadOrders();
        }

        $scope.loadOrders = function () {
            //  Reset our list of orders  (when binded, this'll ensure the previous list of orders disappears from the screen while we're loading our JSON data)
            $scope.listOfOrders = null;

            //  The user has selected a Customer from our Drop Down List.  Let's load this Customer's records.
            $http.get('http://inorthwind.azurewebsites.net/Service1.svc/getBasketsForCustomer/' + $scope.selectedCustomer)
                    .success(function (data) {
                        $scope.listOfOrders = data.GetBasketsForCustomerResult;
                    })
                    .error(function (data, status, headers, config) {
                        $scope.errorMessage = "Couldn't load the list of Orders, error # " + status;
                    });
        }
    });
