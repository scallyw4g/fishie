Meteor.methods ({
	createLesson: function(lessonID, level, weekdays, startTime, length, swimmers, privateLesson) {
		// TODO VALIDATE WEEKDAY ARRAY
		// Validation
		// FIXME THIS HACK NEEDS TO BE REVISITED
		// FIXME We should use a local variable thats passed between methods so it doesn't pollute global space
		excludeIDs = [];
		check(level, Match.Integer);
		check(startTime, Date);
		check(length, Match.Integer);
		check(swimmers, Match.Integer);
		check(lessonID, Meteor.Collection.ObjectID);
		// Convert the ID object to a string so it parses correctly on insert
		var lessonID_str = lessonID._str;
		// Set the end time to the start time + the length of the lesson
		var endTime = new Date(startTime.toJSON());
		endTime.setMinutes(startTime.getMinutes() + length);
		var lessonTime = Fishie.getTimeBlocks(startTime, endTime, weekdays);
		var maxSwimmers = Fishie.getMaxSwimmers(level);
		lessonObj = Fishie.parseLessonObject(lessonID_str, level, privateLesson, swimmers, maxSwimmers, lessonTime, length);
		// End init + start splitting algo
		var epUp = Fishie.optimizeSplits([lessonObj], lessonObj.levels, 1);
		var epDn = Fishie.optimizeSplits([lessonObj], lessonObj.levels, -1);
		var shortPath;
		var longPath;
		// console.log('opt finished');
		// console.log(epUp);
		// console.log(epDn);
		if (!epUp && !epDn) {
			// If we didn't find a path to split with insert a new lesson
			Lessons.insert (
				lessonObj
			);
			// Find or create an instructor for the lesson
			Fishie.scheduleLesson(lessonID_str);
			//
			// Otherwise.. this.. monstrosity
		} else if (!epUp && epDn) {
			shortPath = epDn;
		} else if (epUp && !epDn) {
			shortPath = epUp;
		} else if (epUp && epDn) {
			if (epUp.length > epDn.length) {
				shortPath = epDn;
				longPath = epUp;
			} else {
				shortPath = epUp;
				longPath = epDn;
			}
		}
		// Try to condense the shortest path, if it fails for any reason
		// try and condense the longer path. If both condense attempts fail
		// then create a new lesson.
		if (shortPath) {
			var condensed = false;
			try {
				condensed = Fishie.condenseLessons(shortPath, lessonID_str);
			}
			catch(err) {
				if (err.message == "Invalid lesson sizes in path") {
					console.log(err.message);
				} else {
					console.log(err.message);
					console.log(err.stack);
				}
			}
			if (!condensed) {
				try{
					condensed = Fishie.condenseLessons(longPath, lessonID_str);
				}
				catch(err) {
					if (err.message == "Invalid lesson sizes in path") {
						console.log(err.message);
					} else {
						console.log(err.message);
						console.log(err.stack);
					}
				}
			}
			if (!condensed) {
					// If we didn't find a path to split with insert a new lesson
				Lessons.insert (
					lessonObj
				);
				// Find or create an instructor for the lesson
				Fishie.scheduleLesson(lessonID_str);
				//
			}
		}
	},
});