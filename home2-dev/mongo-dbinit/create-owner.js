
print('Creating collection Owner');

photoId = db['fs.files'].findOne({filename: 'avatar.png'})._id
print('Using GridFS object as the owner\'s photo: ' + photoId);

db.owner.createIndex({
	name: "text",
	nickname: "text",
	description: "text",
	bio: "text",
	contacts: "text",
}, {
	weights: {
		name: 2,
		nickname: 2
	}
})
db.owner.insert({
	name: 'Vasya Pupkin',
	nickname: 'pupkivas',
	description: 'A very cool guy with his own website',
	photoId: photoId,
	updated: "2020-05-01T12:00:00Z",
	bio: '# A very cool guy.\n\nHe has his very own ~~website~~ right here?\n\n<InfoMessage header={Cool header}>Some big text</InfoMessage>\n\nMore description etc.',
	contacts: {
		email: { contactType: 'email', value: 'pupkivas@example.com' },
		skype: { contactType: 'skype', value: 'pupkivas' },
		twitter: { contactType: 'twitter', value: '@pupkivas' }
	},
	atomId: "3a602278-d1f7-4c17-be73-0985d5be979b"
});
print('Created collection Owner');