Template.instructorList.helpers ({
	instructors: function() {
		return Instructors.find();
	},
	sortedLessonList: function(lessonID_ary) {
		lessonCursor = Lessons.find({_id: {$in: lessonID_ary}}, {sort: {lessonTime: 1}});
		return lessonCursor;
	},
	getBreaks: function(lessonObj) {
		prevLesson = Lessons.findOne( {
			instructor: lessonObj.instructor,
			lessonTime: {$lt: lessonObj.startTime()},
		}, {sort: {lessonTime: -1}} );
		// prevLesson returns undefined if its the instructors first lesson
		// so we should render breaks based on the first lesson
		// in the whole sets start time
		if (prevLesson === undefined) {
			firstLesson = Lessons.findOne({}, {sort: {lessonTime: 1}});
			var blocks = Fishie.getTimeBlocks(firstLesson.startTime(), lessonObj.startTime());
		} else {
			var blocks = Fishie.getTimeBlocks(prevLesson.endTime(), lessonObj.startTime());
		}
		return blocks;
	}
});
