ApplicationController = RouteController.extend({
	onBeforeAction: function () {
		if (!Meteor.user()) {
			console.log('yay!');
			this.render('createOrSelectSet');
		} else {
			this.next();
		}
	}
});