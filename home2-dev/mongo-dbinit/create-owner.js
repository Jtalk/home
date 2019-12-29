
print('Creating collection Owner')
db.createCollection('owner');
db.owner.insert({
	name: 'Vasya Pupkin',
	nickname: 'pupkivas',
	description: 'A very cool guy with his own website',
	photoId: '',
	bio: 'A very cool guy.\nHe has his very own website right here!',
	contacts: [
		{ contactType: 'EMAIL', value: 'pupkivas@example.com' },
		{ contactType: 'SKYPE', value: 'pupkivas' },
		{ contactType: 'TWITTER', value: '@pupkivas' }
	]

});
print('Collection Owner created')
