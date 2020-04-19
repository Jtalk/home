
print('Creating collection Owner');

photoId = db['fs.files'].findOne({filename: 'avatar.png'})._id
print('Using GridFS object as the owner\'s photo: ' + photoId);

db.owner.insert({
	name: 'Vasya Pupkin',
	nickname: 'pupkivas',
	description: 'A very cool guy with his own website',
	photoId: photoId,
	bio: '# A very cool guy.\n\nHe has his very own ~~website~~ right here?\n\n<InfoMessage header={Cool header}>Some big text</InfoMessage>\n\nMore description etc.',
	contacts: {
		email: { contactType: 'email', value: 'pupkivas@example.com' },
		skype: { contactType: 'skype', value: 'pupkivas' },
		twitter: { contactType: 'twitter', value: '@pupkivas' }
	}
});
print('Created collection Owner');