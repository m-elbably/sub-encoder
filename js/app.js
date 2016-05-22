(function () {
    'use strict';
    var app = angular.module('mApp', [
            'lumx'
        ]
    );

    app.directive('filesList', ['$compile', '$timeout', 'LxDialogService', 'LxProgressService', function($compile, $timeout, LxDialogService, LxProgressService){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                scope.dir = '';
                scope.backup = true;
                scope.selected = 0;
                scope.encoded = 0;
                scope.converted = 0;
                scope.files = [];

                var fs = require('fs');
                var path = require('path');
                var iconv = require("iconv-lite");
                var detect = require('charset-detector');
                var fExt = ['srt', 'sub', 'txt', 'ass', 'ssa'];

                scope.onBrowse = function(file){
                    var dlg = element.find('#openFile');
                    dlg.change(function(e) {
                        var dPath = angular.element(this).val();
                        scope.dir = dPath;

                        fs.readdir(dPath, function (err, files) {
                            if (!err) {
                                var fPath = '';

                                scope.files = [];
                                for(var i=0; i < files.length; i++){
                                    if(fExt.indexOf(files[i].substr(-3)) >= 0){
                                        scope.files.push({
                                            name: files[i],
                                            checked: false,
                                            fullPath: path.join(dPath,files[i])
                                        });
                                    }
                                }

                                scope.$apply();
                                attachEvents();
                            }else {
                                console.log(err);
                            }
                        });
                    });

                    dlg.click();
                };

                scope.onSelectAll = function(){
                    if(scope.files.length <= 0)
                        return;

                    $timeout(function() {
                        scope.selected = 0;
                        for(var i=0; i < scope.files.length; i++){
                            scope.files[i].checked = true;
                            scope.selected++;
                        }
                    }, 0);
                };

                scope.onConvert = function(){
                    if(scope.selected <= 0)
                        return;

                    LxProgressService.linear.show('primary', '#progress');

                    $timeout(function() {
                        var fPath = '';
                        scope.converted = 0;
                        scope.encoded = 0;

                        for(var i=0; i < scope.files.length; i++){
                            fPath = scope.files[i].fullPath;
                            if(!scope.files[i].checked)
                                continue;

                            var result = processFile(fPath);
                            if(result == null){
                                scope.converted++;
                            }

                            scope.files[i].checked = false;
                            scope.selected--;
                        }

                        $timeout(function() {
                            LxProgressService.linear.hide();
                            LxDialogService.open('dlg');
                        },1000);
                    }, 0);
                };

                function processFile(file){
                    var buffer = fs.readFileSync(file);
                    var encoding = detect(buffer);
                    encoding = encoding && encoding.length > 0 ? encoding[0].charsetName : null;

                    if(encoding == null){
                        console.log('Undetected encoding.');
                        return false;
                    }

                    //skip if file is already encoded in utf-8
                    if(encoding.toLowerCase() === 'utf-8'){
                        console.log('File already encoded.');
                        scope.encoded++;
                        return false;
                    }

                    if(scope.backup) {
                        fs.renameSync(file, file + '.bk');
                    }

                    try {
                        var destBuffer = iconv.decode(buffer, encoding.toString());
                        fs.writeFile(file, destBuffer, 'utf-8', function (err) {
                            if (err)
                                return console.log(err);

                        });
                    } catch (err) {
                        return console.log(err);
                    }

                    return null;
                }

                function attachEvents(){
                    element.find('.data-table__selectable-row').bind('click', function (e) {
                        var className = 'data-table__selectable-row--is-selected';
                        var el = angular.element(this);
                        var rIndex = this.rowIndex;

                        if(el.hasClass(className)){
                            scope.files[rIndex].checked = false;
                            el.removeClass(className);
                            $timeout(function() {
                                scope.selected--;
                            });
                        } else {
                            scope.files[rIndex].checked = true;
                            el.addClass(className);
                            $timeout(function() {
                                scope.selected++;
                            });
                        }
                    });
                }

            }
        };
    }]);




})();
