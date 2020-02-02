
print('Creating collection Projects');

logoId = db['fs.files'].findOne({filename: 'project.png'})._id
print('Using GridFS object as the project\'s photo: ' + logoId);

db.projects.insert({
	title: 'Test Project 1',
	id: 'test-project',
	description: 'A very cool test project',
	logoId: logoId,
	published: true,
	links: [
		{ name: 'Website', href: 'https://jtalk.me' },
		{ name: 'Source', href: 'https://github.com' },
		{ name: 'Demo', href: 'https://example.com' }
	]
});
db.projects.insert({
	title: 'Test Project 2',
	id: 'another-test-project',
	description: 'Another very cool test project',
	logoId: '',
	published: false,
	links: [
		{ name: 'Website', href: 'https://jtalk.me' },
		{ name: 'Source', href: 'https://github.com' },
		{ name: 'Demo', href: 'https://example.com' }
	]
});
print('Created collection Projects');