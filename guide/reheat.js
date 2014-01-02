docsApp.directive.documentationGroupList = function($timeout) {
	return {
		restrict: 'E',
		replace: true,
		template: [
			'<div class="documentation-groups">',
			'<div ng-repeat="group in docGroups" class="documentation-group" ng-show="group.visible">',
			'<h2><i class="{{group.groupIcon}} icon-white"></i> {{group.title}} </h2>',
			'<div class="documentation-group-info sidenav">',
			'<ul class="list-group nav">',
			'<li ng-repeat="section in group.sections" class="documentation-group-section list-group-item">',
			'<a href="{{section.url}}">{{section.title}} <i class="icon-chevron-right"></i></a>',
			'</li>',
			'</ul>',
			'</div>',
			'</div>',
			'</div>'
		].join(''),
		link: function(scope, element, attrs) {
			scope.docGroups = scope.$parent.docGroups;
		}
	};
};

docsApp.directive.viewSource = function ($timeout, $compile) {
	return {
		restrict: 'E',
		replace: true,
		template: [
			'<div class="view-source" ng-show="currentSource.source">',
			'<span class="btn btn-danger"><i class="icon-spinner icon-spin"></i><i class="icon-eye-open"></i> view source</span>',
			'</div>'
		].join(''),
		link: function(scope, element, attrs) {

			element.bind('click', function(){

				element.addClass('loading');

				scope.lastOffset = $(window).scrollTop();

				var highlight = "";
				var glue = "";
				for(var i=0; i < scope.currentSource.codeBlocks.length; i++) {
					highlight = highlight + glue + scope.currentSource.codeBlocks[i].lineStart + '-' + scope.currentSource.codeBlocks[i].lineEnd;
					glue = ",";
				}

				//let's determine if this is a doc file that doesn't need syntax highlighting
				var language = "";
				var contentURL = scope.currentSource.source.contentURL;
				if(contentURL.indexOf('.doc.txt') != -1 || contentURL.indexOf('.ngdoc.txt') != -1 || contentURL.indexOf('.md.txt') != -1){
					language = "lang-doc";
				}

				$.ajax({
					url: scope.currentSource.source.contentURL,
					success: function (content) {
						var sourceContent = '<pre class="prettyprint linenums '+ language +'" prettyprint-highlight="'+highlight+'">' + content.replace(/\</gi,'&lt;').replace(/\>/gi,'&gt;') + '</pre>';
						scope.lastMode = scope.mode;
						scope.mode = "show-source";
						scope.currentSourceContent = $compile( sourceContent )( scope );
						scope.$apply();
						element.removeClass('loading');
					},
					error: function () {
						element.removeClass('loading');
					}
				});

			});
		}
	};
};
