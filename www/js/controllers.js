angular.module('starter.controllers', [])
.filter('currency', function () {
    return function (input) {
        if (input === '') {
            return '';
        }
        return '$ ' + parseFloat(input).toFixed(2); 
    };
})
.controller('DashCtrl', function($scope, $rootScope, fireBaseData, $ionicModal, $ionicPopup, $state, friends, expenses) {
    
    $scope.getTotalIOwe = function () {
        var total = 0;
        $scope.expenses.forEach(function (item) {
            if (item.withFriends.indexOf($rootScope.authUser.password.email) >= 0) {
                if (item.cost < 0 && item.withFriends.length === 1) {
                    total += item.cost;
                } else {
                    total += item.cost / (item.withFriends.length + 1);
                }
            }
        });
        return total.toFixed(2);
    };
    $scope.getTotalTheyOweMe = function () {
        var total = 0;
        $scope.expenses.forEach(function (item) {
            if (item.by === $rootScope.authUser.password.email) {
                if (item.cost < 0 && item.withFriends.length === 1) {
                    total += item.cost;
                } else {
                    total += item.cost / (item.withFriends.length + 1);
                }
            }
        });
        return total.toFixed(2);
    };

    $scope.expenses = expenses.list;
    $scope.expenses.$loaded().then(function () {
        $scope.totalIOwe = $scope.getTotalIOwe();
        $scope.totalTheyOweMe = $scope.getTotalTheyOweMe();

        friends.ready(function () {
            $scope.friends = friends.getFriends($rootScope.authUser.password.email);
        });
    });
    $scope.expenses.$watch(function () {
        $scope.totalIOwe = $scope.getTotalIOwe();
        $scope.totalTheyOweMe = $scope.getTotalTheyOweMe();

        friends.ready(function () {
            $scope.friends = friends.getFriends($rootScope.authUser.password.email);
        });
    });
    $scope.totalIOwe = '';
    $scope.totalTheyOweMe = '';
    $scope.newExpense = {
        cost: '',
        comment: '',
        withFriends: []
    };
    $ionicModal.fromTemplateUrl('templates/modal-addexpense.html', {
        scope: $scope,
        animation: 'slide-in-up',
        cache: false
    }).then(function(modal) {
        $scope.expenseModal = modal;
    });
    $scope.openExpenseModal = function () {
        $scope.expenseModal.show();
    };
    $scope.addExpense = function () {
        var withFriends = [];
        if (isNaN($scope.newExpense.cost)) {
            $ionicPopup.alert({
             title: 'Wrong data',
             template: 'Cost should be a number'
            });
        } else if ($scope.newExpense.cost <= 0.01) {
            $ionicPopup.alert({
             title: 'Wrong data',
             template: 'Cost should be greater than zero'
            });
        } else {
            $scope.friends.forEach(function (friend) {
                if (friend.isChecked) {
                    withFriends.push(friend.email);
                }
            });
            if (withFriends.length === 0) {
                $ionicPopup.alert({
                 title: 'Wrong data',
                 template: 'At least one friend should be selected!'
                });
            } else {
              $scope.expenses.$add({
                timestamp: Math.floor(Date.now()/1000),
                by: $rootScope.authUser.password.email,
                comment: $scope.newExpense.comment,
                cost: $scope.newExpense.cost,
                withFriends: withFriends
              });
              $scope.newExpense.cost = '';
              $scope.newExpense.comment = '';
              $scope.expenseModal.hide();
            }
        }
    };
    $scope.showFriend = function (friend) {
        $rootScope.selectedFriend = friend;
        $state.go('tab.friend');
    };
    $scope.getFriendTotalDebt = function (friend) {
        var total = 0;
        $scope.expenses.forEach(function (item) {
            if (item.by === $rootScope.authUser.password.email &&
                item.withFriends.indexOf(friend.email) >= 0) {
                    if (item.cost < 0 && item.withFriends.length === 1) {
                        total += item.cost;
                    } else {
                        total += item.cost / (item.withFriends.length + 1);
                    }
            }
        });
        return total;
    };
})
.controller('FriendsCtrl', function ($scope, $rootScope, $state, fireBaseData, friends, $ionicModal, $ionicPopup, users) {

    $scope.user = fireBaseData.ref().getAuth();

    friends.ready(function () {
        $scope.friends = friends.getFriends($rootScope.authUser.password.email);
    });

    $scope.showFriend = function (friend) {
        $rootScope.selectedFriend = friend;
        $state.go('tab.friend');
    };

    $scope.newFriend = {
        email: ''
    };

    $ionicModal.fromTemplateUrl('templates/modal-addfriend.html', {
        scope: $scope,
        animation: 'slide-in-up',
        cache: false
    }).then(function(modal) {
        $scope.addFriendModal = modal;
    });

    $scope.openAddFriendModal = function () {
        $scope.addFriendModal.show();
    };

    $scope.addFriend = function () {
        var friendEmail = $scope.newFriend.email.trim(),
            user = [];
        if (friendEmail === '') {
            $ionicPopup.alert({
             title: 'Wrong data',
             template: 'E-mail address should be specified'
            });
        } else {
            user = users.getByEmail(friendEmail);
            if (!user) {
                $ionicPopup.alert({
                 title: 'Wrong data',
                 template: 'User with this e-mail doesn\'t exists!'
                });
            } else if (user.email === $rootScope.authUser.password.email) {
                $ionicPopup.alert({
                 title: 'Wrong data',
                 template: 'Cannot add yourself as a friend!'
                });
            } else {
                friends.list.$add({
                    user_email: $rootScope.authUser.password.email,
                    friend: {
                        email: friendEmail,
                        name: user.name
                    }
                });
                $scope.friends.push({
                    email: friendEmail,
                    name: user.name
                });
                $scope.newFriend.email = '';
                $scope.addFriendModal.hide();
            }
        }
    };
})
.controller('FriendCtrl', function ($rootScope, $scope, fireBaseData, $state, $ionicModal, $ionicPopup, $ionicHistory, $ionicNavBarDelegate, friends, expenses) {
    $scope.friend = $rootScope.selectedFriend;
    if (!$rootScope.selectedFriend) {
        $ionicHistory.nextViewOptions({
            historyRoot: true,
            disableAnimate: true
        });
        $state.go('tab.friends');
    }
    $scope.expenses = expenses.list;
    $scope.expenses.$loaded().then(function () {
        $scope.totalIOweHim = $scope.getTotalIOweHim();
        $scope.totalHeOwesMe = $scope.getTotalHeOwesMe();
    });
    $scope.expenses.$watch(function () {
        $scope.totalIOweHim = $scope.getTotalIOweHim();
        $scope.totalHeOwesMe = $scope.getTotalHeOwesMe();
    });
    $scope.filterExpenses = function (value) {
        if (value.by === $scope.friend.email ||
            (value.withFriends.indexOf($scope.friend.email) >= 0 && 
                value.by === $rootScope.authUser.password.email)) {
            return true;
        } else {
            return false;
        }
    };
    $scope.getTotalIOweHim = function () {
        var total = 0;
        $scope.expenses.forEach(function (item) {
            if (item.by === $scope.friend.email &&
                item.withFriends.indexOf($rootScope.authUser.password.email) >= 0) {
                    if (item.withFriends.length === 1 && item.cost < 0) {
                        total += item.cost;
                    } else {
                        total += item.cost / (item.withFriends.length + 1);
                    }
            }
        });
        return total;
    };
    $scope.getTotalHeOwesMe = function () {
        var total = 0;
        $scope.expenses.forEach(function (item) {
            if (item.by === $rootScope.authUser.password.email &&
                item.withFriends.indexOf($scope.friend.email) >= 0) {
                    if (item.withFriends.length === 1 && item.cost < 0) {
                        total += item.cost;
                    } else {
                        total += item.cost / (item.withFriends.length + 1);
                    }
            }
        });
        return total;
    };
    $scope.getCostPerOne = function (expense) {
        if (expense.cost >= 0) {
            return (expense.cost / (expense.withFriends.length + 1));
        } else {
            return expense.cost;
        }
    };
    $scope.getFriendTotalDebt = function (friend) {
        var total = 0;
        $scope.expenses.forEach(function (item) {
            if (item.by === $rootScope.authUser.password.email &&
                item.withFriends.indexOf(friend.email) >= 0) {
                total += item.cost / (item.withFriends.length + 1);
            }
        });
        return total;
    };
    $scope.newReturn = {
        amount: '',
        comment: '',
        friendEmail: ''
    };
    $ionicModal.fromTemplateUrl('templates/modal-addreturn.html', {
        scope: $scope,
        animation: 'slide-in-up',
        cache: false
    }).then(function(modal) {
        $scope.returnModal = modal;
    });
    $scope.openReturnModal = function () {
        $scope.returnModal.show();
        friends.ready(function () {
            $scope.friends = friends.getFriends($rootScope.authUser.password.email);
        });
    };
    $scope.addReturn = function () {
        var withFriends = [];
        if (isNaN($scope.newReturn.amount)) {
            $ionicPopup.alert({
             title: 'Wrong data',
             template: 'Return amount should be a number'
            });
        } else if ($scope.newReturn.amount <= 0.01) {
            $ionicPopup.alert({
             title: 'Wrong data',
             template: 'Return amount should be greater than zero'
            });
        } else {
            if ($scope.newReturn.friendEmail === '') {
                $ionicPopup.alert({
                 title: 'Wrong data',
                 template: 'Friend should be selected!'
                });
            } else {
              $scope.expenses.$add({
                timestamp: Math.floor(Date.now() / 1000),
                by: $rootScope.authUser.password.email,
                comment: $scope.newReturn.comment,
                cost: $scope.newReturn.amount * -1,
                withFriends: [$scope.newReturn.friendEmail]
              });

              $scope.newReturn.amount = '';
              $scope.newReturn.comment = '';
              $scope.newReturn.friendEmail = '';

              $scope.returnModal.hide();
            }
        }
    };
})
.controller('AccountCtrl', function($rootScope, $scope, fireBaseData, $ionicPopup, $state) {
        //Login method
        $scope.login = function (em, pwd) {
            fireBaseData.ref().authWithPassword({
                email    : em,
                password : pwd
            }, function(error, authData) {
                if (error === null) {
                    $scope.showLoginForm = false;
                    $rootScope.authUser = fireBaseData.ref().getAuth();
                    $scope.$apply();

                    $state.go('tab.dash');
                } else {
                    $ionicPopup.alert({
                     title: 'Authorization error',
                     template: error.message
                    });
                }
            }, {
                remember: 'default'
            });
        };
        //Logout method
        $scope.logout = function () {
            fireBaseData.ref().unauth();
            $rootScope.authUser = null;
        };
        $scope.openSignupForm = function () {
            $state.go('tab.signup');
        };
})
.controller('SignupCtrl', function($rootScope, $scope, fireBaseData, $firebaseArray, $ionicPopup, $state) {
        //Checking if user is logged in
        if ($rootScope.authUser) {
            $state.go('tab.account');
        }

        $scope.signup = function (name, em, pwd, pwd2) {
            if (pwd != pwd2) {
                $ionicPopup.alert({
                    title: 'Signup error',
                    template: 'Confirmation password doesn\'t match!'
                });
            } else {
                fireBaseData.ref().createUser({
                    email    : em,
                    password : pwd
                }, function(error, authData) {
                    if (error === null) {
                        $scope.user = fireBaseData.ref().getAuth();
                        $scope.showSignupForm = false;
                        $rootScope.authUser = $scope.user;
                        $scope.$apply();
                        fireBaseData.ref().authWithPassword({
                            email    : em,
                            password : pwd
                        }, function(error, authData) {
                            var users;
                            if (error === null) {
                                $rootScope.authUser = fireBaseData.ref().getAuth();

                                users = $firebaseArray(fireBaseData.refUsers());
                                users.$add({
                                    name: name,
                                    email: em
                                });
                                
                                $state.go('tab.dash');
                            }
                        });
                    } else {
                        $ionicPopup.alert({
                         title: 'Signup error',
                         template: error.message
                        });
                        // console.log("Error authenticating user:", error);

                    }
                });
            }
        };
});