Template.timeHeader.helpers({
	timeBlock: function() {
		var firstLesson = Lessons.findOne({}, {sort: {lessonTime: 1}});
		var lastLesson = Lessons.findOne({}, {sort: {lessonTime: -1}});
		if (firstLesson) {
			var firstTime = firstLesson.lessonTime[0];
			var lastTime = lastLesson.endTime();
			blocks = Fishie.getTimeBlocks(firstTime, lastTime);
			return blocks;
		}
	},
	sanitizeHeaderTime: function(timeObj) {
		var minutes = timeObj.getMinutes();
		var hours = timeObj.getHours();
		var amPm = ' AM';
		if (minutes == 0) {
			minutes = '00';
		}
		if (hours > 12) {
			hours = hours - 12;
			amPm = ' PM';
		}
		saneTime = hours + ":" + minutes + amPm;
		return saneTime;
	}
});