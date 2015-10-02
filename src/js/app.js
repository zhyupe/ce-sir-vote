if (!window.localStorage) {
  alert('您的浏览器不支持 localStorage，无法使用此程序');
} else {
  var delegate = {}, voteData = {};
  try {
    voteData = JSON.parse(window.localStorage.voteData);
  }
  catch (e) {}
  var fetch = function (key, defaultVal) {
    if (!voteData[key] || typeof voteData[key] != typeof defaultVal) {
      voteData[key] = defaultVal;
    }
    return voteData[key];
  };

  var saveData = function () {
    try {
      window.localStorage.voteData = JSON.stringify(voteData);
    }
    catch (e) {
      delegate.mdAlert('数据保存失败', '数据保存失败，请尝试重新进行操作<br>如果您存储的投票数据过多，也可能导致此错误。您可以通过清空已完成的投票或删除部分进行中的投票来释放存储空间');
    }
  };
  var app = angular.module('CESirVote', ['ngMaterial', 'ngRoute', 'ngMessages', 'templates-dist'])
    .config(['$mdThemingProvider', function($mdThemingProvider) {
      $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('indigo');
    }])
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.
        when('/', {templateUrl: 'view/index.html', controller: 'IndexCtrl'}).
        when('/active', {templateUrl: 'view/active.html', controller: 'ActiveCtrl'}).
        when('/finished', {templateUrl: 'view/finished.html', controller: 'FinishedCtrl'}).
        when('/new', {templateUrl: 'view/new.html', controller: 'NewCtrl'}).
        when('/vote/:voteId', {templateUrl: 'view/vote.html', controller: 'VoteCtrl'}).
        when('/about', {templateUrl: 'view/about.html', controller: 'AboutCtrl'}).
        otherwise({redirectTo: '/'});
    }])
    .run(['$rootScope', '$mdDialog', function($rootScope, $mdDialog) {
      $rootScope.fetch = fetch;

      var loading = false;
      delegate.setTitle = function (title) {
        $rootScope.title = title;
      };
      delegate.mdAlert = function (title, content) {
        return $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(title)
            .content(content)
            .ok('确定')
        );
      };
      delegate.mdLoading = function () {
        if (loading) {
          return true;
        }

        $mdDialog.show($mdDialog.alert({
          escapeToClose: false,
          template: '<md-dialog><div layout="row"><md-progress-circular md-mode="indeterminate" md-diameter="40px"></md-progress-circular><p style="line-height:100px;margin:0 40px 0 10px">载入中，请稍候 ...</p></div></md-dialog>'
        }));

        loading = true;
      };
      delegate.mdLoaded = function () {
        $mdDialog.hide();
        loading = false;
      };
    }]);

  app.controller('GlobalCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };
    $scope.standalone = !!navigator.standalone;
  }]);

  app.controller('IndexCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
    delegate.setTitle('');

    $scope.activeCount = fetch('activeCount', 0);
    $scope.finishedCount = fetch('finishedCount', 0);

    $scope.clearVote = function () {
      $mdDialog.show($mdDialog.confirm()
        .title('删除确认')
        .content('你确定要清空投票数据吗？<br>此操作将无法撤销')
        .ok('确定')
        .cancel('算了')).then(function() {
        voteData = {};
        saveData();
      }, function () {});
    };
  }]);

  app.controller('ActiveCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
    delegate.setTitle('进行中的投票');

    $scope.removeVote = function (id) {
      $mdDialog.show($mdDialog.confirm()
        .title('删除确认')
        .content('你确定要删除此投票吗？<br>此操作将无法撤销')
        .ok('确定')
        .cancel('算了')).then(function() {
        var votes = fetch('votes', []);
        for (var i=0; i<votes.length; i++) {
          if (votes[i].id === id) {
            votes.splice(i, 1);
            saveData();
            break;
          }
        }
      }, function () {});
    };
  }]);

  app.controller('FinishedCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
    delegate.setTitle('已完成的投票');

    $scope.removeVote = function (id) {
      $mdDialog.show($mdDialog.confirm()
        .title('删除确认')
        .content('你确定要删除此投票吗？<br>此操作将无法撤销')
        .ok('确定')
        .cancel('算了')).then(function() {
        var votes = fetch('votes', []);
        for (var i=0; i<votes.length; i++) {
          if (votes[i].id === id) {
            votes.splice(i, 1);
            saveData();
            break;
          }
        }
      }, function () {});
    };
  }]);

  app.controller('AboutCtrl', ['$scope', function ($scope) {
    delegate.setTitle('关于 & 帮助');
  }]);

  app.controller('NewCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    delegate.setTitle('新投票');

    $scope.vote = {
      options: []
    };

    $scope.formSubmit = function () {
      if ($scope.vote.options.length < $scope.vote.max) {
        delegate.mdAlert('提示信息', '最多可选数 不能大于 选项数');
        return;
      }

      if ($scope.vote.max < $scope.vote.min) {
        delegate.mdAlert('提示信息', '最多可选数 不能小于 最小可选数');
        return;
      }

      if (delegate.mdLoading()) {
        return;
      }

      $timeout(function () {
        $scope.vote.id = Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 8);
        $scope.vote.result = [];

        for (var i=0;i<$scope.vote.options.length;i++) {
          $scope.vote.result.push({
            option: $scope.vote.options[i],
            vote: 0
          });
        }

        $scope.vote.list = [];
        $scope.vote.finished = false;

        fetch('votes', []).push($scope.vote);
        voteData.activeCount = fetch('activeCount', 0)+1;

        saveData();
        delegate.mdLoaded();
        window.location.hash = '#/vote/' + $scope.vote.id;
      }, 10);
    };
  }]);

  app.controller('VoteCtrl', ['$scope', '$routeParams', '$mdDialog', '$timeout', function ($scope, $routeParams, $mdDialog, $timeout) {
    var id = $routeParams.voteId;
    var votes = fetch('votes', []);
    for (var i=0; i<votes.length; i++) {
      if (votes[i].id === id) {
        $scope.item = votes[i];
        break;
      }
    }

    if (!$scope.item) {
      delegate.mdAlert('内容不存在', '您所请求的投票不存在').then(function () { window.location.hash='#/'; });
    } else {
      delegate.setTitle('投票详情');

      $scope.voteNumber = 0;
      $scope.voteTimeout = false;

      $scope.option = function (item) {
        return $scope.item.options[item];
      };

      var addData = function (data) {
        var content = '您确定';
        if (data.length > 0) {
          content += '把票投给 ';
          for (var i=0;i<data.length;i++) {
            if (i > 0) {content += ', ';}
            content += $scope.option(data[i]);
          }
        } else {
          content += ' <u>弃权</u>';
        }
        content += ' 吗？';
        $mdDialog.show($mdDialog.confirm()
          .title('选项确认')
          .content(content)
          .ok('确定')
          .cancel('再考虑一下')).then(function() {
          if (delegate.mdLoading()) {
            return;
          }
          $timeout(function () {
            $scope.item.list.push(data);
            $scope.voteNumber = $scope.item.list.length;
            for (var i=0;i<data.length; i++) {
              $scope.item.result[data[i]].vote++;
            }

            saveData();
            delegate.mdLoaded();
            $timeout(function () {
              $scope.voteTimeout = true;
            }, 3000);
          }, 10);
        }, function() {});
      };

      var checkFinish = function () {
        $scope.voteNumber = 0;
        $scope.voteTimeout = false;

        if ($scope.item.list.length === $scope.item.count) {
          $scope.item.finished = true;

          voteData.activeCount   = fetch('activeCount', 0)-1;
          voteData.finishedCount = fetch('finishedCount', 0)+1;
          saveData();
        }
      };

      if ($scope.item.max === 1) {
        $scope.selected = [-1];
        $scope.submit = function () {
          if ($scope.item.min === 1 && $scope.selected[0] < 0 ||
            $scope.item.min === 0 && $scope.selected[0] < -1) {
            delegate.mdAlert('提示信息', '请选择 1 个选项！');
            return;
          }

          if ($scope.selected[0] === -1) {
            addData([]);
          } else {
            addData([$scope.selected[0]]);
          }

        };

        $scope.newVote = function () {
          checkFinish();
          $scope.selected = [-1];
        };
      } else {
        var selected = [];

        $scope.exists = function (item) {
          return selected.indexOf(item) > -1;
        };
        $scope.toggle = function (item) {
          var idx = selected.indexOf(item);
          if (idx > -1) {
            selected.splice(idx, 1);
          } else {
            selected.push(item);
          }
        };
        $scope.submit = function () {
          if (selected.length > $scope.item.max ||
            selected.length < $scope.item.min) {
            delegate.mdAlert('提示信息', '请选择 '+($scope.item.max === $scope.item.min ? '' : $scope.item.min+' ~ ')+$scope.item.max+' 个选项！');
            return;
          }

          addData(selected);
        };

        $scope.newVote = function () {
          checkFinish();
          selected.length = 0;
        };
      }
    }
  }]);
}