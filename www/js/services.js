/*global Firebase: false*/
(function () {
    'use strict';
    angular.module('starter.services', [])
        .factory('fireBaseData', function () {
            var ref = new Firebase("https://scorching-torch-9009.firebaseIO.com/"),
                refExpenses,
                refUsers,
                refFriends,
                self = {};
            self = {
                ref: function () {
                    return ref;
                },
                refExpenses: function () {
                    return refExpenses;
                },
                refFriends: function () {
                    return refFriends;
                },
                refUsers: function () {
                    return refUsers;
                },
                refInit: function () {
                    refExpenses = new Firebase("https://scorching-torch-9009.firebaseIO.com/expenses");
                    refUsers = new Firebase("https://scorching-torch-9009.firebaseIO.com/users");
                    refFriends = new Firebase("https://scorching-torch-9009.firebaseIO.com/friends");
                }
            };
            self.refInit();
            return self;
        })
        .service('friends', function ($firebaseArray, fireBaseData) {
            var self = {};
            self.list = $firebaseArray(fireBaseData.refFriends());
            self.ready = function (cb) {
                self.list.$loaded().then(function () {
                    cb();
                });
            };

            self.getFriends = function (of) {
                var result = [];
                self.list.forEach(function (item) {
                    if (item.user_email === of) {
                        result.push(item.friend);
                    }
                });
                return result;
            };
            return self;
        })
        .service('users', function ($firebaseArray, fireBaseData) {
            var self = {};
            self.list = $firebaseArray(fireBaseData.refUsers());
            self.getByEmail = function (email) {
                var result = false;
                self.list.forEach(function (item) {
                    if (item.email === email) {
                        result = item;
                    }
                });
                return result;
            };
            return self;
        })
        .service('expenses', function ($firebaseArray, fireBaseData) {
            var self = {};
            self.list = $firebaseArray(fireBaseData.refExpenses());
            return self;
        });
}());