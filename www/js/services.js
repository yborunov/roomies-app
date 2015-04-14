angular.module('starter.services', [])
/**
 * A simple example service that returns some data.
 */
.factory('fireBaseData', function($firebase) {
  var ref = new Firebase("https://scorching-torch-9009.firebaseIO.com/"),
      refExpenses = new Firebase("https://scorching-torch-9009.firebaseIO.com/expenses"),
      refRoomMates = new Firebase("https://scorching-torch-9009.firebaseIO.com/room-mates");
  return {
    ref: function () {
      return ref;
    },
    refExpenses: function () {
      return refExpenses;
    },
    refRoomMates: function () {
      return refRoomMates;
    }
  }
});