
print('Creating collection Owner');

photoId = db['fs.files'].findOne({filename: 'avatar.png'})._id
print('Using GridFS object as the owner\'s photo: ' + photoId);

db.owner.insert({
	name: 'Vasya Pupkin',
	nickname: 'pupkivas',
	description: 'A very cool guy with his own website',
	photoId: photoId,
	bio: 'A very cool guy.\nHe has his very own website right here!',
	contacts: [
		{ contactType: 'EMAIL', value: 'pupkivas@example.com' },
		{ contactType: 'SKYPE', value: 'pupkivas' },
		{ contactType: 'TWITTER', value: '@pupkivas' }
	]
});
print('Created collection Owner');